import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function LoadingState({
  fullPage,
  label = "Loading…",
  className,
}: {
  fullPage?: boolean;
  label?: string;
  className?: string;
}) {
  if (fullPage) {
    return (
      <div
        className={cn(
          "grid min-h-screen place-content-center text-center text-[#687489]",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <span className="mx-auto size-[34px] animate-spin rounded-full border-[3px] border-[#dce4f6] border-t-[#315fdb]" />
        <p className="mt-2 text-[11px]">{label}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-[500px] animate-pulse rounded-xl bg-gradient-to-r from-[#e9ecf1] via-[#f6f7f9] to-[#e9ecf1]",
        className,
      )}
      role="status"
      aria-label={label}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-6 py-14 text-center text-[#9ba3b1] [&>svg]:mx-auto",
        className,
      )}
    >
      {icon}
      <h3 className="mt-3 font-[Manrope] text-base font-bold text-[#394356]">
        {title}
      </h3>
      {description && <p className="mt-1 text-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function MutationError({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 block text-[10px] text-[#d04444]" role="alert">
      {children}
    </p>
  );
}
