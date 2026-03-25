import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Building2,
  Users,
  FileCheck,
  Shield,
  Gift,
  Tag,
  UserCircle,
  Sliders,
  FolderTree,
  Package,
  ShoppingBag,
  Key,
  Layout,
  Monitor,
  FileText,
  Megaphone,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string }[];
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
  { label: "权限管理", icon: Shield, path: "/permission" },
  { label: "权益管理", icon: Gift, path: "/entitlement" },
  { label: "品牌管理", icon: Tag, path: "/brand" },
  { label: "客户管理", icon: UserCircle, path: "/customer" },
  { label: "属性管理", icon: Sliders, path: "/attribute" },
  { label: "类目管理", icon: FolderTree, path: "/category" },
  { label: "素材管理", icon: Package, path: "/material" },
  { label: "商品管理", icon: ShoppingBag, path: "/product" },
  { label: "授权管理", icon: Key, path: "/authorization" },
  { label: "方案管理", icon: Layout, path: "/plan" },
  { label: "前台类目管理管理", icon: Monitor, path: "/front-category" },
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
  const isGroupActive = (item: NavItem) =>
    item.children?.some((c) => location.pathname === c.path || location.pathname.startsWith(c.path + "/"));

  return (
    <aside
      className="fixed left-0 top-0 h-full bg-card border-r z-30 flex flex-col transition-all duration-200"
      style={{ width: collapsed ? 0 : 200, overflow: "hidden" }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">居</span>
          </div>
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">居然设计家</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = expanded.includes(item.label);
            const groupActive = isGroupActive(item);
            return (
              <div key={item.label} className="mb-0.5">
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
                    groupActive ? "text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
                {isOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                          isActive(child.path)
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path!}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors mb-0.5 ${
                isActive(item.path!)
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
