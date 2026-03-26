import { useLocation } from "react-router-dom";
import { Search, Bell, ChevronDown, Menu, Settings } from "lucide-react";

const ROUTE_BREADCRUMBS: Record<string, string[]> = {
  "/enterprise": ["企业管理", "企业管理"],
  "/enterprise/create": ["企业管理", "企业管理", "新建企业"],
  "/enterprise/staff": ["企业管理", "人员管理"],
  "/enterprise/staff/create": ["企业管理", "人员管理", "新建人员"],
  "/enterprise/apply": ["企业管理", "企业入驻申请"],
  "/permission": ["权限管理"],
  "/entitlement": ["权益管理"],
  "/brand": ["品牌管理"],
  "/customer": ["客户管理"],
  "/attribute": ["属性管理"],
  "/category": ["类目管理"],
  "/material": ["素材管理"],
  "/product": ["商品管理"],
  "/authorization": ["授权管理"],
  "/plan": ["方案管理"],
  "/front-category": ["前台类目管理"],
  "/content": ["内容管理"],
  "/marketing": ["营销管理"],
  "/dashboard": ["数据看版"],
};

function getBreadcrumbs(pathname: string): string[] {
  // Exact match first
  if (ROUTE_BREADCRUMBS[pathname]) return ROUTE_BREADCRUMBS[pathname];
  // Dynamic routes
  if (pathname.startsWith("/enterprise/staff/detail/")) return ["企业管理", "人员管理", "人员详情"];
  if (pathname.startsWith("/enterprise/staff/create")) return ["企业管理", "人员管理", "新建人员"];
  if (pathname.startsWith("/enterprise/detail/")) return ["企业管理", "企业管理", "企业详情"];
  if (pathname.startsWith("/enterprise/create")) return ["企业管理", "企业管理", "新建企业"];
  // Fallback
  return ["首页"];
}

export function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const location = useLocation();
  const crumbs = getBreadcrumbs(location.pathname);

  return (
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
        <div className="hidden sm:flex items-center text-[13px] text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <span className="mx-2 opacity-30">/</span>}
              <span className={i === crumbs.length - 1 ? "text-foreground font-medium" : ""}>
                {c}
              </span>
            </span>
          ))}
        </div>
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
        <div className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-muted rounded-lg px-2.5 py-1.5 transition-colors">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))' }}
          >
            <span className="text-primary-foreground text-[11px] font-medium">程</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] text-foreground leading-tight">程女士</span>
            <span className="text-[11px] text-muted-foreground leading-tight">超级管理员</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
        </div>
      </div>
    </header>
  );
}
