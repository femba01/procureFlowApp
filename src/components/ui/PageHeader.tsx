import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../utils/cn";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mb-6 flex items-center justify-between gap-4 max-[760px]:items-start",
        className,
      )}
    >
      <div>
        <h2 className="m-0 font-[Manrope] text-2xl font-bold text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-[#747e90]">{description}</p>
        )}
      </div>
      {actions}
    </section>
  );
}

export function BackRow({
  to,
  label,
  meta,
}: {
  to: string;
  label: string;
  meta?: ReactNode;
}) {
  return (
    <div className="mb-[18px] flex items-center justify-between text-xs text-[#8a93a3]">
      <Link
        to={to}
        className="inline-flex items-center gap-[7px] font-semibold text-[#526078] no-underline hover:text-[#315fdb]"
      >
        <ArrowLeft size={17} />
        {label}
      </Link>
      {meta && <span>{meta}</span>}
    </div>
  );
}
