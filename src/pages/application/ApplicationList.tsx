import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Download, ExternalLink } from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { CreateEnterpriseDialog } from "@/pages/enterprise/CreateEnterpriseDialog";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ── Types ── */
type ApplicationStatus = "pending" | "created" | "closed";

interface Application {
  id: string;
  name: string;
  type: string;
  status: ApplicationStatus;
  products: string[];
  industry: string;
  region: string;
  applyTime: string;
  legalRep: string;
  legalPhone: string;
  businessLicense: boolean;
  note: string;
  source: string;
  // linked enterprise (if created)
  enterpriseId?: string;
  enterpriseName?: string;
}

/* ── Mock Data ── */
const NAMES = [
  "上海自然博物馆有限公司", "北京中建科技集团有限公司", "广州恒大家居科技有限公司",
  "深圳前海设计工坊有限公司", "杭州绿城装饰工程有限公司", "南京金陵建材集团有限公司",
  "成都天府家居股份有限公司", "武汉长江设计院有限公司", "重庆山城装饰有限公司",
  "西安大唐家居科技有限公司",
];
const TYPES = ["品牌商", "经销商", "装修公司", "卖场", "门店", "工作室"];
const PRODUCTS = ["国内3D", "国际3D", "智能导购", "VR全景"];
const INDUSTRIES = ["硬装", "软装", "全屋定制", "建材", "家电"];
const REGIONS = ["湖北/武汉", "上海/浦东", "北京/朝阳", "广东/广州", "浙江/杭州", "四川/成都"];
const SOURCES = ["官网", "线下活动", "渠道推荐", "电话咨询", "展会"];
const LEGAL_NAMES = ["王王", "李明", "张伟", "赵静", "刘洋", "陈芳", "杨帆"];

function randomPick<T>(arr: T[], count?: number): T[] {
  const c = count || Math.ceil(Math.random() * arr.length);
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(c, arr.length));
}

