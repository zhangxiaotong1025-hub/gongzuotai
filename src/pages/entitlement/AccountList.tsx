import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { Download, ChevronDown, ChevronRight, Building2, User, Eye, RefreshCw, Heart, Target, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { accountData as initialData, getAccountStats, getAccountHealth, type EntitlementAccount } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "customer", label: "企业名称", type: "input", placeholder: "请输入企业名称搜索", width: 220 },
  { key: "health", label: "健康等级", type: "select", options: [
    { label: "全部", value: "" },
    { label: "优秀", value: "excellent" },
    { label: "良好", value: "good" },
    { label: "预警", value: "warning" },
    { label: "危险", value: "critical" },
  ], width: 120 },
];

const HEALTH_TAG: Record<string, { label: string; cls: string }> = {
  excellent: { label: "优秀", cls: "bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]" },
  good:      { label: "良好", cls: "bg-primary/8 text-primary" },
  warning:   { label: "预警", cls: "bg-[hsl(var(--warning)/0.08)] text-[hsl(var(--warning))]" },
  critical:  { label: "危险", cls: "bg-destructive/8 text-destructive" },
};

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-[hsl(var(--success))]" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function MiniBar({ value, max = 100, warn = false }: { value: number; max?: number; warn?: boolean }) {
  return (
    <div className="w-[56px] h-[5px] rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${warn ? "bg-destructive" : "bg-primary"}`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );
}

