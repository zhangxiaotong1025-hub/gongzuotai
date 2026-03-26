import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Mock Detail Data ── */
const MOCK_DETAIL = {
  id: "202020",
  name: "上海XXXX股份有限公司",
  orgStructure: "总部",
  orgName: "上海XXXX股份有限公司",
  type: "品牌商",
  industry: "上海XXXX股份有限公司",
  region: "202020",
  businessLicense: "",
  licenseNo: "上海XXXX股份有限公司",
  legalRep: "王小二",
  legalPhone: "18686886788",
  address: "上海XXXX股份有限公司详细地址上海市陆家嘴中心8LXXX号",
  activationCode: "202020",
  status: "active" as const,
  admin: "张伟",
  // 权益
  enabledProducts: ["国内3D工具", "国际3D工具", "精准客资"],
  supplyChain: "加入",
  renderRight: "未开启",
  benefitPackages: [
    { name: "3D工具渲染权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, color: "hsl(var(--primary))" },
    { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, color: "hsl(var(--info))" },
    { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, color: "hsl(var(--destructive))" },
    { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, color: "hsl(var(--primary))" },
    { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, color: "hsl(var(--destructive))" },
  ],
  serviceType: "豪华版",
  accountCount: { used: 10, total: 10 },
  funcRights: "施工图 / 预算报价 / AI工具包",
  renderQuota: { used: 7, total: 10 },
  renderLimit: "每天20次8k / 每周30次36k",
  materialLib: "开启",
  environments: ["通用环境", "硬装环境"],
  subEnterpriseLimit: { used: 20, total: 30 },
  subEnterpriseRight: "开启",
  subEnterpriseExpiry: "2027-12-31",
  // 品牌
  ownedBrands: ["欧派", "索菲亚", "尚品宅配", "金牌厨柜"],
  agentBrands: ["志邦", "我乐", "好莱客", "皮阿诺", "顶固", "百得胜", "诗尼曼"],
};

/* ── Section Header ── */
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-muted/60 border-b border-border">
      <div className="w-1 h-4 rounded-full bg-primary" />
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
  );
}

