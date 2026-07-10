import { z } from "zod";

export const studentFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama santri minimal 2 karakter")
    .max(100, "Nama santri maksimal 100 karakter"),
  roomNumber: z
    .string()
    .min(1, "Nomor kamar wajib diisi")
    .max(20, "Nomor kamar maksimal 20 karakter"),
  initialBalance: z
    .string()
    .optional(),
});

export const studentEditSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama santri minimal 2 karakter")
    .max(100, "Nama santri maksimal 100 karakter"),
  roomNumber: z
    .string()
    .min(1, "Nomor kamar wajib diisi")
    .max(20, "Nomor kamar maksimal 20 karakter"),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
export type StudentEditValues = z.infer<typeof studentEditSchema>;
