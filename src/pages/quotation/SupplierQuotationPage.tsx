import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Info,
  LockKeyhole,
  ReceiptText,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import {
  getPublicQuotationInvitation,
  submitPublicQuotation,
} from "../../api/quotationsApi";
import {
  supplierQuotationSchema,
  type SupplierQuotationFormInput,
  type SupplierQuotationFormValues,
} from "../../schemas/quotation";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50";
const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function SupplierQuotationPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const invitation = useQuery({
    queryKey: ["public-quotation-invitation", token],
    queryFn: () => getPublicQuotationInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });
  const form = useForm<
    SupplierQuotationFormInput,
    unknown,
    SupplierQuotationFormValues
  >({
    resolver: zodResolver(supplierQuotationSchema),
    defaultValues: {
      reference: "",
      currency: "NGN",
      paymentTerms: "30 days after delivery",
      warranty: "",
      validUntil: "",
      deliveryFee: 0,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
      confirmation: false as true,
      items: [],
    },
  });
  const fields = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (!invitation.data) return;
    form.reset({
      reference: "",
      currency: "NGN",
      paymentTerms: "30 days after delivery",
      warranty: "",
      validUntil: "",
      deliveryFee: 0,
      contactName: "",
      contactEmail: invitation.data.supplierEmail,
      contactPhone: "",
      notes: "",
      confirmation: false as true,
      items: invitation.data.items.map((item) => ({
        requestItemId: item.id,
        description: item.description,
        requestedQuantity: item.quantity,
        unit: item.unit,
        availableQuantity: item.quantity,
        unitPrice: 0,
        taxRate: 7.5,
        discount: 0,
        leadTimeDays: 5,
        alternative: "",
        notes: "",
      })),
    });
  }, [form, invitation.data]);

  const mutation = useMutation({ mutationFn: submitPublicQuotation });
  const values = useWatch({ control: form.control });
  const selectedCurrency = values.currency ?? "NGN";
  const lines = (values.items ?? []).map((item) => {
    const subtotal = Math.max(
      0,
      Number(item?.availableQuantity || 0) * Number(item?.unitPrice || 0) -
        Number(item?.discount || 0),
    );
    return {
      subtotal,
      tax: subtotal * (Number(item?.taxRate || 0) / 100),
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const tax = lines.reduce((sum, line) => sum + line.tax, 0);
  const total = subtotal + tax + Number(values.deliveryFee || 0);

  if (!token)
    return <InvitationError message="The invitation link is incomplete." />;
  if (invitation.isLoading) {
    return (
      <main className="ml-0 grid min-h-screen place-items-center bg-slate-50">
        <p className="text-sm text-slate-500">Validating secure invitation…</p>
      </main>
    );
  }
  if (invitation.isError || !invitation.data) {
    return (
      <InvitationError
        message={
          invitation.error instanceof Error
            ? invitation.error.message
            : "This quotation invitation is unavailable."
        }
      />
    );
  }
  if (mutation.isSuccess) {
    return (
      <main className="ml-0 grid min-h-screen place-items-center bg-slate-50 p-5">
        <section className="w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
          <h1 className="mt-4 font-[Manrope] text-2xl font-bold">
            Quotation submitted
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Quotation <strong>{mutation.data.quotation_number}</strong> has been
            securely received for {invitation.data.requestNumber}.
          </p>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
            <span className="text-slate-500">Submitted total</span>
            <strong className="mt-1 block text-xl text-slate-900">
              {formatMoney(mutation.data.total, mutation.data.currency)}
            </strong>
          </div>
          <p className="mt-5 text-xs text-slate-500">
            You may close this page. Procurement will contact you if more
            information is required.
          </p>
        </section>
      </main>
    );
  }

  const data = invitation.data;
  return (
    <main className="ml-0 min-h-screen bg-slate-100 pb-16 text-slate-900">
      <header className="sticky top-0 z-30 h-auto border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white">
              <FileText size={20} />
            </div>
            <div>
              <strong className="font-[Manrope] text-lg">ProcureFlow</strong>
              <p className="text-xs text-slate-400">Secure supplier response</p>
            </div>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
            <LockKeyhole size={14} /> Private invitation
          </span>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Request for quotation · {data.requestNumber}
                </span>
                <h1 className="mt-2 font-[Manrope] text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {data.requestTitle}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Complete the pricing and commercial details below on behalf of{" "}
                  <strong className="text-slate-900">
                    {data.supplierName}
                  </strong>
                  . This invitation was issued by {data.organisationName}.
                </p>
              </div>
              <div className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <span className="flex items-center gap-2 font-semibold">
                  <CalendarDays size={16} /> Due{" "}
                  {new Date(data.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
          <Info className="mt-0.5 shrink-0" size={18} />
          <p>
            Enter prices before tax, confirm available quantities, and include
            any substitutions in the alternative-product field. Your total
            updates automatically.
          </p>
        </div>

        <form
          className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
          onSubmit={form.handleSubmit((formValues) =>
            mutation.mutate({ ...formValues, token }),
          )}
        >
          <div className="space-y-6">
            <FormSection
              title="Supplier and quotation details"
              description="Identify your response and provide the primary commercial contact."
              icon={<Building2 size={18} />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Quotation reference"
                  error={form.formState.errors.reference?.message}
                >
                  <input
                    className={inputClass}
                    {...form.register("reference")}
                    placeholder="e.g. NEXA/QT/2026/104"
                  />
                </Field>
                <Field
                  label="Currency"
                  error={form.formState.errors.currency?.message}
                >
                  <select className={inputClass} {...form.register("currency")}>
                    <option>NGN</option>
                    <option>USD</option>
                    <option>GBP</option>
                    <option>EUR</option>
                  </select>
                </Field>
                <Field
                  label="Representative name"
                  error={form.formState.errors.contactName?.message}
                >
                  <input
                    className={inputClass}
                    {...form.register("contactName")}
                  />
                </Field>
                <Field
                  label="Representative email"
                  error={form.formState.errors.contactEmail?.message}
                >
                  <input
                    className={inputClass}
                    type="email"
                    {...form.register("contactEmail")}
                  />
                </Field>
                <Field
                  label="Phone number"
                  error={form.formState.errors.contactPhone?.message}
                >
                  <input
                    className={inputClass}
                    {...form.register("contactPhone")}
                  />
                </Field>
                <Field
                  label="Valid until"
                  error={form.formState.errors.validUntil?.message}
                >
                  <input
                    className={inputClass}
                    type="date"
                    {...form.register("validUntil")}
                  />
                </Field>
                <Field
                  label="Payment terms"
                  error={form.formState.errors.paymentTerms?.message}
                >
                  <input
                    className={inputClass}
                    {...form.register("paymentTerms")}
                  />
                </Field>
                <Field
                  label="Warranty (optional)"
                  error={form.formState.errors.warranty?.message}
                >
                  <input
                    className={inputClass}
                    {...form.register("warranty")}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Item pricing"
              description={`${fields.fields.length} requested ${fields.fields.length === 1 ? "item" : "items"} require a response.`}
              icon={<ReceiptText size={18} />}
            >
              <div className="space-y-4">
                {fields.fields.map((field, index) => {
                  const lineTotal = lines[index]?.subtotal ?? 0;
                  return (
                    <article
                      key={field.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    >
                      <input
                        type="hidden"
                        {...form.register(`items.${index}.requestItemId`)}
                      />
                      <input
                        type="hidden"
                        {...form.register(`items.${index}.description`)}
                      />
                      <input
                        type="hidden"
                        {...form.register(`items.${index}.requestedQuantity`)}
                      />
                      <input
                        type="hidden"
                        {...form.register(`items.${index}.unit`)}
                      />
                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-3.5 sm:px-5">
                        <div className="flex gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {field.description}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Requested: {field.requestedQuantity} {field.unit}
                              (s)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Line subtotal
                          </span>
                          <strong className="mt-1 block text-sm text-blue-700">
                            {formatMoney(lineTotal, selectedCurrency)}
                          </strong>
                        </div>
                      </div>
                      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 2xl:grid-cols-5">
                        <Field
                          label="Quoted quantity"
                          error={
                            form.formState.errors.items?.[index]
                              ?.availableQuantity?.message
                          }
                        >
                          <input
                            className={inputClass}
                            type="number"
                            min="1"
                            {...form.register(
                              `items.${index}.availableQuantity`,
                            )}
                          />
                        </Field>
                        <Field
                          label="Unit price"
                          error={
                            form.formState.errors.items?.[index]?.unitPrice
                              ?.message
                          }
                        >
                          <input
                            className={inputClass}
                            type="number"
                            min="0"
                            step="0.01"
                            {...form.register(`items.${index}.unitPrice`)}
                          />
                        </Field>
                        <Field
                          label="Tax %"
                          error={
                            form.formState.errors.items?.[index]?.taxRate
                              ?.message
                          }
                        >
                          <input
                            className={inputClass}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            {...form.register(`items.${index}.taxRate`)}
                          />
                        </Field>
                        <Field
                          label="Discount"
                          error={
                            form.formState.errors.items?.[index]?.discount
                              ?.message
                          }
                        >
                          <input
                            className={inputClass}
                            type="number"
                            min="0"
                            step="0.01"
                            {...form.register(`items.${index}.discount`)}
                          />
                        </Field>
                        <Field
                          label="Lead time (days)"
                          error={
                            form.formState.errors.items?.[index]?.leadTimeDays
                              ?.message
                          }
                        >
                          <input
                            className={inputClass}
                            type="number"
                            min="0"
                            {...form.register(`items.${index}.leadTimeDays`)}
                          />
                        </Field>
                      </div>
                      <div className="grid gap-4 border-t border-slate-100 bg-slate-50/40 px-4 py-4 sm:grid-cols-2 sm:px-5">
                        <Field label="Alternative product (optional)">
                          <input
                            className={inputClass}
                            {...form.register(`items.${index}.alternative`)}
                          />
                        </Field>
                        <Field label="Item notes (optional)">
                          <input
                            className={inputClass}
                            {...form.register(`items.${index}.notes`)}
                          />
                        </Field>
                      </div>
                    </article>
                  );
                })}
              </div>
            </FormSection>

            <FormSection
              title="Delivery and additional information"
              description="Add delivery charges and any conditions procurement should review."
              icon={<Truck size={18} />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Delivery fee">
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register("deliveryFee")}
                  />
                </Field>
                <Field label="General notes">
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="Add delivery conditions, exclusions, or other commercial notes…"
                    {...form.register("notes")}
                  />
                </Field>
              </div>
            </FormSection>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-24">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <span className="grid size-9 place-items-center rounded-lg bg-blue-100 text-blue-700">
                <FileText size={18} />
              </span>
              <div>
                <h2 className="font-[Manrope] font-bold">Quotation summary</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Review before submitting
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
                <Summary
                  label="Items subtotal"
                  value={formatMoney(subtotal, selectedCurrency)}
                />
                <Summary
                  label="Tax"
                  value={formatMoney(tax, selectedCurrency)}
                />
                <Summary
                  label="Delivery fee"
                  value={formatMoney(
                    Number(values.deliveryFee || 0),
                    selectedCurrency,
                  )}
                />
              </div>
              <div className="flex items-end justify-between py-5">
                <span className="text-sm font-semibold">Total</span>
                <strong className="font-[Manrope] text-2xl text-blue-700">
                  {formatMoney(total, selectedCurrency)}
                </strong>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                <input
                  className="mt-1 size-4 accent-blue-600"
                  type="checkbox"
                  {...form.register("confirmation")}
                />
                I confirm that this quotation is accurate and submitted on
                behalf of {data.supplierName}.
              </label>
              {form.formState.errors.confirmation && (
                <p className="mt-2 text-xs text-red-600">
                  {form.formState.errors.confirmation.message}
                </p>
              )}
              {mutation.isError && (
                <p className="mt-3 flex gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={16} />
                  {mutation.error.message}
                </p>
              )}
              <button
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={mutation.isPending}
                type="submit"
              >
                <Send size={17} />{" "}
                {mutation.isPending
                  ? "Submitting securely…"
                  : "Submit quotation"}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
                <ShieldCheck size={13} /> Your response is private and cannot be
                viewed by other suppliers.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4 text-slate-900">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
          {icon}
        </span>
        <div>
          <h2 className="font-[Manrope] font-bold">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      {children}
      {error && <span className="mt-1 block text-red-600">{error}</span>}
    </label>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function ProcessStep({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${active ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-500"}`}
    >
      <span
        className={`grid size-6 place-items-center rounded-full ${active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}
      >
        {number}
      </span>
      {label}
    </div>
  );
}
function InvitationError({ message }: { message: string }) {
  return (
    <main className="ml-0 grid min-h-screen place-items-center bg-slate-50 p-5">
      <section className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={42} />
        <h1 className="mt-4 font-[Manrope] text-xl font-bold">
          Invitation unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <p className="mt-4 text-xs text-slate-500">
          Contact the procurement representative who sent the invitation for
          assistance.
        </p>
      </section>
    </main>
  );
}
