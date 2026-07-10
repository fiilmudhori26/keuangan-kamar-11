import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .min(1, "Email wajib diisi"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
