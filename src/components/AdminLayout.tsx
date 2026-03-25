import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className="transition-all duration-200"
        style={{ marginLeft: collapsed ? 0 : 220 }}
      >
        <AdminHeader onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
