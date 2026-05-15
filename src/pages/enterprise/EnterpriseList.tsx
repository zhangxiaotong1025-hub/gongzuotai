import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download, Building2 } from "lucide-react";
import { CreateEnterpriseDialog } from "./CreateEnterpriseDialog";
import { SetAdminDialog } from "./SetAdminDialog";
import { AuditDialog, type AuditRecord } from "./AuditDialog";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAuth } from "@/hooks/useAuth";

// ===== Data Model =====
type AuditStatus = "pending" | "approved" | "rejected";

interface Enterprise {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  auditStatus: AuditStatus;
  products: string[];
  subsidiaries: number;
  staff: number;
  createdAt: string;
  creator: string;
  updatedAt: string;
  note: string;
  admin?: string;
  adminPhone?: string;
  children?: Enterprise[];
  _level?: number;
  frozen?: boolean; // cascading freeze from parent
  _root?: boolean; // synthetic top-most row representing current login context
  auditRecords?: AuditRecord[];
}

// ===== Mock Data =====
// 真实头部家居企业（每条数据唯一，避免重复名称）
const TOP_ENTERPRISES: { name: string; short: string; type: string; products: string[] }[] = [
  { name: "欧派家居集团股份有限公司", short: "欧派", type: "品牌商", products: ["国内3D", "国际3D", "智能导购", "VR全景"] },
  { name: "索菲亚家居股份有限公司", short: "索菲亚", type: "品牌商", products: ["国内3D", "智能导购"] },
  { name: "尚品宅配家居股份有限公司", short: "尚品宅配", type: "品牌商", products: ["国内3D", "VR全景"] },
  { name: "金牌厨柜家居科技股份有限公司", short: "金牌厨柜", type: "品牌商", products: ["国内3D", "国际3D"] },
  { name: "志邦家居股份有限公司", short: "志邦", type: "品牌商", products: ["国内3D", "智能导购"] },
  { name: "我乐家居股份有限公司", short: "我乐", type: "品牌商", products: ["国内3D", "VR全景"] },
  { name: "好莱客创意家居股份有限公司", short: "好莱客", type: "品牌商", products: ["国内3D", "国际3D", "VR全景"] },
  { name: "皮阿诺家居股份有限公司", short: "皮阿诺", type: "品牌商", products: ["国内3D"] },
  { name: "顶固集创家居股份有限公司", short: "顶固", type: "品牌商", products: ["国际3D", "智能导购"] },
  { name: "居然之家家居新零售连锁集团", short: "居然之家", type: "卖场", products: ["国内3D", "国际3D", "智能导购", "VR全景"] },
];

const TYPES = ["品牌商", "经销商", "装修公司", "卖场", "门店", "工作室", "供应商"];
const PRODUCTS = ["国内3D", "国际3D", "智能导购", "VR全景"];
const CREATORS = ["张伟", "李娜", "王强", "赵敏", "刘洋", "陈静", "杨帆", "周倩", "黄磊", "吴婷"];

// 真实区域 / 城市分布
const REGIONS = ["华北", "华东", "华南", "华中", "西南", "东北", "西北"];
const REGION_CITIES: Record<string, string[]> = {
  "华北": ["北京", "天津", "石家庄", "太原", "济南"],
  "华东": ["上海", "杭州", "南京", "苏州", "宁波", "合肥"],
  "华南": ["广州", "深圳", "厦门", "福州", "南宁"],
  "华中": ["武汉", "长沙", "郑州", "南昌"],
  "西南": ["成都", "重庆", "昆明", "贵阳"],
  "东北": ["沈阳", "大连", "哈尔滨", "长春"],
  "西北": ["西安", "兰州", "乌鲁木齐"],
};
const DISTRICTS = ["朝阳", "海淀", "丰台", "浦东", "徐汇", "天河", "福田", "南山", "锦江", "武侯", "滨江", "鼓楼", "玄武"];

