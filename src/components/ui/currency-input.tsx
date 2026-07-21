"use client";

import { useRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

function fmt(v: string): string {
  const d = v.replace(/\D/g, "");
  return d ? Number(d).toLocaleString("id-ID") : "";
}

export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [focus, setFocus] = useState(false);

  const display = value ? fmt(value) : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? 0;

    const digitCount = raw.slice(0, cursor).replace(/\D/g, "").length;
    const digits = raw.replace(/\D/g, "");

    onChange(digits);

    setTimeout(() => {
      const el = ref.current;
      if (!el || !digits) return;
      const formatted = fmt(digits);
      let pos = 0;
      for (let seen = 0; seen < digitCount; pos++) {
        if (formatted[pos] >= "0" && formatted[pos] <= "9") seen++;
      }
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/70 select-none z-10">
        Rp
      </span>
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className={cn("pl-10", className)}
        {...props}
      />
      {!display && !focus && (
        <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/30 select-none">
          0
        </span>
      )}
    </div>
  );
}
