import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  acceptUserInvitation,
  getPublicUserInvitation,
} from "../../api/organizationUsersApi";
import { Button } from "../../components/ui/Button";

export default function InvitationRegistrationPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const invitation = useQuery({
    queryKey: ["user-invitation", token],
    queryFn: () => getPublicUserInvitation(token),
    enabled: Boolean(token),
  });
  const mutation = useMutation({
    mutationFn: () =>
      acceptUserInvitation({
        token,
        name: name || invitation.data?.name || "",
        password,
      }),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) return;
    mutation.mutate();
  };

  if (!token || invitation.isError) {
    return (
      <InvitationMessage
        title="Invitation unavailable"
        message={
          invitation.error?.message ||
          "This invitation link is incomplete or no longer valid."
        }
      />
    );
  }
  if (invitation.isLoading) {
    return (
      <InvitationMessage
        title="Checking invitation"
        message="Please wait while we validate your registration link."
      />
    );
  }
  if (mutation.isSuccess) {
    return (
      <InvitationShell>
        <CheckCircle2 className="mx-auto text-emerald-600" size={42} />
        <h1 className="mt-4 text-center text-2xl font-bold">Account created</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          You can now sign in to your organisation workspace.
        </p>
        <Button
          className="mt-6 w-full"
          onClick={() => {
            window.location.href = "/login";
          }}
        >
          Continue to sign in
        </Button>
      </InvitationShell>
    );
  }

  const data = invitation.data!;
  return (
    <InvitationShell>
      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
        Organisation invitation
      </p>
      <h1 className="mt-2 text-2xl font-bold">Join {data.organizationName}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        You were invited as{" "}
        <strong className="text-slate-700">{data.role}</strong> using{" "}
        {data.email}.
      </p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label className="settings-field">
          <span>Full name</span>
          <input
            required
            defaultValue={data.name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="settings-field">
          <span>Email address</span>
          <input readOnly value={data.email} />
        </label>
        <label className="settings-field">
          <span>Create password</span>
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="settings-field">
          <span>Confirm password</span>
          <input
            required
            minLength={8}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-600">Passwords do not match.</p>
        )}
        {mutation.isError && (
          <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
            {mutation.error.message}
          </p>
        )}
        <Button
          type="submit"
          fullWidth
          disabled={mutation.isPending || password !== confirmPassword}
        >
          {mutation.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-center text-xs text-slate-500">
        Already registered?{" "}
        <Link className="font-semibold text-blue-600" to="/login">
          Sign in
        </Link>
      </p>
    </InvitationShell>
  );
}

function InvitationShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-5">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-7 flex items-center gap-2 font-bold text-slate-800">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white">
            <PackageCheck size={20} />
          </span>
          ProcureFlow
        </div>
        {children}
      </section>
    </main>
  );
}

function InvitationMessage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <InvitationShell>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <Link
        className="mt-6 inline-block text-sm font-semibold text-blue-600"
        to="/login"
      >
        Return to sign in
      </Link>
    </InvitationShell>
  );
}
