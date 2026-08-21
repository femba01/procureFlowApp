import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../../api/departmentsApi";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import Table, { type TableColumn } from "../ui/Table";
import type { Department } from "../../types/departments";
import { DateTimeFormat } from "../../utils/datetimeFormat";

export default function DepartmentsSettings({
  organizationId,
}: {
  organizationId: string;
}) {
  const client = useQueryClient();
  const [editing, setEditing] = useState<Department | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const query = useQuery({
    queryKey: ["departments", organizationId],
    queryFn: () => getDepartments(organizationId),
    enabled: Boolean(organizationId),
  });
  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateDepartment({
            id: editing.id,
            organizationId,
            name,
            code,
          })
        : createDepartment({ organizationId, name, code }),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: ["departments", organizationId],
      });
      closeModal();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDepartment({ id, organizationId }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["departments", organizationId] }),
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setName("");
    setCode("");
    saveMutation.reset();
  };
  const openEdit = (department: Department) => {
    setEditing(department);
    setName(department.name);
    setCode(department.code ?? "");
    setModalOpen(true);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  const columns: TableColumn<Department>[] = [
    {
      key: "name",
      header: "Department",
      render: (row) => <strong>{row.name}</strong>,
    },
    { key: "code", header: "Code", render: (row) => row.code || "—" },
    {
      key: "created_at",
      header: "Created",
      render: (row) => DateTimeFormat(row.created_at),
    },
    {
      key: "id",
      header: "Actions",
      render: (row) => (
        <div
          className="flex gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="secondary"
            className="h-8! px-3!"
            onClick={() => openEdit(row)}
          >
            <Pencil size={14} /> Edit
          </Button>
          <Button
            variant="danger"
            className="h-8! px-3!"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (
                window.confirm(
                  `Delete ${row.name}? This only works when it is not in use.`,
                )
              ) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h3 className="font-manrope text-base font-bold">Departments</h3>
          <p className="mt-1 text-[10px] text-slate-500">
            Create and maintain departments in this organisation.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add department
        </Button>
      </div>
      <div className="px-6 pb-6">
        <Table
          data={query.data ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          emptyMessage={
            query.isLoading
              ? "Loading departments…"
              : "No departments have been added."
          }
        />
        {(query.isError || deleteMutation.isError) && (
          <p className="settings-error" role="alert">
            {(query.error || deleteMutation.error)?.message}
          </p>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit department" : "Add department"}
        description="Department codes should be short and unique within the organisation."
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="department-form"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving…" : "Save department"}
            </Button>
          </>
        }
      >
        <form id="department-form" className="grid gap-4" onSubmit={submit}>
          <label className="settings-field">
            <span>Department name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="settings-field">
            <span>Department code</span>
            <input
              required
              maxLength={12}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          {saveMutation.isError && (
            <p className="settings-error">{saveMutation.error.message}</p>
          )}
        </form>
      </Modal>
    </>
  );
}
