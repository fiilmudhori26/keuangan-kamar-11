import { z } from "zod";

export const guardianFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama wali minimal 2 karakter")
    .max(100, "Nama wali maksimal 100 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .min(1, "Email wajib diisi"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(72, "Password maksimal 72 karakter"),
  studentId: z.string().uuid("Santri wajib dipilih"),
});

export const guardianEditSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama wali minimal 2 karakter")
    .max(100, "Nama wali maksimal 100 karakter"),
  studentId: z.string().uuid("Santri wajib dipilih"),
});

export type GuardianFormValues = z.infer<typeof guardianFormSchema>;
export type GuardianEditValues = z.infer<typeof guardianEditSchema>;
