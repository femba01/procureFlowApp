import { ShieldX } from "lucide-react";
import { ButtonLink } from "./ui";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto mt-[8vh] max-w-[560px] px-5 text-center" role="alert">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-50 text-red-600">
        <ShieldX />
      </div>
      <p className="mt-5 text-[10px] font-bold tracking-[0.12em] text-[#315fdb]">
        ACCESS RESTRICTED
      </p>
      <h2 className="mt-2 font-[Manrope] text-2xl font-bold">
        You don’t have permission to view this module
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
        Your current role does not include this capability. Contact an
        administrator if your responsibilities have changed.
      </p>
      <ButtonLink className="mt-5" to="/dashboard">
        Return to dashboard
      </ButtonLink>
    </div>
  );
}
