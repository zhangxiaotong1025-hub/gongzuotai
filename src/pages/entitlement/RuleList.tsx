import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download } from "lucide-react";
import { ruleData as initialData, capabilityData, appData, PERIOD_TYPES, GRANT_TYPES, EXPIRE_POLICIES, STATUS_MAP, type EntitlementRule, getCapability, getSkusByRule } from "@/data/entitlement";
import { RuleDialog } from "./dialogs/RuleDialog";

const filterFields: FilterField[] = [
  { key: "name", label: "规则名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "capabilityId", label: "关联能力", type: "select", options: capabilityData.map((c) => ({ label: c.name, value: c.id })), width: 140 },
  { key: "grantType", label: "发放方式", type: "select", options: GRANT_TYPES.map((g) => ({ label: g.label, value: g.value })), width: 120 },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 100 },
];

export default function RuleList() {
  const navigate = useNavigate();
  const [data, setData] = useState<EntitlementRule[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EntitlementRule | null>(null);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("权益规则已更新");
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, status: "active", createdAt: new Date().toLocaleDateString("zh-CN") }, ...prev]);
      toast.success("权益规则已创建");
    }
    setDialogOpen(false); setEditTarget(null);
  }, [editTarget]);

  const toggleStatus = useCallback((item: EntitlementRule) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
    toast.success(item.status === "active" ? "已停用" : "已启用");
  }, []);

  const columns: TableColumn<EntitlementRule>[] = [
    { key: "name", title: "规则名称", minWidth: 160, render: (v, row) => <button className="text-foreground font-medium hover:text-primary transition-colors" onClick={() => navigate(`/entitlement/rule/detail/${(row as EntitlementRule).id}`)}>{v}</button> },
    { key: "capabilityId", title: "关联能力", minWidth: 100, render: (v: string) => { const cap = getCapability(v); return cap ? <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => navigate(`/entitlement/capability/detail/${v}`)}>{cap.name}</button> : <span>—</span>; } },
    { key: "quota", title: "额度", minWidth: 80, align: "right" as const, render: (v: number, row) => { const cap = getCapability((row as EntitlementRule).capabilityId); return <span className="font-medium text-foreground">{v.toLocaleString()}{cap ? ` ${cap.unit}` : ""}</span>; } },
    { key: "periodType", title: "周期", minWidth: 60, render: (v: string) => <span>{PERIOD_TYPES.find((p) => p.value === v)?.label || v}</span> },
    { key: "grantType", title: "发放方式", minWidth: 80, render: (v: string) => <span className="text-[12px] text-muted-foreground">{GRANT_TYPES.find((g) => g.value === v)?.label}</span> },
    { key: "isCumulative", title: "累积", minWidth: 50, align: "center" as const, render: (v: boolean) => v ? <span className="text-primary font-medium">是</span> : <span className="text-muted-foreground">否</span> },
    { key: "expirePolicy", title: "过期策略", minWidth: 80, render: (v: string) => <span className="text-[12px] text-muted-foreground">{EXPIRE_POLICIES.find((e) => e.value === v)?.label}</span> },
    { key: "id", title: "引用SKU", minWidth: 70, align: "center" as const, render: (_v, row) => { const count = getSkusByRule((row as EntitlementRule).id).length; return <span className={count > 0 ? "text-primary font-medium" : "text-muted-foreground"}>{count}</span>; } },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
  ];

  const actions: ActionItem<EntitlementRule>[] = [
    { label: "查看", onClick: (r) => navigate(`/entitlement/rule/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.status === "active" ? "停用" : "启用", onClick: toggleStatus },
    { label: "删除", danger: true, onClick: (r) => {
      if (getSkusByRule(r.id).length > 0) { toast.error("被商品引用的规则不能删除"); return; }
      setData((p) => p.filter((a) => a.id !== r.id)); toast.success("已删除");
    }},
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="权益规则管理" subtitle="定义额度、周期、刷新策略，是运营可配置的核心层" actions={
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
          <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
        </div>
      } />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={4} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}><Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} /></div>
      <RuleDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
