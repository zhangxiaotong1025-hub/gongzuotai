import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import AgentPanel from "./agent/AgentPanel";
import AgentTrigger from "./agent/AgentTrigger";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

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

      {/* Global Agent */}
      {!agentOpen && <AgentTrigger onClick={() => setAgentOpen(true)} />}
      <AgentPanel open={agentOpen} onClose={() => setAgentOpen(false)} />
    </div>
  );
}
