import { GitBranch } from "lucide-react";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { OrganisationSettings, Warehouse } from "../../types/types";

type SettingsForm = UseFormReturn<OrganisationSettings>;

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="settings-section-title">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  wide,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`settings-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function OrganisationSettingsForm({ form }: { form: SettingsForm }) {
  return (
    <>
      <SectionTitle
        title="Organisation profile"
        description="Company information used on purchase orders, reports and supplier communication."
      />
      <div className="settings-logo">
        <div>AC</div>
        <span>
          <strong>Organisation logo</strong>
          <small>PNG or SVG, maximum 2 MB</small>
        </span>
        <button type="button" className="secondary-button">
          Change logo
        </button>
      </div>
      <div className="settings-grid">
        <Field label="Trading name">
          <input {...form.register("companyName", { required: true })} />
        </Field>
        <Field label="Legal company name">
          <input {...form.register("legalName", { required: true })} />
        </Field>
        <Field label="Procurement email">
          <input type="email" {...form.register("email", { required: true })} />
        </Field>
        <Field label="Phone number">
          <input {...form.register("phone")} />
        </Field>
        <Field label="Website">
          <input type="url" {...form.register("website")} />
        </Field>
        <Field label="Tax identification number">
          <input {...form.register("taxId")} />
        </Field>
        <Field label="Registered address" wide>
          <textarea rows={3} {...form.register("address")} />
        </Field>
        <Field label="Country">
          <select {...form.register("country")}>
            <option>Nigeria</option>
            <option>Ghana</option>
            <option>Kenya</option>
            <option>South Africa</option>
          </select>
        </Field>
        <Field label="Timezone">
          <select {...form.register("timezone")}>
            <option>Africa/Lagos</option>
            <option>Africa/Accra</option>
            <option>Africa/Nairobi</option>
            <option>Europe/London</option>
          </select>
        </Field>
        <Field label="Base currency">
          <select {...form.register("currency")}>
            <option value="NGN">NGN — Nigerian Naira</option>
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
          </select>
        </Field>
        <Field label="Financial year begins">
          <select {...form.register("financialYearStart")}>
            <option>January</option>
            <option>April</option>
            <option>July</option>
            <option>October</option>
          </select>
        </Field>
      </div>
    </>
  );
}

export function ProcurementSettings({
  form,
  warehouses,
}: {
  form: SettingsForm;
  warehouses: Warehouse[];
}) {
  return (
    <>
      <SectionTitle
        title="Procurement defaults"
        description="Standard values and controls applied to new purchasing workflows."
      />
      <div className="settings-grid">
        <Field label="Purchase request prefix" hint="Example: PR-2026-001">
          <input {...form.register("requestPrefix", { required: true })} />
        </Field>
        <Field label="Purchase order prefix" hint="Example: PO-2026-001">
          <input
            {...form.register("purchaseOrderPrefix", { required: true })}
          />
        </Field>
        <Field label="Default payment terms">
          <select {...form.register("defaultPaymentTerms")}>
            <option>Due on receipt</option>
            <option>14 days</option>
            <option>30 days</option>
            <option>60 days</option>
          </select>
        </Field>
        <Field label="Default receiving warehouse">
          <select {...form.register("defaultWarehouseId")}>
            {warehouses.map((warehouse) => (
              <option value={warehouse.id} key={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="settings-switches">
        <Toggle
          title="Require three supplier quotations"
          description="Prevent quotation selection until three eligible responses are received."
          field="requireThreeQuotes"
          form={form}
        />
        <Toggle
          title="Allow emergency purchases"
          description="Permit authorised users to bypass the normal quotation workflow with a recorded reason."
          field="allowEmergencyPurchases"
          form={form}
        />
        <Toggle
          title="Create inventory items automatically"
          description="Add previously unknown goods to the inventory catalogue when they are first received."
          field="autoCreateInventory"
          form={form}
        />
      </div>
    </>
  );
}

export function ApprovalsSettings({ form }: { form: SettingsForm }) {
  return (
    <>
      <SectionTitle
        title="Approval workflow"
        description="Set monetary thresholds that determine how purchase requests are routed."
      />
      <div className="approval-explainer">
        <GitBranch />
        <div>
          <strong>Sequential approval routing</strong>
          <p>
            Each threshold adds another approval stage. Values must increase
            from manager to executive level.
          </p>
        </div>
      </div>
      <div className="threshold-list">
        <Threshold
          number="1"
          title="Department manager approval"
          field="managerApprovalThreshold"
          form={form}
        />
        <Threshold
          number="2"
          title="Finance officer approval"
          field="financeApprovalThreshold"
          form={form}
        />
        <Threshold
          number="3"
          title="Executive approval"
          field="executiveApprovalThreshold"
          form={form}
        />
      </div>
    </>
  );
}

function Threshold({
  number,
  title,
  field,
  form,
}: {
  number: string;
  title: string;
  field:
    | "managerApprovalThreshold"
    | "financeApprovalThreshold"
    | "executiveApprovalThreshold";
  form: SettingsForm;
}) {
  return (
    <div className="threshold-row">
      <span>{number}</span>
      <div>
        <strong>{title}</strong>
        <small>Requests at or above this value require approval.</small>
      </div>
      <label>
        <b>₦</b>
        <input
          type="number"
          min="0"
          step="50000"
          {...form.register(field, { valueAsNumber: true })}
        />
      </label>
    </div>
  );
}

export function NotificationsSettings({
  form,
  values,
}: {
  form: SettingsForm;
  values: Partial<OrganisationSettings>;
}) {
  return (
    <>
      <SectionTitle
        title="Email notifications"
        description="Choose which operational events send email alerts to relevant users."
      />
      <div className="settings-switches">
        <Toggle
          title="Approval requests"
          description="Notify approvers when a purchase request requires action."
          field="emailApprovals"
          form={form}
        />
        <Toggle
          title="Purchase orders"
          description="Notify procurement users when orders are issued or acknowledged."
          field="emailOrders"
          form={form}
        />
        <Toggle
          title="Goods receipts"
          description="Notify requesters when ordered goods are partially or fully received."
          field="emailReceipts"
          form={form}
        />
        <Toggle
          title="Low-stock alerts"
          description="Notify inventory managers when an item reaches its reorder level."
          field="emailLowStock"
          form={form}
        />
        <Toggle
          title="Daily activity digest"
          description="Send administrators one summary of procurement activity each day."
          field="dailyDigest"
          form={form}
        />
      </div>
      {values.dailyDigest && (
        <div className="digest-time">
          <Field label="Daily digest delivery time">
            <input type="time" {...form.register("lowStockDigestTime")} />
          </Field>
        </div>
      )}
    </>
  );
}

function Toggle({
  title,
  description,
  field,
  form,
}: {
  title: string;
  description: string;
  field: keyof OrganisationSettings;
  form: SettingsForm;
}) {
  const enabled = Boolean(form.getValues(field));
  return (
    <div className="toggle-row">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        className={`toggle ${enabled ? "on" : ""}`}
        onClick={() =>
          form.setValue(field, !enabled as never, { shouldDirty: true })
        }
      >
        <i />
      </button>
    </div>
  );
}
