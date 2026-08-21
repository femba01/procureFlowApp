import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import type { User } from "../../types/auth";
import { Button } from "../ui/Button";
import Table, { type TableColumn } from "../ui/Table";
import { getAllUsers } from "../../api/profilesApi";


export default function UsersSettings({
  organizationId,
  currentUserId,
}: {
  organizationId: string;
  currentUserId: string;
}) {

  const usersQuery = useQuery({
    queryKey: ["organization-users", organizationId],
    queryFn: () => getAllUsers(organizationId),
    enabled: Boolean(organizationId),
  });

  const columns: TableColumn<User>[] = [
    {
      key: "name",
      header: "User",
      render: (row) => (
        <div>
          <strong>{row.name}</strong>
          <small className="block text-slate-500">{row.email}</small>
        </div>
      ),
    },
    { key: "role", header: "Role" },
    {
      key: "department",
      header: "Department",
      render: (row) => row.department?.name || "All departments",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div
          className="flex gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="danger"
            className="h-8 px-3"
            disabled={row.id === currentUserId}
            title={
              row.id === currentUserId
                ? "You cannot delete your own account"
                : undefined
            }
            // onClick={() => {
            //   if (
            //     window.confirm(
            //       `Delete ${row.name}'s account? This cannot be undone.`,
            //     )
            //   )
            //     deleteMutation.mutate(row.id);
            // }}
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
          <h3 className="font-manrope text-base font-bold">
            Organisation users
          </h3>
          <p className="mt-1 text-[10px] text-slate-500">
            Manage access, roles and department assignments.
          </p>
        </div>
        {/* <Button onClick={() => setModalOpen(true)}>
          <UserPlus size={16} /> Add user
        </Button> */}
      </div>
      <div className="px-6 pb-6">
        <Table
          data={usersQuery.data ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          emptyMessage={
            usersQuery.isLoading ? "Loading users…" : "No users found."
          }
        />
      </div>
    </>
  );
}
