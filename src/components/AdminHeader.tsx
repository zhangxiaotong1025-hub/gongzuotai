import { Search, Bell, ChevronDown, Menu } from "lucide-react";

export function AdminHeader({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  return (
    <header className="h-14 bg-card border-b flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded hover:bg-muted transition-colors text-muted-foreground">
          <Search className="h-4 w-4" />
        </button>
        <button className="p-2 rounded hover:bg-muted transition-colors text-muted-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
        </button>
        <div className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-muted rounded-md px-2 py-1 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-medium">程</span>
          </div>
          <span className="text-sm text-foreground">程女士</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
