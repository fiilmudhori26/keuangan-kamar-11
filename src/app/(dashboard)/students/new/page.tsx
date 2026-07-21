"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentFormSchema, type StudentFormValues } from "@/validators/student";
import { createStudent } from "@/actions/students";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      fullName: "",
      roomNumber: "",
      initialBalance: "0",
    },
  });

  const initialBalance = watch("initialBalance");

  async function onSubmit(data: StudentFormValues) {
    setLoading(true);
    try {
      const result = await createStudent(
        data.fullName,
        data.roomNumber,
        parseFloat(data.initialBalance || "0") || 0
      );

      if (result.success) {
        toast.success("Santri berhasil ditambahkan", {
          description: `${data.fullName} telah terdaftar`,
        });
        router.push("/students");
      } else {
        toast.error(result.error || "Gagal menambahkan santri");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Tambah Santri"
        description="Tambahkan data santri baru"
        action={
          <Link href="/students">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        }
      />

      <Card className="max-w-2xl animate-fade-in">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Santri *</Label>
              <Input
                id="fullName"
                placeholder="Masukkan nama lengkap santri"
                disabled={loading}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">Nomor Kamar *</Label>
              <Input
                id="roomNumber"
                placeholder="Contoh: 11"
                disabled={loading}
                {...register("roomNumber")}
              />
              {errors.roomNumber && (
                <p className="text-xs text-destructive">
                  {errors.roomNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialBalance">
                Saldo Awal{" "}
                <span className="text-muted-foreground font-normal">
                  (opsional)
                </span>
              </Label>
              <CurrencyInput
                id="initialBalance"
                value={initialBalance || "0"}
                onChange={(v) => setValue("initialBalance", v)}
                disabled={loading}
              />
              {errors.initialBalance && (
                <p className="text-xs text-destructive">
                  {errors.initialBalance.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan
              </Button>
              <Link href="/students">
                <Button type="button" variant="outline" disabled={loading}>
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