const TYPE_KEY_MAP: Record<string, string> = {
  "品牌商": "brand", "经销商": "dealer", "装修公司": "decoration",
  "卖场": "mall", "门店": "store", "工作室": "studio", "供应商": "supplier",
};

const SUB_TYPE_MAP: Record<string, string[]> = {
  "品牌商": ["经销商", "装修公司", "门店", "工作室"],
  "经销商": ["装修公司", "门店", "工作室"],
  "装修公司": ["门店", "工作室"],
  "门店": ["工作室"],
  "工作室": ["工作室"],
  "供应商": ["供应商"],
  "卖场": ["品牌商", "经销商", "装修公司", "门店"],
};

const NOTE_LIB: Record<string, string[]> = {
  "品牌商": ["核心战略客户，2023 年签约，年度 GMV 破亿", "全品类整装品牌，主推全屋定制方案", "年度合作伙伴，专属客户成功对接"],
  "经销商": ["大区独家代理，覆盖 5 个省份门店", "稳定续费客户，主要销售硬装瓷砖", "新签约渠道伙伴，试运营 3 个月"],
  "装修公司": ["华东大区直营，主推整装套餐", "新签约客户，处于试用期", "重点关注客户，季度复购率 60%"],
  "门店": ["旗舰店，月均到店客流 1500+", "社区店，主打小户型方案", "新开门店，处于市场培育期"],
  "工作室": ["独立设计师工作室，签约设计师 8 人", "高端定制工作室，客单价 20w+"],
  "卖场": ["全国连锁卖场，入驻品牌 200+", "区域型卖场，覆盖周边 50 公里商圈"],
  "供应商": ["A 级核心供应商，年度供货额 5000w+", "新晋供应商，处于评估期"],
};

let __seq = 1;
function pickFrom<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }
function pickNote(type: string): string {
  const lib = NOTE_LIB[type] || ["年度合作伙伴"];
  return lib[(__seq++) % lib.length];
}

function buildChildName(parentShort: string, type: string, region: string, city: string, district: string): string {
  switch (type) {
    case "经销商": return `${parentShort}${city}经销有限公司`;
    case "装修公司": return `${parentShort}${city}装饰工程有限公司`;
    case "门店": return `${parentShort}${city}${district}旗舰店`;
    case "工作室": return `${parentShort}${city}设计工作室`;
    case "供应商": return `${parentShort}${city}供应链有限公司`;
    case "品牌商": return `${parentShort}${region}品牌运营中心`;
    case "卖场": return `${parentShort}${city}卖场`;
    default: return `${parentShort}${city}分公司`;
  }
}

function staffByType(type: string): number {
  const base: Record<string, [number, number]> = {
    "品牌商": [120, 280], "经销商": [25, 70], "装修公司": [30, 90],
    "卖场": [60, 180], "门店": [6, 18], "工作室": [4, 12], "供应商": [40, 120],
  };
  const [min, max] = base[type] || [10, 50];
  return Math.floor(Math.random() * (max - min)) + min;
}

function pad2(n: number): string { return String(n).padStart(2, "0"); }
function makeDate(year: number): string {
  return `${year}-${pad2(Math.floor(Math.random() * 12) + 1)}-${pad2(Math.floor(Math.random() * 28) + 1)} ${pad2(9 + Math.floor(Math.random() * 9))}:${pad2(Math.floor(Math.random() * 60))}`;
}

interface BuildCtx { parentShort: string; depth: number; parentType: string; }

