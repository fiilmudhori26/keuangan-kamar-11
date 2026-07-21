"use client";

import { useCallback, useRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

function formatRupiah(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

function unformatRupiah(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number>(0);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? 0;

    const digitsBefore = unformatRupiah(raw.substring(0, cursor));
    const formatted = formatRupiah(raw);

    onChange(unformatRupiah(formatted));
    const digitsAfter = unformatRupiah(formatted.substring(0, cursor));

    requestAnimationFrame(() => {
      if (inputRef.current) {
        const newPos = formatted.length - (digitsBefore.length - digitsAfter.length);
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    });
  }, [onChange]);

  const displayValue = value ? `Rp ${formatRupiah(value)}` : "";

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={cn("pl-7", className)}
        {...props}
      />
      {!displayValue && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/40 select-none">
          Rp 0
        </span>
      )}
    </div>
  );
}

export function formatNumberInput(value: string): string {
  return formatRupiah(value);
}

export function parseNumberInput(value: string): number {
  const cleaned = value.replace(/\D/g, "");
  return cleaned ? Number(cleaned) : 0;
}