/* ── Detail Field ── */
function DetailField({ label, value, highlight, className }: { label: string; value: React.ReactNode; highlight?: boolean; className?: string }) {
  return (
    <div className={`flex items-start gap-2 min-w-0 ${className || ""}`}>
      <span className="text-sm text-muted-foreground whitespace-nowrap shrink-0">{label}：</span>
      <span className={`text-sm ${highlight ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

/* ── Benefit Package Card ── */
function BenefitCard({ pkg }: { pkg: typeof MOCK_DETAIL.benefitPackages[0] }) {
  const ratio = pkg.total > 0 ? pkg.used / pkg.total : 0;
  const isWarning = ratio >= 0.8;

  return (
    <div className="rounded-lg border border-border bg-card p-3 min-w-[180px] max-w-[200px] relative">
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-xs font-medium text-foreground leading-tight line-clamp-2">{pkg.name}</span>
        <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
      </div>
      <div className="text-[11px] text-muted-foreground mb-2" style={{ color: pkg.color }}>{pkg.date}</div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">已授权/已购买</span>
        <span className={`text-sm font-semibold ${isWarning ? "text-destructive" : "text-foreground"}`}>
          {pkg.used}/{pkg.total}
        </span>
      </div>
    </div>
  );
}

/* ── Brand Placeholder ── */
function BrandBlock({ name }: { name: string }) {
  return (
    <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center">
      <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">{name}</span>
    </div>
  );
}

export default function EnterpriseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const d = MOCK_DETAIL;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground cursor-pointer hover:text-primary" onClick={() => navigate("/enterprise")}>企业管理</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground text-base">企业详情</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <ChevronLeft className="h-3.5 w-3.5" /> 上一个
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            下一个 <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/enterprise")}>返回列表</Button>
          <Button variant="outline" size="sm">审核</Button>
          <Button size="sm">编辑</Button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        {/* Enterprise Name */}
        <div className="px-6 py-4 border-b border-border">
          <span className="text-base font-semibold text-foreground">{d.name}</span>
        </div>

        {/* 基础信息 */}
        <SectionHeader title="基础信息" />
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailField label="企业名称" value={d.name} />
            <DetailField label="企业ID" value={d.id} />
            <DetailField label="组织结构" value={
              <span className="flex items-center gap-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-primary/10 text-primary border border-primary/20">{d.orgStructure}</span>
                <span>{d.orgName}</span>
              </span>
            } />
            <DetailField label="行业" value={d.industry} />
            <DetailField label="覆盖区域" value={d.region} />
            <DetailField label="营业执照" value={
              d.businessLicense ? <img src={d.businessLicense} alt="营业执照" className="w-12 h-12 rounded border" /> : <span className="w-12 h-12 rounded bg-muted border border-border inline-block" />
            } />
            <DetailField label="营业执照编号" value={d.licenseNo} />
            <DetailField label="法人代表" value={d.legalRep} />
            <DetailField label="法人手机号" value={d.legalPhone} />
            <DetailField label="详细地址" value={d.address} className="col-span-2" />
            <DetailField label="激活券码" value={d.activationCode} />
          </div>
        </div>

        {/* 权益配置 */}
        <SectionHeader title="权益配置" />
        <div className="px-6 py-5 space-y-6">
          {/* 基础权益 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">基础权益</h4>
            <div className="grid grid-cols-3 gap-x-8 gap-y-3">
              <DetailField label="开启产品" value={d.enabledProducts.join("  ")} />
              <DetailField label="是否加入供应链" value={d.supplyChain} />
              <DetailField label="通用渲染权益" value={d.renderRight} />
            </div>
          </div>

          {/* 3D工具权益 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">3D工具权益</h4>
            <div className="mb-4">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap shrink-0 mt-1">权益包：</span>
                <div className="flex gap-3 flex-wrap">
                  {d.benefitPackages.map((pkg, i) => (
                    <BenefitCard key={i} pkg={pkg} />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-x-8 gap-y-3">
              <DetailField label="服务类型" value={d.serviceType} />
              <DetailField label="账号数量" value={
                <span className="text-primary">{d.accountCount.used} / {d.accountCount.total}个</span>
              } highlight />
              <DetailField label="功能权益" value={d.funcRights} />
              <DetailField label="渲染名额" value={
                <span className="text-primary">{d.renderQuota.used} / {d.renderQuota.total}人</span>
              } highlight />
              <DetailField label="渲染配额" value={d.renderLimit} />
              <DetailField label="企业素材库" value={d.materialLib} />
              <DetailField label="开启环境" value={d.environments.join("  ")} />
            </div>
          </div>

          {/* 企业权益 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">企业权益</h4>
            <div className="grid grid-cols-3 gap-x-8 gap-y-3">
              <DetailField label="子企业上限数" value={
                <span className="text-primary">{d.subEnterpriseLimit.used} / {d.subEnterpriseLimit.total}个</span>
              } highlight />
              <DetailField label="设置子企业权益" value={d.subEnterpriseRight} />
              <DetailField label="到期时间" value={d.subEnterpriseExpiry} />
            </div>
          </div>
        </div>

        {/* 品牌设置 */}
        <SectionHeader title="品牌设置" />
        <div className="px-6 py-5 space-y-5">
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap shrink-0 mt-2">拥有品牌：</span>
            <div className="flex gap-3 flex-wrap">
              {d.ownedBrands.map((b) => <BrandBlock key={b} name={b} />)}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap shrink-0 mt-2">代理品牌：</span>
            <div className="flex gap-3 flex-wrap">
              {d.agentBrands.map((b) => <BrandBlock key={b} name={b} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
