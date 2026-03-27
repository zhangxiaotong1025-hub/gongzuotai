import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, Menu, Settings, LogOut, KeyRound, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChangePasswordDialog from "@/pages/auth/ChangePasswordDialog";

export function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.name || "用户";
  const displayRole = user?.role || "管理员";
  const displayEnterprise = user?.currentEnterprise?.name;
  const initial = displayName.charAt(0);

  return (
    <>
      <header
        className="h-14 border-b border-border/60 flex items-center justify-between px-5 sticky top-0 z-20"
        style={{ background: 'hsl(var(--card))', boxShadow: 'var(--shadow-xs)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
          {displayEnterprise && (
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span>{displayEnterprise}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-muted rounded-lg px-2.5 py-1.5 transition-colors">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))' }}
                >
                  <span className="text-primary-foreground text-[11px] font-medium">{initial}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] text-foreground leading-tight">{displayName}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">{displayRole}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                <KeyRound className="w-4 h-4 mr-2" />
                修改密码
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
    </>
  );
}
