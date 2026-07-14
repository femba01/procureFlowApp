import {
  Bell,
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Search,
  Settings,
  ShoppingCart,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "../store/store";
import { hasPermission, type Permission } from "../store/permissions";
import { useQuery } from "@tanstack/react-query";
import { getOrganisationSettings } from "../api/organizationsApi";

const nav = [
  ["Overview", "/dashboard", LayoutDashboard, "dashboard:view"],
  ["Requests", "/requests", ClipboardList, "requests:view"],
  ["Suppliers", "/suppliers", Users, "suppliers:manage"],
  ["Purchase orders", "/orders", ShoppingCart, "orders:manage"],
  ["Inventory", "/inventory", Boxes, "inventory:manage"],
  ["Budgets", "/budgets", WalletCards, "budgets:view"],
  ["Reports", "/reports", ChartNoAxesCombined, "reports:view"],
] as const;

export default function AppLayout() {
  const { user, sidebarOpen, toggleSidebar, closeSidebar, logout } =
    useAppStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const location = useLocation();
  const page = nav.find((n) => n[1] === location.pathname)?.[0] ?? "Workspace";

  const { data: organization, isLoading } = useQuery({
    queryKey: ["organizationSettings"],
    queryFn: () => getOrganisationSettings(user?.organization_id || ""),
  });

  if (isLoading) return <div className="route-loader" role="status" aria-live="polite">
    <span />
    <p>Loading workspace…</p>
  </div>;

  if (!organization) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to log out.",
      );
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside
        aria-label="Primary navigation"
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
      >
        <div className="brand">
          <span className="brand-mark">
            <PackageCheck size={22} />
          </span>
          <span>
            Procure<span>Flow</span>
          </span>
          <button
            aria-label="Close navigation"
            className="mobile-close"
            onClick={closeSidebar}
          >
            <X />
          </button>
        </div>
        <div className="workspace">
          <div className="workspace-logo">AC</div>
          <div>
            <strong>{organization?.companyName || "Acme Corporation"}</strong>
            <small>Business workspace</small>
          </div>
        </div>
        <nav>
          <p className="nav-label">WORKSPACE</p>
          {nav
            .filter(([, , , permission]) =>
              hasPermission(user?.role, permission as Permission),
            )
            .map(([label, to, Icon]) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeSidebar}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <Icon size={19} />
                <span>{label}</span>
                {label === "Requests" && <b>12</b>}
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-bottom">
          {hasPermission(user?.role, "settings:manage") && (
            <NavLink to="/settings" className={location.pathname === "/settings" ? "bg-[#25375b] !text-white" : ""}>
              <Settings size={19} />
              Settings
            </NavLink>
          )}
          <button
            type="button"
            className="sidebar-logout"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            {isLoggingOut ? "Logging out…" : "Log out"}
          </button>
          {logoutError && (
            <small className="logout-error" role="alert">
              {logoutError}
            </small>
          )}
          <div className="user-card">
            <div className="avatar">{user?.initials}</div>
            <div className="user-card-details">
              <strong>{user?.name}</strong>
              <small>{user?.role}</small>
            </div>
          </div>
          
        </div>
      </aside>
      {sidebarOpen && (
        <button
          aria-label="Close menu"
          className="backdrop"
          onClick={closeSidebar}
        />
      )}
      <main id="main-content" tabIndex={-1}>
        <header>
          <div className="header-title">
            <button
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
              className="menu"
              onClick={toggleSidebar}
            >
              <Menu />
            </button>
            <div>
              <small>Workspace / {page}</small>
              <h1>{page}</h1>
            </div>
          </div>
          <div className="header-actions">
            <label className="search">
              <Search size={18} />
              <input
                aria-label="Search workspace"
                placeholder="Search anything..."
              />
              <kbd>⌘ K</kbd>
            </label>
            <button aria-label="Notifications" className="icon-button">
              <Bell size={20} />
              <span />
            </button>
            <details className="account-menu">
              <summary
                className="header-avatar"
                aria-label={`Open account menu for ${user?.name}`}
              >
                {user?.initials}
              </summary>
              <div className="account-dropdown">
                <div className="account-dropdown-user">
                  <strong>{user?.name}</strong>
                  <small>{user?.email}</small>
                </div>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  {isLoggingOut ? "Logging out…" : "Log out"}
                </button>
                {logoutError && (
                  <small className="logout-error" role="alert">
                    {logoutError}
                  </small>
                )}
              </div>
            </details>
          </div>
        </header>
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
