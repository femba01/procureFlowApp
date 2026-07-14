import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
};

export default function FormField({
  label,
  error,
  wide = false,
  children,
}: FormFieldProps) {
  return (
    <label className={`form-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
