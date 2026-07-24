import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function SearchField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      className={cn(
        "flex h-[38px] w-full max-w-[440px] items-center gap-2 rounded-lg border border-[#dfe3ea] bg-white px-[10px] text-[#8b94a5]",
        className,
      )}
    >
      <Search size={18} />
      <input
        className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-slate-800 outline-0"
        {...props}
      />
    </label>
  );
}
