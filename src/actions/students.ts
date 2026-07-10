"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { ActionResponse, PaginatedResponse, StudentData } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Verify that the current user has the pengurus role.
 * Returns user ID if authorized, throws if not.
 */
async function requirePengurus(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "pengurus") throw new Error("Forbidden");
  return user.id;
}

export async function getStudents(
  page: number = 1,
  search: string = "",
  pageSize: number = ITEMS_PER_PAGE
): Promise<PaginatedResponse<StudentData>> {
  await requirePengurus();

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
      orderBy: { createdAt: "desc" },
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

export async function getStudentById(
  id: string
): Promise<ActionResponse<StudentData>> {
  await requirePengurus();

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

export async function createStudent(
  fullName: string,
  roomNumber: string,
  initialBalance: number = 0
): Promise<ActionResponse<StudentData>> {
  await requirePengurus();

  try {
    const student = await prisma.student.create({
      data: {
        fullName,
        roomNumber,
        currentBalance: initialBalance,
      },
    });

    // If there's an initial balance, create an initial transaction
    if (initialBalance > 0) {
      await prisma.transaction.create({
        data: {
          studentId: student.id,
          transactionDate: new Date(),
          description: "Saldo awal",
          type: "IN",
          amount: initialBalance,
          balanceAfter: initialBalance,
        },
      });
    }

    revalidatePath("/students");
    revalidatePath("/dashboard");

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
  } catch (error) {
    console.error("Error creating student:", error);
    return { success: false, error: "Gagal menambahkan santri" };
  }
}

export async function updateStudent(
  id: string,
  fullName: string,
  roomNumber: string
): Promise<ActionResponse<StudentData>> {
  await requirePengurus();

  try {
    const student = await prisma.student.update({
      where: { id },
      data: { fullName, roomNumber },
    });

    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    revalidatePath("/dashboard");

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
  } catch (error) {
    console.error("Error updating student:", error);
    return { success: false, error: "Gagal mengupdate santri" };
  }
}

export async function deleteStudent(
  id: string
): Promise<ActionResponse> {
  await requirePengurus();

  try {
    await prisma.student.delete({
      where: { id },
    });

    revalidatePath("/students");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, error: "Gagal menghapus santri" };
  }
}

export async function getAllStudentsSimple() {
  await requirePengurus();

  const students = await prisma.student.findMany({
    select: { id: true, fullName: true, roomNumber: true },
    orderBy: { fullName: "asc" },
  });

  return students;
}
