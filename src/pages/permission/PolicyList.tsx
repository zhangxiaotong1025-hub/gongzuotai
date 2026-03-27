import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { policyData, POLICY_TYPE_MAP, POLICY_CONDITION_LABELS, menuData, type Policy } from "@/data/permission";
import { Plus, Shield, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const filterFields: FilterField[] = [
  { key: "keyword", label: "策略名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "type", label: "策略类型", type: "select", options: [
    { label: "产品准入", value: "product_access" },
    { label: "菜单可见性", value: "menu_visibility" },
    { label: "资产权限", value: "asset_permission" },
    { label: "权益校验", value: "entitlement_check" },
  ], width: 140 },
  { key: "effect", label: "策略效果", type: "select", options: [
    { label: "允许", value: "allow" },
    { label: "拒绝", value: "deny" },
  ], width: 100 },
  { key: "status", label: "状态", type: "select", options: [
    { label: "启用", value: "active" },
    { label: "停用", value: "inactive" },
  ], width: 100 },
];

export default function PolicyList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = policyData.filter(p => {
    if (filters.keyword && !p.name.includes(filters.keyword) && !p.code.includes(filters.keyword)) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.effect && p.effect !== filters.effect) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  }).sort((a, b) => b.priority - a.priority);

  // Stats by type
  const typeStats = Object.entries(POLICY_TYPE_MAP).map(([key, cfg]) => ({
    type: key,
    label: cfg.label,
    className: cfg.className,
    count: policyData.filter(p => p.type === key).length,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="策略管理"
        subtitle="管理权限判断的核心策略规则，策略按优先级从高到低执行，支持产品准入、菜单可见性、资产权限、权益校验四种类型"
        actions={
          <div className="flex gap-2">
            <button className="btn-primary"><Plus className="h-4 w-4" /> 新建策略</button>
          </div>
        }
      />

      {/* 类型统计 */}
      <div className="grid grid-cols-4 gap-3">
        {typeStats.map(stat => (
          <div key={stat.type} className="bg-card rounded-xl border p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className={stat.className}>{stat.label}</span>
              <span className="text-[20px] font-bold text-foreground">{stat.count}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {stat.type === "product_access" ? "控制产品主开关" :
               stat.type === "menu_visibility" ? "控制菜单可见性" :
               stat.type === "asset_permission" ? "控制资产操作权限" : "校验权益配置"}
            </p>
          </div>
        ))}
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
        onSearch={() => {}}
        onReset={() => setFilters({})}
        maxVisible={4}
      />

      {/* 策略列表 */}
      <div className="space-y-3">
        {filtered.map(policy => {
          const typeCfg = POLICY_TYPE_MAP[policy.type];
          const isExpanded = expandedId === policy.id;
          const targetMenus = (policy.targetMenuIds || []).map(id => menuData.find(m => m.id === id)).filter(Boolean);

          return (
            <div key={policy.id} className="bg-card rounded-xl border overflow-hidden transition-all" style={{ boxShadow: "var(--shadow-xs)" }}>
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : policy.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/5 shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-foreground">{policy.name}</span>
                    <span className={typeCfg.className}>{typeCfg.label}</span>
                    <span className={policy.effect === "allow" ? "badge-active" : "badge-danger"}>
                      {policy.effect === "allow" ? "允许" : "拒绝"}
                    </span>
                    {policy.isSystem && <span className="badge-info text-[10px]">系统</span>}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{policy.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground">优先级</span>
                    <div className="text-[16px] font-bold text-foreground">{policy.priority}</div>
                  </div>
                  <span className={policy.status === "active" ? "badge-active" : "badge-inactive"}>
                    {policy.status === "active" ? "启用" : "停用"}
                  </span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t px-4 py-4 bg-muted/10">
                  <div className="grid grid-cols-2 gap-6">
                    {/* 条件 */}
                    <div>
                      <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">判断条件</h4>
                      <div className="space-y-2">
                        {policy.conditions.map((cond, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="badge-product shrink-0 mt-0.5">{POLICY_CONDITION_LABELS[cond.field]}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mt-1 shrink-0" />
                            <span className="text-[12px] text-foreground">{cond.label}</span>
                          </div>
                        ))}
                      </div>
                      {policy.conditions.length > 1 && (
                        <p className="text-[11px] text-muted-foreground mt-2 italic">所有条件需同时满足 (AND)</p>
                      )}
                    </div>

                    {/* 影响范围 */}
                    <div>
                      <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">影响范围</h4>
                      {targetMenus.length > 0 ? (
                        <div className="space-y-1.5">
                          {targetMenus.map(menu => menu && (
                            <Link key={menu.id} to={`/permission/menu/detail/${menu.id}`} className="flex items-center gap-2 text-[12px] text-primary hover:underline">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {menu.name}
                              <span className="text-muted-foreground font-mono">({menu.code})</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[12px] text-muted-foreground">全局策略，影响所有匹配条件的对象</p>
                      )}
                    </div>
                  </div>

                  {/* 操作 */}
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <button className="btn-secondary text-[12px] py-1.5 px-3" onClick={() => toast.info("编辑策略")}>编辑</button>
                    <button className="btn-secondary text-[12px] py-1.5 px-3" onClick={() => toast.info("模拟测试")}>模拟测试</button>
                    {!policy.isSystem && (
                      <button className="btn-secondary text-[12px] py-1.5 px-3 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => toast.info("停用策略")}>停用</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PRD 铁律说明 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">权限判断铁律</h3>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-semibold text-destructive mb-1">铁律 1</p>
            <p className="text-muted-foreground leading-relaxed">任何权限判断，不得直接依赖企业类型。企业类型仅用于初始化默认配置模板。</p>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-semibold text-destructive mb-1">铁律 2</p>
            <p className="text-muted-foreground leading-relaxed">菜单是否可见，不等于是否具备能力。权限判断必须发生在能力执行层。</p>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-semibold text-destructive mb-1">铁律 3</p>
            <p className="text-muted-foreground leading-relaxed">品牌关系只影响资产归属与公有资产生产权，不影响功能菜单开放。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
