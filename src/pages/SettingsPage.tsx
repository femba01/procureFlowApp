// const SettingsPage = () => {
//   return (
//     <div>SettingsPage</div>
//   )
// }

// export default SettingsPage

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  Check,
  GitBranch,
  Network,
  Save,
  Settings2,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  ApprovalsSettings,
  NotificationsSettings,
  OrganisationSettingsForm,
  ProcurementSettings,
} from "../components/settings/SettingsSections";
import type { OrganisationSettings } from "../types/settings";
import {
  getOrganisationSettings,
  updateOrganisationSettings,
} from "../api/organizationsApi";
import { getWarehouses } from "../api/inventoryApi";
import { useAppStore } from "../store/store";
import DepartmentsSettings from "../components/settings/DepartmentsSettings";
import UsersSettings from "../components/settings/UsersSettings";

const tabs = [
  ["organisation", "Organisation", Building2],
  ["procurement", "Procurement", ShoppingCart],
  ["approvals", "Approval workflow", GitBranch],
  ["notifications", "Notifications", Bell],
  ["departments", "Departments", Network],
  ["users", "Users", Users],
] as const;

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("organisation");
  const client = useQueryClient();
  const { user } = useAppStore();
  const { data: organization, isLoading } = useQuery({
    queryKey: ["organizationSettings"],
    queryFn: () => getOrganisationSettings(user?.organization_id || ""),
  });
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => getWarehouses(user?.organization_id ?? ""),
  });
  const form = useForm<OrganisationSettings>();
  const values = useWatch({ control: form.control });

  useEffect(() => {
    if (organization) form.reset(organization);
  }, [organization, form]);

  const mutation = useMutation({
    mutationFn: updateOrganisationSettings,
    onSuccess: (value) => {
      client.setQueryData(["organisation-settings"], value);
      form.reset(value);
    },
  });

  if (isLoading || !organization) return <div className="detail-loading" />;

  const save = form.handleSubmit((value) => mutation.mutate(value));
  const isConfigurationTab = tab !== "departments" && tab !== "users";

  return (
    <>
      <section className="welcome">
        <div>
          <h2>General settings</h2>
          <p>Configure organisation-wide defaults and procurement controls.</p>
        </div>
        {isConfigurationTab && (
          <div className="settings-save-state">
            {!form.formState.isDirty && mutation.isSuccess && (
              <span>
                <Check />
                Changes saved
              </span>
            )}
            <button
              className="primary-button"
              disabled={!form.formState.isDirty || mutation.isPending}
              onClick={save}
            >
              <Save size={17} />
              {mutation.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </section>
      <section className="grid grid-cols-1 md:grid-cols-4 md:gap-6">
        <aside className="h-fit mb-5 panel settings-nav">
          <div className="settings-nav-title">
            <Settings2 />
            <span>
              <strong>Configuration</strong>
              <small>Administrator access</small>
            </span>
          </div>
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              className={tab === id ? "selected" : ""}
              onClick={() => setTab(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </aside>
        <div className="col-span-3 h-fit panel settings-panel">
          {isConfigurationTab ? (
            <form onSubmit={save}>
              {tab === "organisation" && (
                <OrganisationSettingsForm form={form} />
              )}
              {tab === "procurement" && (
                <ProcurementSettings form={form} warehouses={warehouses} />
              )}
              {tab === "approvals" && <ApprovalsSettings form={form} />}
              {tab === "notifications" && (
                <NotificationsSettings form={form} values={values} />
              )}
              {mutation.isError && (
                <div className="settings-error" role="alert">
                  {mutation.error.message}
                </div>
              )}
              <div className="settings-footer">
                <span>Unsaved changes are kept until you leave this page.</span>
                <button
                  className="primary-button"
                  disabled={!form.formState.isDirty || mutation.isPending}
                >
                  <Save size={16} />
                  Save configuration
                </button>
              </div>
            </form>
          ) : tab === "departments" ? (
            <DepartmentsSettings organizationId={user?.organization_id ?? ""} />
          ) : (
            <UsersSettings
              organizationId={user?.organization_id ?? ""}
              currentUserId={user?.id ?? ""}
            />
          )}
        </div>
      </section>
      {/* <div className="settings-layout">
        <aside className="panel settings-nav">
          <div className="settings-nav-title">
            <Settings2 />
            <span>
              <strong>Configuration</strong>
              <small>Administrator access</small>
            </span>
          </div>
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              className={tab === id ? "selected" : ""}
              onClick={() => setTab(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </aside>
        <main className="panel settings-panel">
          {isConfigurationTab ? (
            <form onSubmit={save}>
              {tab === "organisation" && (
                <OrganisationSettingsForm form={form} />
              )}
              {tab === "procurement" && (
                <ProcurementSettings form={form} warehouses={warehouses} />
              )}
              {tab === "approvals" && <ApprovalsSettings form={form} />}
              {tab === "notifications" && (
                <NotificationsSettings form={form} values={values} />
              )}
              {mutation.isError && (
                <div className="settings-error" role="alert">
                  {mutation.error.message}
                </div>
              )}
              <div className="settings-footer">
                <span>Unsaved changes are kept until you leave this page.</span>
                <button
                  className="primary-button"
                  disabled={!form.formState.isDirty || mutation.isPending}
                >
                  <Save size={16} />
                  Save configuration
                </button>
              </div>
            </form>
          ) : tab === "departments" ? (
            <DepartmentsSettings organizationId={user?.organization_id ?? ""} />
          ) : (
            <UsersSettings
              organizationId={user?.organization_id ?? ""}
              currentUserId={user?.id ?? ""}
            />
          )}
        </main>
      </div> */}
    </>
  );
}
