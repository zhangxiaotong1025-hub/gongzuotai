import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { Progress } from "@/components/ui/progress";
import { Download, Plus, Minus, Building2, User, Eye, RefreshCw } from "lucide-react";
import { accountData as initialData, appData, getAccountStats, type EntitlementAccount } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "customer", label: "企业名称", type: "input", placeholder: "请输入企业名称搜索", width: 220 },
];

export default function AccountList() {
  const navigate = useNavigate();
  const [data] = useState<EntitlementAccount[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = data.filter((d) => {
    if (filters.customer && !d.customerName.includes(filters.customer)) return false;
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

  const getUsageColor = (rate: number) => {
    if (rate >= 80) return "text-destructive";
    if (rate >= 50) return "text-amber-500";
    return "text-primary";
  };

  const getProgressColor = (rate: number): string => {
    if (rate >= 80) return "bg-destructive";
    if (rate >= 50) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="权益账户"
        subtitle="查看企业的权益账户总览，一个企业一条记录，聚合展示企业下所有权益信息，点击展开可查看分配记录明细"
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

      {/* 表格 */}
      <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[40px]"></th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground min-w-[200px]">企业</th>
              <th className="text-center py-3 px-3 font-medium text-muted-foreground min-w-[80px]">产品数</th>
              <th className="text-center py-3 px-3 font-medium text-muted-foreground min-w-[80px]">权益数</th>
              <th className="text-center py-3 px-3 font-medium text-muted-foreground min-w-[90px]">有效实例数</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground min-w-[180px]">总使用率</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground min-w-[160px]">最近分配时间</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground min-w-[80px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((acc) => {
              const stats = getAccountStats(acc);
              const isExpanded = expanded.has(acc.id);
              const latestAlloc = acc.allocations.length > 0
                ? acc.allocations.reduce((a, b) => (a.allocatedAt > b.allocatedAt ? a : b))
                : null;

              return (
                <>
                  <tr
                    key={acc.id}
                    className={`border-b transition-colors hover:bg-muted/20 ${isExpanded ? "bg-muted/10" : ""} ${stats.usageRate >= 80 ? "bg-destructive/5" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleExpand(acc.id)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground"
                      >
                        {isExpanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {acc.customerType === "B"
                          ? <Building2 className="h-4 w-4 text-primary shrink-0" />
                          : <User className="h-4 w-4 text-accent-foreground shrink-0" />
                        }
                        <Link
                          to={`/entitlement/account/detail/${acc.id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {acc.customerName}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-medium">{stats.productCount}个产品</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-medium">{stats.capCount}项权益</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-medium">{stats.instanceCount}个实例</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-[100px]">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getProgressColor(stats.usageRate)}`}
                              style={{ width: `${Math.min(stats.usageRate, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className={`font-medium text-[12px] ${getUsageColor(stats.usageRate)}`}>
                          {stats.usageRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {latestAlloc?.allocatedAt || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/entitlement/account/detail/${acc.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline text-[12px]"
                      >
                        <Eye className="h-3.5 w-3.5" /> 查看详情
                      </Link>
                    </td>
                  </tr>

                  {/* 展开的分配记录 */}
                  {isExpanded && (
                    <tr key={`${acc.id}-expand`}>
                      <td colSpan={8} className="p-0">
                        <div className="bg-muted/20 border-b px-8 py-4">
                          <div className="flex items-center gap-2 mb-3 text-[12px] text-muted-foreground">
                            <span className="font-medium text-foreground">📋 分配记录（共 {acc.allocations.length} 条）</span>
                          </div>
                          <table className="w-full text-[12px]">
                            <thead>
                              <tr className="text-muted-foreground border-b border-border/40">
                                <th className="text-left py-2 font-medium">分配记录ID</th>
                                <th className="text-left py-2 font-medium">分配时间</th>
                                <th className="text-left py-2 font-medium">产品</th>
                                <th className="text-left py-2 font-medium">所属应用</th>
                                <th className="text-center py-2 font-medium">权益数</th>
                                <th className="text-center py-2 font-medium">实例数</th>
                                <th className="text-left py-2 font-medium">使用率</th>
                                <th className="text-left py-2 font-medium">来源订单</th>
                              </tr>
                            </thead>
                            <tbody>
                              {acc.allocations.map((alloc) => (
                                <tr key={alloc.id} className="border-b border-border/20 hover:bg-muted/30">
                                  <td className="py-2 font-mono text-muted-foreground">{alloc.id.toUpperCase()}</td>
                                  <td className="py-2 text-muted-foreground">{alloc.allocatedAt}</td>
                                  <td className="py-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${alloc.itemType === "bundle" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                                        {alloc.itemType === "bundle" ? "套餐" : "SKU"}
                                      </span>
                                      <span className="font-medium">{alloc.itemName}</span>
                                    </div>
                                  </td>
                                  <td className="py-2">
                                    <Link
                                      to={`/entitlement/app/detail/${alloc.appId}`}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary hover:bg-primary/20"
                                    >
                                      {alloc.appName}
                                    </Link>
                                  </td>
                                  <td className="py-2 text-center font-medium">{alloc.capabilityCount}项</td>
                                  <td className="py-2 text-center font-medium">{alloc.instanceCount}个</td>
                                  <td className="py-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-[60px]">
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${getProgressColor(alloc.usageRate)}`}
                                            style={{ width: `${Math.min(alloc.usageRate, 100)}%` }}
                                          />
                                        </div>
                                      </div>
                                      <span className={`text-[11px] ${getUsageColor(alloc.usageRate)}`}>{alloc.usageRate}%</span>
                                    </div>
                                  </td>
                                  <td className="py-2">
                                    <Link
                                      to={`/entitlement/order/detail/${alloc.orderId}`}
                                      className="text-primary hover:underline font-mono text-[11px]"
                                    >
                                      {alloc.orderNo}
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">暂无数据</td>
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
