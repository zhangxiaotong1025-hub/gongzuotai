import { Search, Bell, ChevronDown, Menu, Settings } from "lucide-react";

export function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header
      className="h-14 border-b flex items-center justify-between px-5 sticky top-0 z-20"
      style={{ background: 'hsl(var(--card))' }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <div className="hidden sm:flex items-center text-[13px] text-muted-foreground">
          <span>企业管理</span>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">企业管理</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <Search className="h-[18px] w-[18px]" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <Settings className="h-[18px] w-[18px]" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground relative">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-card" style={{ background: 'hsl(var(--destructive))' }} />
        </button>
        <div className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-muted rounded-lg px-2.5 py-1.5 transition-colors">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))' }}
          >
            <span className="text-primary-foreground text-xs font-medium">程</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] text-foreground leading-tight">程女士</span>
            <span className="text-[11px] text-muted-foreground leading-tight">超级管理员</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
