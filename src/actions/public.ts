"use server";

import { prisma } from "@/lib/prisma";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { ActionResponse, PaginatedResponse, StudentData } from "@/types";

export async function getPublicStudents(
  page: number = 1,
  search: string = "",
  pageSize: number = ITEMS_PER_PAGE
): Promise<PaginatedResponse<StudentData>> {
  const skip = (page - 1) * pageSize;
  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { roomNumber: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { fullName: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  return {
    data: students.map((s: typeof students[number]) => ({
      id: s.id,
      fullName: s.fullName,
      roomNumber: s.roomNumber,
      currentBalance: Number(s.currentBalance),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPublicStudentDetails(
  id: string
): Promise<ActionResponse<StudentData>> {
  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    return { success: false, error: "Santri tidak ditemukan" };
  }

  return {
    success: true,
    data: {
      id: student.id,
      fullName: student.fullName,
      roomNumber: student.roomNumber,
      currentBalance: Number(student.currentBalance),
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    },
  };
}

export async function getPublicStudentTransactions(
  studentId: string,
  page: number = 1,
  pageSize: number = 50
) {
  const skip = (page - 1) * pageSize;
  
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { studentId },
      orderBy: { transactionDate: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.transaction.count({ where: { studentId } }),
  ]);

  return {
    data: transactions.map((t: any) => ({
      id: t.id,
      studentId: t.studentId,
      transactionDate: t.transactionDate,
      description: t.description,
      type: t.type,
      amount: Number(t.amount),
      balanceAfter: Number(t.balanceAfter),
      createdAt: t.createdAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
