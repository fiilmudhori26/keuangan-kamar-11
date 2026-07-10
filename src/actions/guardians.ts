"use server";

import { prisma } from "@/lib/prisma";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { ActionResponse, PaginatedResponse, GuardianStudentData } from "@/types";
import { revalidatePath } from "next/cache";

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

export async function getGuardians(
  page: number = 1,
  search: string = "",
  pageSize: number = ITEMS_PER_PAGE
): Promise<PaginatedResponse<GuardianStudentData>> {
  await requirePengurus();

  const skip = (page - 1) * pageSize;

  // Get guardian profiles with their linked students
  const where: Record<string, unknown> = {
    guardian: { role: "wali" },
  };

  if (search) {
    where.guardian = {
      role: "wali",
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [guardianStudents, total] = await Promise.all([
    prisma.guardianStudent.findMany({
      where,
      include: {
        guardian: true,
        student: true,
      },
      orderBy: { guardian: { fullName: "asc" } },
      skip,
      take: pageSize,
    }),
    prisma.guardianStudent.count({ where }),
  ]);

  return {
    data: guardianStudents.map((gs: typeof guardianStudents[number]) => ({
      id: gs.id,
      guardianId: gs.guardianId,
      studentId: gs.studentId,
      guardian: {
        id: gs.guardian.id,
        fullName: gs.guardian.fullName,
        email: gs.guardian.email,
        role: gs.guardian.role as "wali",
        createdAt: gs.guardian.createdAt,
      },
      student: {
        id: gs.student.id,
        fullName: gs.student.fullName,
        roomNumber: gs.student.roomNumber,
        currentBalance: Number(gs.student.currentBalance),
        createdAt: gs.student.createdAt,
        updatedAt: gs.student.updatedAt,
      },
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createGuardian(
  fullName: string,
  email: string,
  password: string,
  studentId: string
): Promise<ActionResponse> {
  await requirePengurus();

  try {
    // 1. Create the auth user via Supabase Admin API
    const supabaseAdmin = await createAdminClient();

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: "wali",
        },
      });

    if (authError) {
      if (authError.message.includes("already")) {
        return { success: false, error: "Email sudah terdaftar" };
      }
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Gagal membuat akun wali" };
    }

    // 2. The trigger will auto-create the profile.
    // 3. Link guardian to student
    await prisma.guardianStudent.create({
      data: {
        guardianId: authData.user.id,
        studentId,
      },
    });

    revalidatePath("/guardians");

    return { success: true };
  } catch (error) {
    console.error("Error creating guardian:", error);
    return { success: false, error: "Gagal membuat akun wali" };
  }
}

export async function updateGuardian(
  guardianId: string,
  fullName: string,
  studentId: string
): Promise<ActionResponse> {
  await requirePengurus();

  try {
    // Update the profile name
    await prisma.profile.update({
      where: { id: guardianId },
      data: { fullName },
    });

    // Update the guardian-student link
    await prisma.guardianStudent.updateMany({
      where: { guardianId },
      data: { studentId },
    });

    revalidatePath("/guardians");
    return { success: true };
  } catch (error) {
    console.error("Error updating guardian:", error);
    return { success: false, error: "Gagal mengupdate wali" };
  }
}

export async function deleteGuardian(
  guardianId: string
): Promise<ActionResponse> {
  await requirePengurus();

  try {
    // 1. Delete guardian-student link
    await prisma.guardianStudent.deleteMany({
      where: { guardianId },
    });

    // 2. Delete the profile
    await prisma.profile.delete({
      where: { id: guardianId },
    });

    // 3. Delete the auth user
    const supabaseAdmin = await createAdminClient();
    await supabaseAdmin.auth.admin.deleteUser(guardianId);

    revalidatePath("/guardians");
    return { success: true };
  } catch (error) {
    console.error("Error deleting guardian:", error);
    return { success: false, error: "Gagal menghapus wali" };
  }
}
