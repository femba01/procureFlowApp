import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "../../utils/cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const base =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-[15px] text-[13px] font-semibold no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-0 bg-[#315fdb] text-white shadow-[0_4px_10px_#315fdb2b] hover:bg-[#284fb8]",
  secondary:
    "border border-[#dfe3ea] bg-white text-[#485266] hover:bg-slate-50",
  danger:
    "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  ghost: "border-0 bg-transparent text-slate-600 hover:bg-slate-100",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], fullWidth && "w-full", className)}
      {...props}
    />
  );
}

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function ButtonLink({
  variant = "primary",
  fullWidth,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(base, variants[variant], fullWidth && "w-full", className)}
      {...props}
    />
  );
}