const initialData: Application[] = Array.from({ length: 30 }, (_, i) => {
  const statusRand = Math.random();
  const status: ApplicationStatus = statusRand > 0.6 ? "pending" : statusRand > 0.25 ? "created" : "closed";
  return {
    id: `APP${String(i + 1).padStart(4, "0")}`,
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    type: TYPES[Math.floor(Math.random() * TYPES.length)],
    status,
    products: randomPick(PRODUCTS, Math.floor(Math.random() * 3) + 1),
    industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
    region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    applyTime: `2020-1-25 10:10`,
    legalRep: LEGAL_NAMES[Math.floor(Math.random() * LEGAL_NAMES.length)],
    legalPhone: `1${Math.floor(Math.random() * 9) + 1}${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
    businessLicense: Math.random() > 0.3,
    note: ["稳定续费客户，主要销售硬装瓷砖", "新客户咨询", "渠道推荐客户", "展会收集客户", "重点意向客户"][Math.floor(Math.random() * 5)],
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    enterpriseId: status === "created" ? `ENT${String(Math.floor(Math.random() * 100) + 1).padStart(3, "0")}` : undefined,
    enterpriseName: status === "created" ? NAMES[Math.floor(Math.random() * NAMES.length)] : undefined,
  };
});

/* ── Status Config ── */
const STATUS_MAP: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: "待处理", className: "badge-warning" },
  created: { label: "已创建企业", className: "badge-active" },
  closed: { label: "已关闭", className: "badge-inactive" },
};

/* ── Filter Fields ── */
const filterFields: FilterField[] = [
  { key: "name", label: "企业名称", type: "input", placeholder: "请输入", width: 200 },
  { key: "id", label: "申请ID", type: "input", placeholder: "请输入", width: 150 },
  { key: "type", label: "企业类型", type: "select", options: TYPES.map((t) => ({ label: t, value: t })), width: 140 },
  { key: "status", label: "处理状态", type: "select", options: [
    { label: "待处理", value: "pending" },
    { label: "已创建企业", value: "created" },
    { label: "已关闭", value: "closed" },
  ], width: 120 },
  { key: "source", label: "来源渠道", type: "select", options: SOURCES.map((s) => ({ label: s, value: s })), width: 120 },
  { key: "applyFrom", label: "申请时间", type: "date", width: 160 },
];

/* ── Columns ── */
const columns: TableColumn<Application>[] = [
  {
    key: "name",
    title: "企业名称",
    minWidth: 220,
    render: (v) => <span className="text-foreground font-medium">{v}</span>,
  },
  {
    key: "type",
    title: "企业类型",
    minWidth: 90,
    render: (v) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{v}</span>
    ),
  },
  {
    key: "status",
    title: "状态",
    minWidth: 110,
    render: (v: ApplicationStatus, row) => {
      const cfg = STATUS_MAP[v];
      const app = row as Application;
      return (
        <div className="flex items-center gap-1.5">
          <span className={cfg.className}>{cfg.label}</span>
          {v === "created" && app.enterpriseId && (
            <a
              href={`/enterprise/detail/${app.enterpriseId}`}
              onClick={(e) => { e.stopPropagation(); }}
              className="text-primary hover:text-primary/80 transition-colors"
              title={`查看企业：${app.enterpriseName}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      );
    },
  },
  {
    key: "products",
    title: "申请产品",
    minWidth: 180,
    render: (v: string[]) => (
      <div className="flex gap-1 flex-wrap">
        {v.map((p) => <span key={p} className="badge-product">{p}</span>)}
      </div>
    ),
  },
  { key: "industry", title: "行业", minWidth: 80 },
  { key: "region", title: "覆盖区域", minWidth: 100 },
  {
    key: "applyTime",
    title: "申请时间",
    minWidth: 150,
    render: (v) => <span className="text-muted-foreground">{v}</span>,
  },
  { key: "legalRep", title: "法人姓名", minWidth: 80 },
  {
    key: "businessLicense",
    title: "营业执照",
    minWidth: 80,
    align: "center",
    render: (v: boolean) => (
      <span className={`text-xs ${v ? "text-foreground" : "text-muted-foreground"}`}>
        {v ? "已上传" : "—"}
      </span>
    ),
  },
  {
    key: "note",
    title: "备注",
    minWidth: 200,
    render: (v) => (
      <span className="text-muted-foreground block max-w-[200px] truncate" title={v}>{v}</span>
    ),
  },
];

