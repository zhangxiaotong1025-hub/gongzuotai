import { useState, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Building2, Users, Shield, Gift, Tag, UserCircle, Sliders,
  FolderTree, Package, ShoppingBag, Key, Layout, Monitor,
  FileText, Megaphone, BarChart3, ChevronDown, Zap, Ruler,
  Box, Layers, ClipboardList, Wallet, Activity, Store,
  Briefcase, Star, Heart,
} from "lucide-react";
import { useAuth, isSuperAdmin } from "@/hooks/useAuth";

type Scope = "platform" | "enterprise" | "both";

interface NavGrandChild {
  label: string;
  path: string;
  scope?: Scope;
}

interface NavChild {
  label: string;
  path: string;
  icon?: React.ElementType;
  children?: NavGrandChild[];
  scope?: Scope;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: NavChild[];
  scope?: Scope;
}

/**
 * 菜单权限分析（scope 缺省 = both，平台/企业都可见）：
 *
 * 平台独有（scope: 'platform'）—— 平台资产治理 & 全局配置：
 *   - 企业管理 / 企业入驻申请（平台审核与维护企业档案）
 *   - 权限管理（菜单/角色/策略/平台管理员，平台统一下发）
 *   - 权益管理（应用/能力/规则/产品/SKU/套餐，平台定义可售权益）
 *   - 属性 / 类目 / 前台类目管理（平台标准化数据治理）
 *   - 营销结算 / 智能派发 / 运营配置（平台统一调度）
 *   - PRD 设计（内部产品文档）
 *
 * 企业独有（scope: 'enterprise'）—— 企业经营动作：
 *   - 商家经营（商家工作台、客资、签单、交付、评价、老客）
 *
 * 双方都可见（scope: 'both' 或缺省）：
 *   - 企业管理 → 人员管理（平台看全部，企业看本企业人员）
 *   - 品牌 / 客户 / 模型 / 商品 / 授权 / 方案 / 内容
 *   - 订单管理 / 权益账户（企业看自己的）
 *   - 智能营销（部分）/ 数据看版 / 智能经营
 */
const navItems: NavItem[] = [
  {
    label: "企业管理",
    icon: Building2,
    children: [
      { label: "企业管理", path: "/enterprise", scope: "platform" },
      { label: "人员管理", path: "/enterprise/staff" },
      { label: "企业入驻申请", path: "/enterprise/apply", scope: "platform" },
    ],
  },
  {
    label: "权限管理",
    icon: Shield,
    scope: "platform",
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
      { label: "数据看板", path: "/entitlement/dashboard", scope: "platform" },
      { label: "应用管理", path: "/entitlement/app", scope: "platform" },
      { label: "能力管理", path: "/entitlement/capability", scope: "platform" },
      { label: "权益规则", path: "/entitlement/rule", scope: "platform" },
      { label: "权益产品", path: "/entitlement/product", scope: "platform" },
      {
        label: "商品管理",
        path: "/entitlement/sku",
        scope: "platform",
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
      { label: "客户概览", path: "/customer/overview" },
      { label: "客户列表", path: "/customer/list" },
      { label: "营销策略", path: "/customer/marketing" },
    ],
  },
  { label: "属性管理", icon: Sliders, path: "/attribute", scope: "platform" },
  { label: "类目管理", icon: FolderTree, path: "/category", scope: "platform" },
  {
    label: "模型管理",
    icon: Box,
    children: [
      { label: "模型列表", path: "/model" },
    ],
  },
  {
    label: "商品管理",
    icon: ShoppingBag,
    children: [
      { label: "商品列表", path: "/product" },
    ],
  },
  { label: "授权管理", icon: Key, path: "/authorization" },
  { label: "方案管理", icon: Layout, path: "/plan" },
  { label: "前台类目管理", icon: Monitor, path: "/front-category", scope: "platform" },
  { label: "内容管理", icon: FileText, path: "/content" },
  {
    label: "智能营销",
    icon: Megaphone,
    children: [
      { label: "营销驾驶舱", path: "/marketing" },
      { label: "渠道管理", path: "/marketing/channels" },
      { label: "活动管理", path: "/marketing/campaigns" },
      { label: "线索池", path: "/marketing/leads" },
      { label: "呼叫中心", path: "/marketing/call-center" },
      { label: "智能派发", path: "/marketing/distribution", scope: "platform" },
      { label: "跟进追踪", path: "/marketing/tracking" },
      { label: "结算中心", path: "/marketing/settlement", scope: "platform" },
      { label: "运营配置", path: "/marketing/settings", scope: "platform" },
    ],
  },
  { label: "数据看版", icon: BarChart3, path: "/dashboard" },
  {
    label: "商家经营",
    icon: Store,
    scope: "enterprise",
    children: [
      { label: "商家工作台", path: "/merchant" },
      { label: "我的客资", path: "/merchant/leads" },
      { label: "签单管理", path: "/merchant/deals" },
      { label: "项目交付", path: "/merchant/projects" },
      { label: "客户评价", path: "/merchant/reviews" },
      { label: "老客运营", path: "/merchant/retention" },
    ],
  },
  {
    label: "智能经营",
    icon: Zap,
    children: [
      { label: "经营中心", path: "/agent" },
      { label: "精准客资", path: "/agent/leads" },
    ],
  },
  {
    label: "PRD设计",
    icon: FileText,
    scope: "platform",
    children: [
      { label: "项目汇报（一页讲清）", path: "/prd/pitch" },
      { label: "项目价值与节奏", path: "/prd/ceo" },
      { label: "顶层架构总览", path: "/prd/architecture" },
      { label: "权益设计", path: "/prd/entitlement" },
      { label: "企业设计", path: "/prd/enterprise" },
    ],
  },
];

function matchScope(scope: Scope | undefined, perspective: "platform" | "enterprise") {
  if (!scope || scope === "both") return true;
  return scope === perspective;
}

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string[]>(["企业管理"]);

  // 「创建平台管理员」入口仅对白名单超级管理员可见
  const visibleNavItems = useMemo(() => {
    if (isSuperAdmin(user)) {
      return navItems.map((item) =>
        item.label === "权限管理" && item.children
          ? { ...item, children: [...item.children, { label: "平台管理员", path: "/permission/platform-admin" }] }
          : item
      );
    }
    return navItems;
  }, [user]);

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
          {visibleNavItems.map((item) => {
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