function generateChild(id: string, ctx: BuildCtx): Enterprise {
  const allowed = SUB_TYPE_MAP[ctx.parentType] || ["门店"];
  const type = pickFrom(allowed, __seq + ctx.depth);
  const region = pickFrom(REGIONS, __seq);
  const city = pickFrom(REGION_CITIES[region], __seq + 1);
  const district = pickFrom(DISTRICTS, __seq + 2);
  __seq++;
  const hasChildren = ctx.depth < 2 && (type === "经销商" || type === "装修公司" || type === "卖场") && Math.random() > 0.4;
  const childCount = hasChildren ? Math.floor(Math.random() * 3) + 2 : 0;
  const children = hasChildren
    ? Array.from({ length: childCount }, (_, i) => generateChild(`${id}-${i + 1}`, { parentShort: ctx.parentShort, depth: ctx.depth + 1, parentType: type }))
    : [];
  const descendants = children.reduce((s, c) => s + 1 + c.subsidiaries, 0);
  const selfStaff = staffByType(type);
  const staff = children.reduce((s, c) => s + c.staff, selfStaff);
  return {
    id,
    name: buildChildName(ctx.parentShort, type, region, city, district),
    type,
    status: Math.random() > 0.2 ? "active" : "inactive",
    auditStatus: "approved",
    admin: Math.random() > 0.3 ? CREATORS[Math.floor(Math.random() * CREATORS.length)] : undefined,
    adminPhone: Math.random() > 0.3 ? `138${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}` : undefined,
    products: ["国内3D"].concat(Math.random() > 0.6 ? ["VR全景"] : []).concat(Math.random() > 0.8 ? ["智能导购"] : []),
    subsidiaries: descendants,
    staff,
    createdAt: makeDate(2023 + Math.floor(Math.random() * 3)),
    creator: CREATORS[Math.floor(Math.random() * CREATORS.length)],
    updatedAt: makeDate(2026),
    note: pickNote(type),
    auditRecords: [],
    children,
  };
}

function generateTopEnterprise(id: string, idx: number): Enterprise {
  const meta = TOP_ENTERPRISES[idx % TOP_ENTERPRISES.length];
  // 总部企业(depth===0)进入审核流程；首条(idx===0)恒为已通过，便于演示当前登录企业
  let auditStatus: AuditStatus;
  if (idx === 0) {
    auditStatus = "approved";
  } else {
    const r = Math.random();
    auditStatus = r > 0.7 ? "pending" : r > 0.15 ? "approved" : "rejected";
  }
  // 首条企业构造 3-5 个大区/渠道子公司，下面再挂门店/工作室
  const childCount = idx === 0 ? 5 : auditStatus === "approved" ? Math.floor(Math.random() * 3) + 1 : 0;
  const usedRegions = new Set<string>();
  const children: Enterprise[] = [];
  for (let i = 0; i < childCount; i++) {
    // 首条按大区拆分，确保结构真实
    const region = idx === 0 ? REGIONS[i % REGIONS.length] : pickFrom(REGIONS, __seq);
    if (idx === 0 && usedRegions.has(region)) continue;
    usedRegions.add(region);
    const city = pickFrom(REGION_CITIES[region], __seq);
    const parentType = idx === 0 ? "经销商" : meta.type;
    __seq++;
    // 大区运营公司
    const regionalId = `${id}-${i + 1}`;
    const regionalChildren = Array.from({ length: Math.floor(Math.random() * 2) + 2 }, (_, j) =>
      generateChild(`${regionalId}-${j + 1}`, { parentShort: meta.short, depth: 1, parentType: "经销商" })
    );
    const descendants = regionalChildren.reduce((s, c) => s + 1 + c.subsidiaries, 0);
    const selfStaff = staffByType("经销商");
    const staff = regionalChildren.reduce((s, c) => s + c.staff, selfStaff);
    children.push({
      id: regionalId,
      name: `${meta.short}${region}运营有限公司`,
      type: "经销商",
      status: "active",
      auditStatus: "approved",
      admin: CREATORS[i % CREATORS.length],
      adminPhone: `139${String(10000000 + i * 137).slice(-8)}`,
      products: meta.products.slice(0, 2),
      subsidiaries: descendants,
      staff,
      createdAt: makeDate(2022 + Math.floor(Math.random() * 2)),
      creator: CREATORS[i % CREATORS.length],
      updatedAt: makeDate(2026),
      note: `${region}大区运营中心，下辖 ${city} 等核心市场`,
      auditRecords: [],
      children: regionalChildren,
      _level: 1,
    });
    void parentType;
  }
  const descendants = children.reduce((s, c) => s + 1 + c.subsidiaries, 0);
  const hqStaff = staffByType(meta.type);
  const staff = children.reduce((s, c) => s + c.staff, hqStaff);
  return {
    id,
    name: meta.name,
    type: meta.type,
    status: auditStatus === "approved" ? (idx === 0 ? "active" : Math.random() > 0.25 ? "active" : "inactive") : "inactive",
    auditStatus,
    admin: CREATORS[idx % CREATORS.length],
    adminPhone: `137${String(20000000 + idx * 211).slice(-8)}`,
    products: meta.products,
    subsidiaries: descendants,
    staff,
    createdAt: makeDate(2020 + (idx % 3)),
    creator: CREATORS[(idx + 3) % CREATORS.length],
    updatedAt: makeDate(2026),
    note: NOTE_LIB[meta.type][idx % (NOTE_LIB[meta.type].length)],
    auditRecords: auditStatus === "pending" ? [{
      id: `${id}-ar-1`, action: "submit",
      operator: CREATORS[idx % CREATORS.length],
      time: makeDate(2026), remark: "新企业入驻，提交平台审核",
    }] : auditStatus === "rejected" ? [
      { id: `${id}-ar-1`, action: "submit", operator: CREATORS[idx % CREATORS.length], time: makeDate(2026), remark: "新企业入驻，提交平台审核" },
      { id: `${id}-ar-2`, action: "reject", operator: "平台审核组", time: makeDate(2026), remark: "营业执照信息不清晰，请重新上传" },
    ] : [
      { id: `${id}-ar-1`, action: "submit", operator: CREATORS[idx % CREATORS.length], time: makeDate(2026), remark: "新企业入驻，提交平台审核" },
      { id: `${id}-ar-2`, action: "approve", operator: "平台审核组", time: makeDate(2026), remark: "资质完整，审核通过" },
    ],
    children,
  };
}