/* ── Process Dialog ── */
function ProcessDialog({
  open,
  record,
  onClose,
  onProcess,
}: {
  open: boolean;
  record: Application | null;
  onClose: () => void;
  onProcess: (id: string, action: "close" | "create") => void;
}) {
  if (!open || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[480px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        {/* Header */}
        <div className="border-b bg-muted/40 px-5 py-4">
          <h3 className="text-[15px] font-semibold text-foreground">处理申请</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            请选择对「{record.name}」的申请进行处理
          </p>
        </div>

        {/* Application summary */}
        <div className="px-5 py-4 space-y-2 text-[13px]">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-[70px] text-right shrink-0">企业名称：</span>
            <span className="text-foreground font-medium">{record.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-[70px] text-right shrink-0">企业类型：</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{record.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-[70px] text-right shrink-0">申请产品：</span>
            <div className="flex gap-1 flex-wrap">
              {record.products.map((p) => <span key={p} className="badge-product">{p}</span>)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-[70px] text-right shrink-0">来源渠道：</span>
            <span>{record.source}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">取消</button>
          <button
            onClick={() => onProcess(record.id, "close")}
            className="btn-ghost flex-1 text-destructive border border-destructive/20 hover:bg-destructive/5"
          >
            关闭申请
          </button>
          <button
            onClick={() => onProcess(record.id, "create")}
            className="btn-primary flex-1"
          >
            创建企业
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function ApplicationList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Application[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [processTarget, setProcessTarget] = useState<Application | null>(null);
  const [closeConfirm, setCloseConfirm] = useState<Application | null>(null);
  const [createTarget, setCreateTarget] = useState<Application | null>(null);
  const totalItems = 1200;

  const updateApplication = useCallback((id: string, patch: Partial<Application>) => {
    setData((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const TYPE_KEY_MAP: Record<string, string> = {
    "品牌商": "brand", "经销商": "dealer", "装修公司": "decoration",
    "卖场": "mall", "门店": "store", "工作室": "studio",
  };

  const handleProcess = useCallback((id: string, action: "close" | "create") => {
    setProcessTarget(null);
    if (action === "close") {
      const target = data.find((a) => a.id === id);
      if (target) setCloseConfirm(target);
    } else {
      const app = data.find((a) => a.id === id);
      if (app) setCreateTarget(app);
    }
  }, [data]);

  const handleTypeSelected = useCallback((type: string) => {
    if (createTarget) {
      navigate(`/enterprise/create?type=${type}&fromApplication=${createTarget.id}`);
      setCreateTarget(null);
    }
  }, [createTarget, navigate]);

  const handleCloseConfirm = useCallback(() => {
    if (!closeConfirm) return;
    updateApplication(closeConfirm.id, { status: "closed" });
    toast.success("申请已关闭");
    setCloseConfirm(null);
  }, [closeConfirm, updateApplication]);

  const listActions: ActionItem<Application>[] = [
    {
      label: "处理",
      onClick: (r) => setProcessTarget(r),
      visible: (r) => r.status === "pending",
    },
    {
      label: "查看",
      onClick: (r) => navigate(`/enterprise/apply/detail/${r.id}`),
    },
    {
      label: "编辑",
      onClick: (r) => navigate(`/enterprise/apply/detail/${r.id}?mode=edit`),
      visible: (r) => r.status === "pending",
    },
    {
      label: "关闭",
      onClick: (r) => setCloseConfirm(r),
      visible: (r) => r.status === "pending",
      danger: true,
      confirm: {
        title: "确认关闭该申请？",
        description: "关闭后该申请将标记为无效，后续不可恢复。",
        confirmLabel: "确认关闭",
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="企业入驻申请"
        subtitle={`共 ${totalItems} 个申请`}
        actions={
          <button className="btn-secondary">
            <Download className="h-4 w-4" />
            导出
          </button>
        }
      />

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onSearch={() => console.log("search", filters)}
        onReset={() => setFilters({})}
        maxVisible={4}
      />

      <AdminTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        actions={listActions}
        maxVisibleActions={2}
      />

      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}>
        <Pagination
          current={currentPage}
          total={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        />
      </div>

      {/* Process Dialog */}
      <ProcessDialog
        open={Boolean(processTarget)}
        record={processTarget}
        onClose={() => setProcessTarget(null)}
        onProcess={handleProcess}
      />

      {/* Close Confirm */}
      <AlertDialog open={Boolean(closeConfirm)} onOpenChange={(o) => { if (!o) setCloseConfirm(null); }}>
        <AlertDialogContent
          className="max-w-[420px] overflow-hidden rounded-xl border bg-card p-0"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="border-b bg-muted/40 px-5 py-4">
            <AlertDialogTitle className="text-[15px] font-semibold text-foreground">
              确认关闭该申请？
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-1 text-[13px] leading-6 text-muted-foreground">
              关闭后该申请将标记为无效，后续不可恢复。
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="gap-2 px-5 py-4">
            <AlertDialogCancel className="mt-0 h-9 rounded-lg px-4 text-[13px]">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseConfirm}
              className="h-9 rounded-lg px-4 text-[13px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认关闭
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Enterprise Type Dialog */}
      <CreateEnterpriseDialog
        open={Boolean(createTarget)}
        onClose={() => setCreateTarget(null)}
        onSelect={handleTypeSelected}
        defaultType={createTarget ? (TYPE_KEY_MAP[createTarget.type] || "brand") : undefined}
        title="创建企业"
        subtitle={`基于「${createTarget?.name || ""}」的申请创建企业，请确认或修改企业类型`}
      />
    </div>
  );
}
