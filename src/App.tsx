import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import PermissionGate from "./components/PermissionGate";
import { useAppStore } from "./store/store";
import type { Permission } from "./types/permissions";
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const NewRequestPage = lazy(() => import("./pages/requests/NewRequestPage"));
const RequestDetailsPage = lazy(() => import("./pages/requests/RequestDetailsPage"));
const RequestsPage = lazy(() => import("./pages/requests/RequestsPage"));
const SuppliersPage = lazy(() => import("./pages/suppliers/SuppliersPage"));
const SupplierDetailsPage = lazy(() => import("./pages/suppliers/SupplierDetailsPage"));
const QuotationsPage = lazy(() => import("./pages/quotation/QuotationsPage"));
const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const OrderDetailsPage = lazy(() => import("./pages/orders/OrderDetailsPage"));
const GenerateOrderPage = lazy(() => import("./pages/orders/GenerateOrderPage"));
const InventoryPage = lazy(() => import("./pages/inventories/InventoryPage"));
const NewInventoryPage = lazy(() => import("./pages/inventories/NewInventoryPage"));
const InventoryDetailsPage = lazy(() => import("./pages/inventories/InventoryDetailsPage"));
const BudgetsPage = lazy(() => import("./pages/BudgetsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ForbiddenPage = lazy(() => import("./components/ForbiddenPage"));
const secure = (permission: Permission, element: ReactNode) => (
  <PermissionGate permission={permission}>{element}</PermissionGate>
);
export default function App() {
  const user = useAppStore((s) => s.user);
  const authReady = useAppStore((s) => s.authReady);
  const initializeAuth = useAppStore((s) => s.initializeAuth);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  if (!authReady) {
    return (
      <div className="route-loader" role="status" aria-live="polite">
        <span />
        <p>Loading workspace…</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="route-loader" role="status" aria-live="polite">
          <span />
          <p>Loading workspace…</p>
        </div>
      }
    >
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={secure("dashboard:view", <DashboardPage />)}
              />
              <Route
                path="/requests"
                element={secure("requests:view", <RequestsPage />)}
              />
              <Route
                path="/requests/new"
                element={secure("requests:create", <NewRequestPage />)}
              />
              <Route
                path="/requests/:requestId/edit"
                element={secure("requests:create", <NewRequestPage />)}
              />
              <Route
                path="/requests/:requestId"
                element={secure("requests:view", <RequestDetailsPage />)}
              />
              <Route
                path="/suppliers"
                element={secure("suppliers:manage", <SuppliersPage />)}
              />
              <Route
                path="/suppliers/:supplierId"
                element={secure("suppliers:manage", <SupplierDetailsPage />)}
              />
              <Route
                path="/quotations"
                element={secure("suppliers:manage", <QuotationsPage />)}
              />
              <Route
                path="/orders"
                element={secure("orders:manage", <OrdersPage />)}
              />
              <Route
                path="/orders/generate/:quotationId"
                element={secure("orders:manage", <GenerateOrderPage />)}
              />
              <Route
                path="/orders/:orderId"
                element={secure("orders:manage", <OrderDetailsPage />)}
              />
              <Route
                path="/inventory"
                element={secure("inventory:manage", <InventoryPage />)}
              />
              <Route
                path="/inventory/new"
                element={secure("inventory:manage", <NewInventoryPage />)}
              />
              <Route
                path="/inventory/:itemId"
                element={secure("inventory:manage", <InventoryDetailsPage />)}
              />
              <Route
                path="/budgets"
                element={secure("budgets:view", <BudgetsPage />)}
              />
              <Route
                path="/reports"
                element={secure("reports:view", <ReportsPage />)}
              />
              <Route
                path="/settings"
                element={secure("settings:manage", <SettingsPage />)}
              />
              <Route path="/forbidden" element={<ForbiddenPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Suspense>
  );
}
