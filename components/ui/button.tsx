import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`transition-interactive min-h-target rounded-control bg-accent px-5 py-2.5 font-medium text-accent-foreground hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60 ${className}`} {...props} />;
}
