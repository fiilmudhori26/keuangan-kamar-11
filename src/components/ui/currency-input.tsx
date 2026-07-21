"use client";

import { useState, useRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = focused
    ? value
    : value
      ? `Rp ${Number(value).toLocaleString("id-ID")}`
      : "";

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          onChange(digits);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn("pl-7", className)}
        {...props}
      />
      {!displayValue && !focused && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/40 select-none">
          Rp 0
        </span>
      )}
    </div>
  );
}