export default function AccountList() {
  const navigate = useNavigate();
  const [data] = useState<EntitlementAccount[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = data.filter((d) => {
    if (filters.customer && !d.customerName.includes(filters.customer)) return false;
    if (filters.health) {
      const h = getAccountHealth(d.id);
      if (h.healthLevel !== filters.health) return false;
    }
    return true;
  });

  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="权益账户"
        subtitle="按客户维度聚合权益使用情况、健康度与续订分析"
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary"><RefreshCw className="h-4 w-4" /> 刷新</button>
            <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
          </div>
        }
      />
      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onSearch={() => {}}
        onReset={() => setFilters({})}
        maxVisible={3}
      />

      <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="py-3 px-3 w-[32px]"></th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground">客户</th>
              <th className="text-center py-3 px-3 font-medium text-muted-foreground w-[72px]">健康度</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground w-[140px]">使用率</th>
              <th className="text-center py-3 px-3 font-medium text-muted-foreground w-[72px]">续订率</th>
              <th className="text-center py-3 px-3 font-medium text-muted-foreground w-[72px]">意向度</th>
              <th className="text-center py-3 px-3 font-medium text-muted-foreground w-[80px]">产品/权益</th>
              <th className="text-center py-3 px-3 font-medium text-muted-foreground w-[80px]">活跃用户</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground w-[120px]">最近分配</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground w-[80px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((acc) => {
              const stats = getAccountStats(acc);
              const health = getAccountHealth(acc.id);
              const htag = HEALTH_TAG[health.healthLevel];
              const isExpanded = expanded.has(acc.id);
              const latestAlloc = acc.allocations.length > 0
                ? acc.allocations.reduce((a, b) => (a.allocatedAt > b.allocatedAt ? a : b))
                : null;

              return (
                <>
                  <tr
                    key={acc.id}
                    className={`border-b transition-colors hover:bg-muted/20 cursor-pointer ${isExpanded ? "bg-muted/10" : ""} ${health.healthLevel === "critical" ? "bg-destructive/[0.02]" : ""}`}
                    onClick={() => toggleExpand(acc.id)}
                  >
                    <td className="py-3 px-3">
                      {isExpanded
                        ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.06)" }}>
                          {acc.customerType === "B"
                            ? <Building2 className="h-3.5 w-3.5 text-primary" />
                            : <User className="h-3.5 w-3.5 text-primary" />
                          }
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/entitlement/account/detail/${acc.id}`}
                            className="text-foreground font-medium hover:text-primary transition-colors text-[13px] block truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {acc.customerName}
                          </Link>
                          <span className="text-[11px] text-muted-foreground">{acc.appNames.join("、")}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[14px] font-semibold" style={{ color: htag.cls.includes("success") ? "hsl(var(--success))" : htag.cls.includes("destructive") ? "hsl(var(--destructive))" : htag.cls.includes("warning") ? "hsl(var(--warning))" : "hsl(var(--primary))" }}>
                          {health.healthScore}
                        </span>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${htag.cls}`}>
                          {htag.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <MiniBar value={stats.usageRate} warn={stats.usageRate >= 80} />
                        <span className={`text-[12px] font-medium tabular-nums ${stats.usageRate >= 80 ? "text-destructive" : stats.usageRate >= 50 ? "text-[hsl(var(--warning))]" : "text-foreground"}`}>
                          {stats.usageRate}%
                        </span>
                        {stats.usageRate >= 80 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[13px] font-medium ${health.renewalRate >= 80 ? "text-[hsl(var(--success))]" : health.renewalRate >= 50 ? "text-[hsl(var(--warning))]" : "text-destructive"}`}>
                        {health.renewalRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[13px] font-medium ${health.intentScore >= 70 ? "text-[hsl(var(--success))]" : health.intentScore >= 40 ? "text-foreground" : "text-muted-foreground"}`}>
                        {health.intentScore}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[12px] text-muted-foreground">{stats.productCount}个 / {stats.capCount}项</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[12px] text-foreground font-medium">{health.activeUsers}</span>
                      <span className="text-[11px] text-muted-foreground">/{health.totalUsers}</span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground text-[12px]">
                      {latestAlloc?.allocatedAt?.slice(0, 10) || "—"}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/entitlement/account/detail/${acc.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline text-[12px]"
                      >
                        <Eye className="h-3.5 w-3.5" /> 详情
                      </Link>
                    </td>
                  </tr>

                  {/* 展开：关键信号摘要 */}
                  {isExpanded && (
                    <tr key={`${acc.id}-expand`}>
                      <td colSpan={10} className="p-0">
                        <div className="bg-muted/15 border-b px-6 py-4">
                          <div className="grid grid-cols-12 gap-4">
                            {/* 左：分配记录 */}
                            <div className="col-span-7">
                              <div className="text-[12px] font-medium text-foreground mb-2.5">分配记录（{acc.allocations.length}条）</div>
                              <table className="w-full text-[12px]">
                                <thead>
                                  <tr className="text-muted-foreground border-b border-border/30">
                                    <th className="text-left py-1.5 font-medium">产品</th>
                                    <th className="text-left py-1.5 font-medium">应用</th>
                                    <th className="text-left py-1.5 font-medium">使用率</th>
                                    <th className="text-left py-1.5 font-medium">来源订单</th>
                                    <th className="text-left py-1.5 font-medium">分配时间</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {acc.allocations.map((alloc) => (
                                    <tr key={alloc.id} className="border-b border-border/15">
                                      <td className="py-1.5">
                                        <div className="flex items-center gap-1.5">
                                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${alloc.itemType === "bundle" ? "bg-accent/10 text-accent-foreground" : "bg-primary/8 text-primary"}`}>
                                            {alloc.itemType === "bundle" ? "套餐" : "SKU"}
                                          </span>
                                          <span className="font-medium text-foreground">{alloc.itemName}</span>
                                        </div>
                                      </td>
                                      <td className="py-1.5 text-muted-foreground">{alloc.appName}</td>
                                      <td className="py-1.5">
                                        <div className="flex items-center gap-2">
                                          <MiniBar value={alloc.usageRate} warn={alloc.usageRate >= 80} />
                                          <span className={`text-[11px] font-medium ${alloc.usageRate >= 80 ? "text-destructive" : "text-foreground"}`}>{alloc.usageRate}%</span>
                                        </div>
                                      </td>
                                      <td className="py-1.5">
                                        <Link to={`/entitlement/order/detail/${alloc.orderId}`} className="text-primary hover:underline font-mono text-[11px]">
                                          {alloc.orderNo}
                                        </Link>
                                      </td>
                                      <td className="py-1.5 text-muted-foreground">{alloc.allocatedAt.slice(0, 10)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {/* 右：风险与机会 */}
                            <div className="col-span-5 space-y-3">
                              {health.riskFactors.length > 0 && (
                                <div>
                                  <div className="text-[12px] font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                                    <AlertTriangle className="h-3.5 w-3.5" style={{ color: "hsl(var(--warning))" }} /> 风险信号
                                  </div>
                                  <div className="space-y-1">
                                    {health.riskFactors.map((r, i) => (
                                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                                        <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "hsl(var(--warning))" }} />
                                        {r}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {health.intentSignals.length > 0 && (
                                <div>
                                  <div className="text-[12px] font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                                    <Target className="h-3.5 w-3.5 text-primary" /> 意向信号
                                  </div>
                                  <div className="space-y-1">
                                    {health.intentSignals.slice(0, 3).map((sig, i) => (
                                      <div key={i} className="flex items-center justify-between text-[11px]">
                                        <span className="text-muted-foreground">{sig.label}</span>
                                        <div className="flex items-center gap-1">
                                          <span className="text-foreground">{sig.value}</span>
                                          <TrendIcon trend={sig.trend} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-muted-foreground">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}>
        <Pagination
          current={currentPage}
          total={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}
