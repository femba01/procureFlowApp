import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

export function Modal({
  title,
  description,
  icon,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-5">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 border-0 bg-[#101828a8]"
        onClick={onClose}
      />
      <section
        className="relative z-[1] max-h-[92vh] w-full max-w-[680px] overflow-auto rounded-[14px] bg-white shadow-[0_20px_60px_#10182845]"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="flex items-center justify-between border-b border-[#e7eaf0] px-6 py-5">
          <div className="flex items-center gap-[11px]">
            {icon && (
              <span className="grid size-[38px] place-items-center rounded-[9px] bg-[#e9efff] text-[#315fdb]">
                {icon}
              </span>
            )}
            <div>
              <h3 className="m-0 font-[Manrope] text-base font-bold">{title}</h3>
              {description && (
                <p className="mt-1 text-[10px] text-[#8690a1]">{description}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" className="size-9 p-0" onClick={onClose}>
            <X size={18} />
          </Button>
        </header>
        {children}
        {footer && (
          <footer className="flex justify-end gap-2.5 border-t border-[#e7eaf0] bg-[#f8f9fb] px-6 py-4">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}
