"use server";

import { prisma } from "@/lib/prisma";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { startOfToday, startOfWeek, startOfMonth } from "@/lib/utils";
import type { ActionResponse, PaginatedResponse, TransactionData, DateFilterType } from "@/types";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { requirePengurus } from "@/lib/auth";

export async function createTransaction(
  studentId: string,
  description: string,
  type: "IN" | "OUT",
  amount: number,
  transactionDate: string
): Promise<ActionResponse<TransactionData>> {
  await requirePengurus();

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { currentBalance: true },
      });

      if (!student) throw new Error("Santri tidak ditemukan");

      const currentBalance = Number(student.currentBalance);

      if (type === "OUT" && amount > currentBalance) {
        throw new Error(
          `Saldo tidak mencukupi. Saldo saat ini: Rp ${currentBalance.toLocaleString("id-ID")}`
        );
      }

      const balanceAfter =
        type === "IN" ? currentBalance + amount : currentBalance - amount;

      const transaction = await tx.transaction.create({
        data: {
          studentId,
          description,
          type,
          amount,
          balanceAfter,
          transactionDate: new Date(transactionDate),
        },
      });

      await tx.student.update({
        where: { id: studentId },
        data: { currentBalance: balanceAfter },
      });

      return transaction;
    });

    revalidatePath(`/students/${studentId}`);
    revalidatePath("/students");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: result.id,
        studentId: result.studentId,
        transactionDate: result.transactionDate,
        description: result.description,
        type: result.type as "IN" | "OUT",
        amount: Number(result.amount),
        balanceAfter: Number(result.balanceAfter),
        createdAt: result.createdAt,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan transaksi";
    return { success: false, error: message };
  }
}

export async function deleteTransaction(
  transactionId: string
): Promise<ActionResponse> {
  await requirePengurus();

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) throw new Error("Transaksi tidak ditemukan");

      const amount = Number(transaction.amount);
      const balanceAdjustment =
        transaction.type === "IN" ? -amount : amount;

      await tx.student.update({
        where: { id: transaction.studentId },
        data: { currentBalance: { increment: balanceAdjustment } },
      });

      await tx.transaction.delete({
        where: { id: transactionId },
      });

      return transaction;
    });

    revalidatePath("/transactions");
    revalidatePath(`/students/${result.studentId}`);
    revalidatePath("/students");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus transaksi";
    return { success: false, error: message };
  }
}

export async function getTransactions(
  page: number = 1,
  dateFilter: DateFilterType = "month",
  customFrom?: string,
  customTo?: string,
  studentId?: string,
  pageSize: number = ITEMS_PER_PAGE
): Promise<PaginatedResponse<TransactionData & { student?: { fullName: string; roomNumber: string } }>> {
  await requirePengurus();

  let dateFrom: Date | undefined;
  const dateTo = new Date();

  switch (dateFilter) {
    case "today":
      dateFrom = startOfToday();
      break;
    case "week":
      dateFrom = startOfWeek();
      break;
    case "month":
      dateFrom = startOfMonth();
      break;
    case "custom":
      dateFrom = customFrom ? new Date(customFrom) : undefined;
      if (customTo) {
        const to = new Date(customTo);
        to.setHours(23, 59, 59, 999);
        dateTo.setTime(to.getTime());
      }
      break;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (studentId) {
    where.studentId = studentId;
  }

  if (dateFrom) {
    where.transactionDate = {
      gte: dateFrom,
      lte: dateTo,
    };
  }

  const skip = (page - 1) * pageSize;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        student: {
          select: { fullName: true, roomNumber: true },
        },
      },
      orderBy: { transactionDate: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions.map((t: typeof transactions[number]) => ({
      id: t.id,
      studentId: t.studentId,
      transactionDate: t.transactionDate,
      description: t.description,
      type: t.type as "IN" | "OUT",
      amount: Number(t.amount),
      balanceAfter: Number(t.balanceAfter),
      createdAt: t.createdAt,
      student: t.student
        ? { fullName: t.student.fullName, roomNumber: t.student.roomNumber }
        : undefined,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getStudentTransactions(
  studentId: string,
  page: number = 1,
  dateFilter: DateFilterType = "month",
  customFrom?: string,
  customTo?: string,
  pageSize: number = ITEMS_PER_PAGE
): Promise<PaginatedResponse<TransactionData>> {
  return getTransactions(page, dateFilter, customFrom, customTo, studentId, pageSize);
}

export async function getDashboardStats() {
  await requirePengurus();

  const today = startOfToday();
  const monthStart = startOfMonth();

  const [totalStudents, totalBalanceResult, transactionsToday, transactionsThisMonth] =
    await Promise.all([
      prisma.student.count(),
      prisma.student.aggregate({
        _sum: { currentBalance: true },
      }),
      prisma.transaction.count({
        where: { transactionDate: { gte: today } },
      }),
      prisma.transaction.count({
        where: { transactionDate: { gte: monthStart } },
      }),
    ]);

  return {
    totalStudents,
    totalBalance: Number(totalBalanceResult._sum.currentBalance || 0),
    transactionsToday,
    transactionsThisMonth,
  };
}

export async function getRecentTransactions(limit: number = 5) {
  await requirePengurus();

  const transactions = await prisma.transaction.findMany({
    include: {
      student: {
        select: { fullName: true, roomNumber: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return transactions.map((t: typeof transactions[number]) => ({
    id: t.id,
    studentId: t.studentId,
    transactionDate: t.transactionDate,
    description: t.description,
    type: t.type as "IN" | "OUT",
    amount: Number(t.amount),
    balanceAfter: Number(t.balanceAfter),
    createdAt: t.createdAt,
    student: t.student
      ? { fullName: t.student.fullName, roomNumber: t.student.roomNumber }
      : undefined,
  }));
}
