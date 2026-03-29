import { type ButtonHTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  // Merge Tailwind classes safely so variants and caller overrides can coexist.
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}
 
export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  // Shared button primitive keeps the primary/secondary action styling consistent across pages.
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700",
    secondary: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger: "bg-danger text-white hover:bg-red-600",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600"
  };

  return (
    <button
      className={cn("px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50", variants[variant], className)}
      {...props}
    />
  );
}