const initialData: Enterprise[] = Array.from({ length: 10 }, (_, i) =>
  generateTopEnterprise(`ENT${String(i + 1).padStart(3, "0")}`, i)
);

// ===== Audit Status Labels =====
const AUDIT_STATUS_MAP: Record<AuditStatus, { label: string; className: string }> = {
  pending: { label: "待审核", className: "badge-warning" },
  approved: { label: "已通过", className: "badge-active" },
  rejected: { label: "已驳回", className: "badge-danger" },
};

// ===== Filter Fields =====
const filterFields: FilterField[] = [
  { key: "name", label: "企业名称", type: "input", placeholder: "请输入企业名称", width: 200 },
  { key: "id", label: "企业ID", type: "input", placeholder: "请输入企业ID", width: 150 },
  { key: "type", label: "企业类型", type: "select", options: TYPES.map((t) => ({ label: t, value: t })), width: 140 },
  { key: "status", label: "业务状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
  { key: "auditStatus", label: "审核状态", type: "select", options: [{ label: "待审核", value: "pending" }, { label: "已通过", value: "approved" }, { label: "已驳回", value: "rejected" }], width: 120 },
  { key: "createdFrom", label: "创建时间", type: "date", width: 160 },
];

// ===== Columns =====
const columns: TableColumn<Enterprise>[] = [
  {
    key: "name",
    title: "企业名称",
    minWidth: 260,
    render: (v, row) => {
      const r = row as Enterprise;
      if (r._root) {
        return (
          <span className="inline-flex items-center gap-2 font-semibold text-foreground">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            {v}
            <span className="badge-info text-[10px] py-0">当前</span>
          </span>
        );
      }
      return (
        <span className="text-foreground font-medium">
          {v}
          {r.frozen && (
            <span className="ml-1.5 badge-danger text-[10px] py-0">已冻结</span>
          )}
        </span>
      );
    },
  },
  {
    key: "type",
    title: "企业类型",
    minWidth: 90,
    render: (v) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
        {v}
      </span>
    ),
  },
  {
    key: "auditStatus",
    title: "审核状态",
    minWidth: 90,
    render: (v: AuditStatus, row) => {
      const r = row as Enterprise;
      // root 与子企业(非总部)不进入审核
      if (r._root || (r._level || 0) > 0) return <span className="text-xs text-muted-foreground">—</span>;
      const cfg = AUDIT_STATUS_MAP[v];
      return <span className={cfg.className}>{cfg.label}</span>;
    },
  },
  {
    key: "status",
    title: "业务状态",
    minWidth: 90,
    render: (v, row) => {
      const ent = row as Enterprise;
      if (ent._root) {
        return <span className="badge-active">运行中</span>;
      }
      if (ent.frozen) {
        return <span className="badge-danger">已冻结</span>;
      }
      if (ent.auditStatus !== "approved") {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      return (
        <span className={v === "active" ? "badge-active" : "badge-inactive"}>
          {v === "active" ? "启用" : "停用"}
        </span>
      );
    },
  },
  {
    key: "products",
    title: "启用产品",
    minWidth: 180,
    render: (v: string[]) => (
      <div className="flex gap-1 flex-wrap">
        {v.map((p) => (
          <span key={p} className="badge-product">{p}</span>
        ))}
      </div>
    ),
  },
  {
    key: "subsidiaries",
    title: "子公司",
    minWidth: 80,
    align: "center",
    render: (v) => <span className="text-primary cursor-pointer hover:underline">{v}</span>,
  },
  {
    key: "staff",
    title: "人员",
    minWidth: 80,
    align: "center",
    render: (v) => <span className="text-primary cursor-pointer hover:underline">{v}</span>,
  },
  {
    key: "createdAt",
    title: "创建时间",
    minWidth: 150,
    render: (v) => <span className="text-muted-foreground">{v}</span>,
  },
  { key: "creator", title: "创建人", minWidth: 80 },
  {
    key: "updatedAt",
    title: "更新时间",
    minWidth: 150,
    render: (v) => <span className="text-muted-foreground">{v}</span>,
  },
  {
    key: "note",
    title: "备注",
    minWidth: 200,
    render: (v) => (
      <span className="text-muted-foreground block max-w-[200px] truncate" title={v}>
        {v}
      </span>
    ),
  },
];

// ===== Cascade freeze/unfreeze helpers =====
function freezeChildren(children?: Enterprise[]): Enterprise[] | undefined {
  if (!children) return children;
  return children.map((c) => ({
    ...c,
    frozen: true,
    status: "inactive" as const,
    children: freezeChildren(c.children),
  }));
}

function unfreezeChildren(children?: Enterprise[]): Enterprise[] | undefined {
  if (!children) return children;
  return children.map((c) => ({
    ...c,
    frozen: false,
    children: unfreezeChildren(c.children),
  }));
}

export default function EnterpriseList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const perspective: "platform" | "enterprise" = user?.perspective ?? "platform";
  const [data, setData] = useState<Enterprise[]>(initialData);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["ROOT_CURRENT", "ENT001"]));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [adminTarget, setAdminTarget] = useState<Enterprise | null>(null);
  const [subParent, setSubParent] = useState<Enterprise | null>(null);
  const [auditTarget, setAuditTarget] = useState<Enterprise | null>(null);
  const totalItems = 1200;

  // 构造一行"当前最高层级企业"作为列表第一条
  const displayData = useMemo<Enterprise[]>(() => {
    if (perspective === "platform") {
      const root: Enterprise = {
        id: "ROOT_CURRENT",
        name: "居然设计家平台",
        type: "平台",
        status: "active",
        auditStatus: "approved",
        products: PRODUCTS,
        subsidiaries: data.length,
        staff: data.reduce((sum, e) => sum + e.staff, 0),
        createdAt: "2020-01-01 00:00",
        creator: "系统",
        updatedAt: "—",
        note: "平台总控企业，不可编辑",
        _root: true,
        _level: 0,
        children: [], // 独立首条，不挂载子树
      };
      return [root, ...data];
    }
    // 企业后台视角：取第一家企业作为"当前企业"独立首条，其下级企业作为同级行展示
    const [current, ...rest] = data;
    if (!current) return [];
    const root: Enterprise = {
      ...current,
      id: `${current.id}-current`,
      _root: true,
      _level: 0,
      note: current.note || "当前登录企业，不可编辑",
      children: [],
    };
    // 当前企业的子公司作为列表数据展示，保留其下级树结构
    const relevel = (items: Enterprise[], level: number): Enterprise[] =>
      items.map((c) => ({
        ...c,
        _level: level,
        children: c.children ? relevel(c.children, level + 1) : c.children,
      }));
    const siblings: Enterprise[] = relevel(current.children || [], 0);
    void rest;
    return [root, ...siblings];
  }, [data, perspective]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const updateEnterprise = useCallback((id: string, patch: Partial<Enterprise>) => {
    const updateTree = (items: Enterprise[]): Enterprise[] =>
      items.map((e) => ({
        ...e,
        ...(e.id === id ? patch : {}),
        children: e.children ? updateTree(e.children) : e.children,
      }));
    setData((prev) => updateTree(prev));
  }, []);

  // Cascade-aware update: when rejecting/disabling parent, freeze all children
  const updateWithCascade = useCallback((id: string, patch: Partial<Enterprise>, cascade: "freeze" | "unfreeze" | "none") => {
    const updateTree = (items: Enterprise[]): Enterprise[] =>
      items.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...patch };
          if (cascade === "freeze") {
            updated.children = freezeChildren(e.children);
          } else if (cascade === "unfreeze") {
            updated.children = unfreezeChildren(e.children);
          }
          return updated;
        }
        return { ...e, children: e.children ? updateTree(e.children) : e.children };
      });
    setData((prev) => updateTree(prev));
  }, []);

  const handleToggleStatus = useCallback((record: Enterprise) => {
    const newStatus = record.status === "active" ? "inactive" : "active";
    // Disabling parent → freeze children; enabling → unfreeze children
    const cascade = newStatus === "inactive" ? "freeze" : "unfreeze";
    updateWithCascade(record.id, { status: newStatus }, cascade);
  }, [updateWithCascade]);

  const handleEnableClick = useCallback((record: Enterprise) => {
    if (!record.admin) {
      setAdminTarget(record);
      return;
    }
    handleToggleStatus(record);
  }, [handleToggleStatus]);

  const handleAuditConfirm = useCallback((result: { action: "approve" | "reject"; remark: string }) => {
    if (!auditTarget) return;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newRecord: AuditRecord = {
      id: `ar-${Date.now()}`,
      action: result.action,
      operator: "当前用户",
      time: timeStr,
      remark: result.remark,
    };
    const newAuditStatus = result.action === "approve" ? "approved" : "rejected";
    const cascade = result.action === "reject" ? "freeze" : "none";
    updateWithCascade(auditTarget.id, {
      auditStatus: newAuditStatus as AuditStatus,
      auditRecords: [...(auditTarget.auditRecords || []), newRecord],
    }, cascade as "freeze" | "unfreeze" | "none");
    setAuditTarget(null);
  }, [auditTarget, updateWithCascade]);

  const listActions: ActionItem<Enterprise>[] = [
    { label: "查看", onClick: (r) => navigate(`/enterprise/detail/${r.id}`) },
    {
      label: "审核",
      onClick: (r) => setAuditTarget(r),
      // 仅平台后台可审核，且仅总部企业(level 0、非 root)需要审核；待审核或已驳回均可（再次审核）
      visible: (r) =>
        perspective === "platform" &&
        !r._root &&
        (r._level || 0) === 0 &&
        (r.auditStatus === "pending" || r.auditStatus === "rejected"),
    },
    {
      label: "停用",
      onClick: handleToggleStatus,
      // 所有非 root 企业，只要已审核通过且当前为启用，都支持停用（平台/企业视角一致）
      visible: (r) => !r._root && !r.frozen && r.auditStatus === "approved" && r.status === "active",
      danger: true,
      confirm: {
        title: "确认停用该企业？",
        description: "停用后该企业及其所有子企业将被冻结，暂时无法使用，后续可重新启用。",
        confirmLabel: "确认停用",
      },
    },
    {
      label: "启用",
      onClick: handleEnableClick,
      // 所有非 root 企业，只要已审核通过且当前为停用，都支持启用
      visible: (r) => !r._root && !r.frozen && r.auditStatus === "approved" && r.status === "inactive",
    },
    // 当前企业(root)：平台支持 查看+设置管理员；企业还支持 新建子企业+增购权益
    { label: "设置管理员", onClick: (r) => setAdminTarget(r) },
    {
      label: "新建子企业",
      onClick: (r) => setSubParent(r),
      visible: (r) => {
        if (r._root) return perspective === "enterprise";
        return (r._level || 0) < 2 && !r.frozen;
      },
    },
    {
      label: "增购权益",
      onClick: (r) => navigate(`/entitlement/order/create?customerType=B&customerId=${r.id}&customerName=${encodeURIComponent(r.name)}`),
      visible: (r) => r._root && perspective === "enterprise",
    },
    { label: "权益配置", onClick: (r) => navigate(`/enterprise/detail/${r.id}`), visible: (r) => !r._root },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="企业管理"
        subtitle={`共 ${totalItems} 个企业`}
        actions={
          <>
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              导出
            </button>
            <button className="btn-primary" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4" />
              新建企业
            </button>
          </>
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
        data={displayData}
        rowKey={(r) => r.id}
        actions={listActions}
        maxVisibleActions={2}
        expandable={{
          childrenKey: "children",
          expandedKeys: expanded,
          onToggle: toggleExpand,
        }}
        getLevel={(r) => r._level || 0}
      />

      <div className="bg-card rounded-xl border" style={{ boxShadow: 'var(--shadow-xs)' }}>
        <Pagination
          current={currentPage}
          total={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        />
      </div>

      <CreateEnterpriseDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSelect={(type) => {
          setShowCreateDialog(false);
          navigate(`/enterprise/create?type=${type}`);
        }}
      />

      {subParent && (() => {
        const parentTypeKey = TYPE_KEY_MAP[subParent.type] || "brand";
        const allowed = (SUB_TYPE_MAP[subParent.type] || []).map((t) => TYPE_KEY_MAP[t]).filter(Boolean);
        const level = (subParent._level || 0) + 1;
        return (
          <CreateEnterpriseDialog
            open
            title="新建子企业"
            subtitle={`请选择「${subParent.name}」的子企业类型`}
            allowedTypes={allowed}
            onClose={() => setSubParent(null)}
            onSelect={(type) => {
              setSubParent(null);
              navigate(`/enterprise/create?type=${type}&parentId=${subParent.id}&parentType=${parentTypeKey}&parentName=${encodeURIComponent(subParent.name)}&level=${level}`);
            }}
          />
        );
      })()}

      <SetAdminDialog
        open={Boolean(adminTarget)}
        onClose={() => setAdminTarget(null)}
        enterpriseName={adminTarget?.name}
        onConfirm={(result) => {
          if (adminTarget) {
            updateEnterprise(adminTarget.id, {
              admin: result.adminName,
              status: result.status,
            });
          }
          setAdminTarget(null);
        }}
      />

      <AuditDialog
        open={Boolean(auditTarget)}
        onClose={() => setAuditTarget(null)}
        enterpriseName={auditTarget?.name}
        onConfirm={handleAuditConfirm}
      />
    </div>
  );
}
