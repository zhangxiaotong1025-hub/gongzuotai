import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Building2, Users, Shield, Gift, Tag, UserCircle, Sliders,
  FolderTree, Package, ShoppingBag, Key, Layout, Monitor,
  FileText, Megaphone, BarChart3, ChevronDown, Zap, Ruler,
  Box, Layers, ClipboardList, Wallet, Activity,
} from "lucide-react";

interface NavGrandChild {
  label: string;
  path: string;
}

interface NavChild {
  label: string;
  path: string;
  icon?: React.ElementType;
  children?: NavGrandChild[];
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: "企业管理",
    icon: Building2,
    children: [
      { label: "企业管理", path: "/enterprise" },
      { label: "人员管理", path: "/enterprise/staff" },
      { label: "企业入驻申请", path: "/enterprise/apply" },
    ],
  },
  {
    label: "权限管理",
    icon: Shield,
    children: [
      { label: "菜单管理", path: "/permission/menu" },
      { label: "角色管理", path: "/permission/role" },
      { label: "策略管理", path: "/permission/resource" },
    ],
  },
  {
    label: "权益管理",
    icon: Gift,
    children: [
      { label: "数据看板", path: "/entitlement/dashboard" },
      { label: "应用管理", path: "/entitlement/app" },
      { label: "能力管理", path: "/entitlement/capability" },
      { label: "权益规则", path: "/entitlement/rule" },
      {
        label: "商品管理",
        path: "/entitlement/sku",
        children: [
          { label: "商品SKU", path: "/entitlement/sku" },
          { label: "商品套餐", path: "/entitlement/package" },
        ],
      },
      { label: "订单管理", path: "/entitlement/order" },
      { label: "权益账户", path: "/entitlement/account" },
    ],
  },
  { label: "品牌管理", icon: Tag, path: "/brand" },
  {
    label: "客户管理",
    icon: Users,
    children: [
      { label: "个人设计师", path: "/customer/designer" },
      { label: "企业下游客户", path: "/customer/end-customer" },
      { label: "生命周期看板", path: "/customer/lifecycle" },
      { label: "行为分析", path: "/customer/behavior" },
      { label: "营销策略", path: "/customer/marketing" },
    ],
  },
  { label: "属性管理", icon: Sliders, path: "/attribute" },
  { label: "类目管理", icon: FolderTree, path: "/category" },
  { label: "素材管理", icon: Package, path: "/material" },
  { label: "商品管理", icon: ShoppingBag, path: "/product" },
  { label: "授权管理", icon: Key, path: "/authorization" },
  { label: "方案管理", icon: Layout, path: "/plan" },
  { label: "前台类目管理", icon: Monitor, path: "/front-category" },
  { label: "内容管理", icon: FileText, path: "/content" },
  { label: "营销管理", icon: Megaphone, path: "/marketing" },
  { label: "数据看版", icon: BarChart3, path: "/dashboard" },
];

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<string[]>(["企业管理"]);

  const toggleExpand = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const isChildActive = (child: NavChild) => {
    if (isActive(child.path)) return true;
    if (child.children?.some((gc) => isActive(gc.path))) return true;
    return location.pathname.startsWith(child.path + "/");
  };

  const isGroupActive = (item: NavItem) =>
    item.children?.some((c) => isChildActive(c));

  return (
    <aside
      className="fixed left-0 top-0 h-full border-r border-border/60 z-30 flex flex-col transition-all duration-200"
      style={{
        width: collapsed ? 0 : 220,
        overflow: "hidden",
        background: 'hsl(var(--sidebar-background))',
      }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--primary))' }}>
            <span className="text-primary-foreground font-bold text-[12px]">居</span>
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[13px] font-semibold text-foreground leading-tight tracking-tight">居然设计家</span>
            <span className="text-[10px] text-muted-foreground leading-tight">管理后台</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            if (item.children) {
              const isOpen = expanded.includes(item.label);
              const groupActive = isGroupActive(item);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all ${
                      groupActive
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="ml-[30px] mt-0.5 space-y-0.5 border-l border-border/50 pl-3">
                      {item.children.map((child) => {
                        if (child.children) {
                          const subOpen = expanded.includes(child.label);
                          const subActive = isChildActive(child);
                          return (
                            <div key={child.label}>
                              <button
                                onClick={() => toggleExpand(child.label)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 text-[13px] rounded-md transition-all ${
                                  subActive
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                }`}
                              >
                                <span>{child.label}</span>
                                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${subOpen ? "" : "-rotate-90"}`} />
                              </button>
                              <div className={`overflow-hidden transition-all duration-200 ${subOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border/40 pl-3">
                                  {child.children.map((gc) => (
                                    <Link
                                      key={gc.path}
                                      to={gc.path}
                                      className={`block px-3 py-1.5 text-[12px] rounded-md transition-all ${
                                        isActive(gc.path)
                                          ? "text-primary font-medium bg-primary/5"
                                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                      }`}
                                    >
                                      {gc.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block px-3 py-1.5 text-[13px] rounded-md transition-all ${
                              isActive(child.path)
                                ? "text-primary font-medium bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.path!}
                className={`flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all ${
                  isActive(item.path!)
                    ? "text-primary font-medium bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
