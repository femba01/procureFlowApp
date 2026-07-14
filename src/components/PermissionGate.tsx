import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "../store/store";
import { hasPermission, type Permission } from "../store/permissions";
export default function PermissionGate({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const role = useAppStore((s) => s.user?.role);
  return hasPermission(role, permission) ? (
    children
  ) : (
    <Navigate to="/forbidden" replace />
  );
}
