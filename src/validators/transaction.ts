import { z } from "zod";

export const transactionFormSchema = z.object({
  description: z
    .string()
    .min(2, "Deskripsi minimal 2 karakter")
    .max(200, "Deskripsi maksimal 200 karakter"),
  type: z.enum(["IN", "OUT"], {
    required_error: "Jenis transaksi wajib dipilih",
  }),
  amount: z
    .string()
    .min(1, "Jumlah wajib diisi")
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Jumlah harus lebih dari 0")),
  transactionDate: z.string().min(1, "Tanggal transaksi wajib diisi"),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
