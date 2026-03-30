import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User, Phone, Building2, FileText, Gift, ShoppingBag, MousePointerClick,
  MessageSquare, Plus, TrendingUp, Send, Clock, BarChart3, MapPin, Mail,
  Briefcase, Award, AlertTriangle, Repeat, UserPlus, Brain, Lightbulb,
  Sparkles, ArrowRight, ChevronDown, ChevronRight,
} from "lucide-react";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DESIGNER_LIFECYCLE_MAP, END_CUSTOMER_LIFECYCLE_MAP, FOLLOW_STATUS_MAP,
  FOLLOW_TYPES_MAP, ALERT_TYPE_MAP,
  generateFollowRecords, type FollowRecord, type DesignerLifecycle,
} from "@/data/customer";

/* ══════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════ */
const MOCK_DESIGNER = {
  id: "des-1", name: "张明", phone: "13800001111", email: "zhangming@design.com",
  lifecycle: "growing" as DesignerLifecycle, cvsScore: 72,
  currentPackage: "专业版", packageExpiry: "2026-09-15", usageRate: 56,
  totalSpent: 18600, registeredAt: "2024-03-15", lastLoginAt: "2026-03-25",
  source: "官网注册", tags: ["高价值", "VIP", "现代简约"],
  designCount: 42, renderCount: 312, loginDays30: 22, featuresUsed: 6, renewalCount: 2,
  remark: "资深室内设计师，擅长现代简约风格",
  company: "明居设计工作室", city: "上海", district: "浦东新区",
  specialties: ["现代简约", "北欧", "轻奢"],
  experience: "8年",
  certifications: ["高级室内设计师", "BIM建模认证"],
  lastDevice: "MacBook Pro · Chrome 121", lastIP: "116.228.***",
  totalProjects: 156, avgProjectValue: 12500, referralCount: 3,
  entitlements: [
    { name: "AI设计生成", total: 500, used: 280, unit: "次", icon: "🤖" },
    { name: "3D渲染", total: 200, used: 112, unit: "次", icon: "🎨" },
    { name: "4K渲染", total: 50, used: 8, unit: "次", icon: "📺" },
    { name: "模型下载", total: 100, used: 45, unit: "个", icon: "📦" },
    { name: "VR全景", total: 30, used: 12, unit: "次", icon: "🔮" },
    { name: "方案导出", total: 200, used: 56, unit: "次", icon: "📄" },
  ],
  orders: [
    { id: "ord-1", package: "专业版年卡", amount: 9800, createdAt: "2025-09-15", payMethod: "微信支付" },
    { id: "ord-2", package: "专业版年卡", amount: 8800, createdAt: "2024-09-15", payMethod: "支付宝" },
    { id: "ord-3", package: "4K渲染包 x20", amount: 980, createdAt: "2024-06-20", payMethod: "微信支付" },
  ],
  behaviors: [
    { event: "AI设计生成", time: "03-25 14:45", detail: "现代简约客厅 · 3张", category: "creation" },
    { event: "3D渲染", time: "03-25 15:10", detail: "8K渲染 · 23s", category: "creation" },
    { event: "方案导出", time: "03-24 10:20", detail: "PDF方案书 · 28页", category: "output" },
    { event: "模型下载", time: "03-23 16:40", detail: "沙发x3 · 北欧", category: "resource" },
    { event: "VR全景", time: "03-20 09:15", detail: "客厅VR全景图", category: "creation" },
  ],
  featureUsage: [
    { name: "AI设计", count: 280, pct: 89 },
    { name: "3D渲染", count: 112, pct: 71 },
    { name: "方案导出", count: 56, pct: 54 },
    { name: "模型下载", count: 45, pct: 38 },
    { name: "VR全景", count: 12, pct: 25 },
  ],
  usageTrend: [85,72,90,68,95,88,76,92,81,70,88,95,82,78,90,85,72,96,80,88,75,92,86,78,90,84,88,76,92,85],
  lifecycleHistory: [
    { stage: "注册期", date: "2024-03" },
    { stage: "激活期", date: "2024-03" },
    { stage: "成长期", date: "2024-06" },
  ],
  alerts: [{ type: "low_usage", detail: "4K渲染使用率仅16%", level: "yellow" }],
  activeHours: [0,0,0,0,0,1,2,5,12,18,22,15,8,14,20,18,12,8,4,3,2,1,0,0],
  portrait: {
    dimensions: [
      { name: "创作活跃", value: 82 },
      { name: "工具深度", value: 65 },
      { name: "付费意愿", value: 78 },
      { name: "分享传播", value: 45 },
      { name: "学习成长", value: 70 },
      { name: "客户服务", value: 58 },
    ],
    persona: "高频创作型",
    interests: ["AI设计", "高端住宅", "全屋定制", "智能家居"],
  },
  conversion: {
    firstPayDays: 5, upgradeCount: 2,
    upgradePath: ["基础版月卡", "专业版年卡", "专业版年卡(续)"],
    churnRisk: 15, renewalProbability: 85, ltv: 28400, arpu: 775, repurchaseRate: 67,
    repurchaseHistory: [
      { period: "24-Q2", amount: 98, type: "首购" },
      { period: "24-Q3", amount: 980, type: "加购" },
      { period: "24-Q4", amount: 8800, type: "续费" },
      { period: "25-Q3", amount: 9800, type: "续费" },
    ],
  },
  referral: {
    totalReferred: 3, convertedReferred: 2, referralRevenue: 15600, referralConvertRate: 67,
    referredUsers: [
      { name: "陈设计师", status: "已付费", amount: 8800, date: "2025-06" },
      { name: "周设计师", status: "已付费", amount: 6800, date: "2025-08" },
      { name: "刘设计师", status: "未付费", amount: 0, date: "2026-01" },
    ],
  },
  recommendations: [
    { priority: "high", title: "推荐升级旗舰版", desc: "AI使用率89%接近上限", impact: "+¥5.2K/年" },
    { priority: "medium", title: "推送4K渲染教程", desc: "使用率仅16%", impact: "深度+30%" },
    { priority: "medium", title: "加入推荐官计划", desc: "已成功推荐2人", impact: "带单3人/季" },
  ],
  reachRecords: [
    { id: "r1", type: "sms", campaign: "春季续费优惠", content: "续费享8折", status: "opened", sentAt: "03-20" },
    { id: "r2", type: "in_app", campaign: "新功能通知", content: "AI设计2.0升级", status: "converted", sentAt: "02-15" },
  ],
};

const MOCK_EC = {
  id: "ec-1", name: "李女士", phone: "13900002222",
  lifecycle: "serving" as const, followStatus: "won" as const,
  intentLevel: "high" as const,
  sourceEnterprise: "欧派家居集团", assignedStaff: "王设计师",
  createdAt: "2025-08-20", lastFollowAt: "2026-03-15",
  tags: ["已签约", "装修中", "高端客户"],
  remark: "120平三室两厅全屋定制，预算15万",
  address: "上海浦东XX小区", houseType: "三室两厅", area: "120㎡", budget: "15万",
  decorateStage: "施工中", expectedDelivery: "2026-06-30",
  familyMembers: "夫妻+1孩", preferenceStyle: "现代简约",
  linkedEnterprises: [
    { id: "ent-1", name: "欧派家居集团", type: "品牌商", staff: "王设计师", followStatus: "won" as const, createdAt: "2025-08", serviceCount: 5, lastServiceAt: "2026-03", totalEntitlement: "AI设计x8, 3D渲染x12" },
    { id: "ent-2", name: "索菲亚家居", type: "品牌商", staff: "李顾问", followStatus: "following" as const, createdAt: "2025-10", serviceCount: 1, lastServiceAt: "2025-10", totalEntitlement: "" },
  ],
  serviceRecords: [
    { id: "s1", enterprise: "欧派家居", type: "量房", date: "03-15", staff: "王设计师", note: "厨房U型橱柜", entitlement: "3D渲染x2" },
    { id: "s2", enterprise: "欧派家居", type: "出方案", date: "03-10", staff: "王设计师", note: "3套方案，客户选B", entitlement: "AI设计x3" },
    { id: "s3", enterprise: "欧派家居", type: "签约", date: "2025-11", staff: "王设计师", note: "全屋定制¥12.8万", entitlement: "" },
  ],
  lifecycleHistory: [
    { stage: "新录入", date: "2025-08" },
    { stage: "跟进中", date: "2025-09" },
    { stage: "已成交", date: "2025-11" },
    { stage: "服务中", date: "2025-12" },
  ],
  alerts: [],
  portrait: {
    intentScore: 92, satisfactionScore: 88, cooperationDepth: 75, referralWillingness: 60,
    persona: "高净值定制客户",
    decisionFactors: ["设计效果", "品牌口碑", "价格合理"],
  },
  conversionPath: {
    totalDays: 87, touchpoints: 12, contractAmount: 128000,
    stages: [
      { name: "接触", date: "08-20", days: 0 },
      { name: "需求", date: "09-01", days: 12 },
      { name: "方案", date: "09-20", days: 31 },
      { name: "到店", date: "10-10", days: 51 },
      { name: "报价", date: "10-30", days: 71 },
      { name: "签约", date: "11-15", days: 87 },
    ],
  },
  repurchase: {
    probability: 72,
    potentialItems: ["软装搭配", "卧室衣柜", "智能家居"],
    estimatedAmount: "3-5万",
  },
  recommendations: [
    { priority: "high", title: "推荐软装搭配", desc: "全屋定制即将完工", impact: "+¥3-5万" },
    { priority: "high", title: "邀请老带新", desc: "满意度88分", impact: "带单1-2单" },
    { priority: "medium", title: "阶段回访", desc: "木工即将完成", impact: "满意度+5%" },
  ],
  reachRecords: [
    { id: "r1", type: "wechat", campaign: "", content: "效果图确认", status: "replied", sentAt: "03-12" },
    { id: "r2", type: "sms", campaign: "进度通知", content: "木工阶段", status: "opened", sentAt: "03-01" },
  ],
};

/* ══════════════════════════════════════════════
   FLOOR NAV CONFIG
   ══════════════════════════════════════════════ */
const D_SECTIONS = [
  { id: "portrait", label: "画像", icon: Brain },
  { id: "recommend", label: "建议", icon: Lightbulb },
  { id: "conversion", label: "转化", icon: Repeat },
  { id: "referral", label: "带单", icon: UserPlus },
  { id: "entitlement", label: "权益", icon: Gift },
  { id: "behavior", label: "行为", icon: MousePointerClick },
  { id: "orders", label: "订单", icon: ShoppingBag },
  { id: "follow", label: "跟进", icon: MessageSquare },
];

const EC_SECTIONS = [
  { id: "portrait", label: "画像", icon: Brain },
  { id: "recommend", label: "建议", icon: Lightbulb },
  { id: "conversion", label: "转化", icon: Repeat },
  { id: "enterprise", label: "企业", icon: Building2 },
  { id: "service", label: "服务", icon: FileText },
  { id: "follow", label: "跟进", icon: MessageSquare },
];

/* ══════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════ */
export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesigner = !id?.startsWith("ec");
  const [followRecords] = useState<FollowRecord[]>(generateFollowRecords(4));
  const [showAddFollow, setShowAddFollow] = useState(false);
  const [newFollow, setNewFollow] = useState({ type: "phone", content: "" });
  const [activeSection, setActiveSection] = useState("portrait");
  const d = MOCK_DESIGNER;
  const ec = MOCK_EC;

  const lcMap = isDesigner ? DESIGNER_LIFECYCLE_MAP : END_CUSTOMER_LIFECYCLE_MAP;
  const lcKey = isDesigner ? d.lifecycle : ec.lifecycle;
  const lcInfo = lcMap[lcKey as keyof typeof lcMap];
  const sections = isDesigner ? D_SECTIONS : EC_SECTIONS;

  // Intersection observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0.1 }
    );
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isDesigner]);

  const scrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddFollow = () => {
    if (!newFollow.content.trim()) return;
    toast.success("跟进记录已添加");
    setShowAddFollow(false);
    setNewFollow({ type: "phone", content: "" });
  };

  return (
    <div>
      <DetailActionBar
        backLabel="客户列表" backPath="/customer/list"
        currentName={isDesigner ? d.name : ec.name}
        onEdit={() => navigate(`/customer/create?mode=edit&id=${id}&type=${isDesigner ? "designer" : "end_customer"}`)}
        statusToggle={{ currentActive: true, onToggle: () => toast.success("状态已切换") }}
      />

      {/* ═══ HEADER: Compact Profile + Key Metrics ═══ */}
      <div className="mt-4 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-primary">{(isDesigner ? d.name : ec.name)[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold">{isDesigner ? d.name : ec.name}</h2>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isDesigner ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-700"}`}>
                {isDesigner ? "设计师" : "企业客户"}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${lcInfo.color}`}>{lcInfo.label}</span>
              {!isDesigner && <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${FOLLOW_STATUS_MAP[ec.followStatus].color}`}>{FOLLOW_STATUS_MAP[ec.followStatus].label}</span>}
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700">
                <Sparkles className="h-2.5 w-2.5" />{isDesigner ? d.portrait.persona : ec.portrait.persona}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground mt-1">
              <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{isDesigner ? d.phone : ec.phone}</span>
              {isDesigner && d.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{d.email}</span>}
              {isDesigner && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{d.city}</span>}
              {isDesigner && <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{d.company}</span>}
              {!isDesigner && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{ec.sourceEnterprise}</span>}
              {!isDesigner && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{ec.assignedStaff}</span>}
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(isDesigner ? d.tags : ec.tags).map((t, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>
          {/* Key metrics - visual gauges */}
          <div className="hidden lg:grid grid-cols-4 gap-3 shrink-0">
            {isDesigner ? (
              <>
                <CircleGauge value={d.cvsScore} label="CVS" max={100} />
                <CircleGauge value={d.conversion.renewalProbability} label="续费率" max={100} color="emerald" />
                <CircleGauge value={d.conversion.repurchaseRate} label="复购率" max={100} color="blue" />
                <CircleGauge value={100 - d.conversion.churnRisk} label="健康度" max={100} color="emerald" />
              </>
            ) : (
              <>
                <CircleGauge value={ec.portrait.intentScore} label="意向度" max={100} />
                <CircleGauge value={ec.portrait.satisfactionScore} label="满意度" max={100} color="emerald" />
                <CircleGauge value={ec.repurchase.probability} label="复购率" max={100} color="blue" />
                <CircleGauge value={ec.portrait.cooperationDepth} label="合作度" max={100} color="amber" />
              </>
            )}
          </div>
        </div>
        {/* Alerts */}
        {(isDesigner ? d.alerts : ec.alerts).length > 0 && (
          <div className="mt-3 flex gap-2">
            {(isDesigner ? d.alerts : ec.alerts).map((a, i) => {
              const info = ALERT_TYPE_MAP[a.type];
              return (
                <div key={i} className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                  <span>{info?.icon}</span>
                  <span className="text-amber-800 truncate">{a.detail}</span>
                  <Button variant="outline" size="sm" className="ml-auto h-5 text-[10px] px-2" onClick={() => toast.success("已处理")}>处理</Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ FLOOR NAV (Sticky) ═══ */}
      <div className="sticky top-0 z-20 mt-4 -mx-1 px-1 py-1.5 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center gap-0.5">
          {sections.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === s.id
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ CONTENT SECTIONS ═══ */}
      <div className="mt-4 space-y-5">

        {/* ── 用户画像 ── */}
        <section id="portrait">
          {isDesigner ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Radar + Persona */}
              <div className="lg:col-span-4 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={Brain} title="行为画像" />
                <div className="w-[140px] h-[140px] mx-auto mt-2">
                  <RadarChart dimensions={d.portrait.dimensions} />
                </div>
                <div className="flex flex-wrap gap-1 mt-3 justify-center">
                  {d.portrait.interests.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary">{t}</span>
                  ))}
                </div>
              </div>
              {/* CVS Breakdown */}
              <div className="lg:col-span-4 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={Award} title="价值评分 CVS" />
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="27" fill="none" strokeWidth="5" className="stroke-muted" />
                      <circle cx="32" cy="32" r="27" fill="none" strokeWidth="5" className="stroke-primary" strokeLinecap="round"
                        strokeDasharray={`${d.cvsScore * 1.7} 170`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{d.cvsScore}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[
                      { dim: "使用率", w: 30, s: Math.round(d.usageRate * 0.3) },
                      { dim: "活跃度", w: 20, s: Math.round((d.loginDays30 / 30) * 100 * 0.2) },
                      { dim: "消费", w: 25, s: Math.min(25, Math.round(d.totalSpent / 2000)) },
                      { dim: "续费", w: 15, s: Math.min(15, d.renewalCount * 5) },
                      { dim: "深度", w: 10, s: Math.round((d.featuresUsed / 8) * 10) },
                    ].map(s => (
                      <div key={s.dim} className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-10 text-muted-foreground">{s.dim}</span>
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(s.s / s.w) * 100}%` }} />
                        </div>
                        <span className="text-muted-foreground w-7 text-right">{s.s}/{s.w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Core Stats */}
              <div className="lg:col-span-4 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={BarChart3} title="核心指标" />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Stat label="设计方案" value={d.designCount} />
                  <Stat label="渲染次数" value={d.renderCount} />
                  <Stat label="30天登录" value={`${d.loginDays30}天`} />
                  <Stat label="总项目" value={d.totalProjects} />
                  <Stat label="均单价值" value={`¥${(d.avgProjectValue/1000).toFixed(1)}K`} />
                  <Stat label="累计消费" value={`¥${(d.totalSpent/1000).toFixed(1)}K`} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={Brain} title="客户画像" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <ScoreGauge label="意向度" value={ec.portrait.intentScore} />
                  <ScoreGauge label="满意度" value={ec.portrait.satisfactionScore} />
                  <ScoreGauge label="合作深度" value={ec.portrait.cooperationDepth} />
                  <ScoreGauge label="转介绍" value={ec.portrait.referralWillingness} />
                </div>
                <div className="mt-3">
                  <span className="text-[10px] text-muted-foreground">决策因素</span>
                  <div className="flex gap-1 mt-0.5">
                    {ec.portrait.decisionFactors.map((f, i) => (
                      <span key={f} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                        <strong className="text-primary mr-0.5">{i+1}</strong>{f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={FileText} title="基本信息" />
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-2">
                  <InfoItem label="户型" value={ec.houseType} />
                  <InfoItem label="面积" value={ec.area} />
                  <InfoItem label="预算" value={ec.budget} />
                  <InfoItem label="装修阶段" value={ec.decorateStage} />
                  <InfoItem label="交付预期" value={ec.expectedDelivery} />
                  <InfoItem label="家庭成员" value={ec.familyMembers} />
                  <InfoItem label="风格偏好" value={ec.preferenceStyle} />
                  <InfoItem label="录入时间" value={ec.createdAt} />
                  <InfoItem label="最近跟进" value={ec.lastFollowAt} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── 运营建议 ── */}
        <section id="recommend">
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <SectionTitle icon={Lightbulb} title="智能运营建议" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
              {(isDesigner ? d.recommendations : ec.recommendations).map((rec, i) => {
                const pColors: Record<string, string> = { high: "border-l-red-400", medium: "border-l-amber-400", low: "border-l-blue-400" };
                const pLabels: Record<string, { l: string; c: string }> = { high: { l: "高", c: "bg-red-100 text-red-700" }, medium: { l: "中", c: "bg-amber-100 text-amber-700" }, low: { l: "低", c: "bg-blue-100 text-blue-700" } };
                const pl = pLabels[rec.priority];
                return (
                  <div key={i} className={`p-3 rounded-lg border border-border/40 border-l-[3px] ${pColors[rec.priority]}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${pl.c}`}>{pl.l}</span>
                      <span className="text-xs font-medium flex-1">{rec.title}</span>
                      <span className="text-[10px] font-medium text-emerald-600">{rec.impact}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{rec.desc}</p>
                    <Button variant="outline" size="sm" className="h-5 text-[10px] mt-2 px-2" onClick={() => toast.success("已创建任务")}>执行</Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 转化分析 ── */}
        <section id="conversion">
          {isDesigner ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Metrics */}
              <div className="lg:col-span-5 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={Repeat} title="转化与复购" />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Stat label="首购转化" value={`${d.conversion.firstPayDays}天`} highlight />
                  <Stat label="复购率" value={`${d.conversion.repurchaseRate}%`} highlight />
                  <Stat label="LTV" value={`¥${(d.conversion.ltv/10000).toFixed(1)}万`} highlight />
                  <Stat label="月均ARPU" value={`¥${d.conversion.arpu}`} />
                  <Stat label="续费概率" value={`${d.conversion.renewalProbability}%`} />
                  <Stat label="升级次数" value={`${d.conversion.upgradeCount}次`} />
                </div>
                {/* Churn risk bar */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">流失风险</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.conversion.churnRisk >= 50 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${d.conversion.churnRisk}%` }} />
                  </div>
                  <span className="text-xs font-bold text-emerald-600">{d.conversion.churnRisk}%</span>
                </div>
              </div>
              {/* Upgrade path + timeline */}
              <div className="lg:col-span-7 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={TrendingUp} title="复购时间线" />
                <div className="flex items-center gap-1 mt-2 mb-3 flex-wrap">
                  {d.conversion.upgradePath.map((step, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className={`px-2 py-1 rounded text-[10px] font-medium border ${i === d.conversion.upgradePath.length - 1 ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}`}>{step}</span>
                      {i < d.conversion.upgradePath.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40" />}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {d.conversion.repurchaseHistory.map((rp, i) => (
                    <div key={i} className="flex-1 p-2 rounded-lg border border-border/40 text-center">
                      <div className="text-[10px] text-muted-foreground">{rp.period}</div>
                      <div className="text-sm font-bold mt-0.5">¥{rp.amount.toLocaleString()}</div>
                      <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${rp.type === "首购" ? "bg-blue-100 text-blue-700" : rp.type === "加购" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{rp.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={Repeat} title="转化路径" />
              <div className="flex items-center gap-2 mt-3 mb-4">
                <Stat label="转化周期" value={`${ec.conversionPath.totalDays}天`} highlight />
                <Stat label="触达次数" value={`${ec.conversionPath.touchpoints}次`} />
                <Stat label="合同额" value={`¥${(ec.conversionPath.contractAmount/10000).toFixed(1)}万`} highlight />
                <Stat label="复购概率" value={`${ec.repurchase.probability}%`} />
              </div>
              {/* Stage flow */}
              <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                {ec.conversionPath.stages.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${i === ec.conversionPath.stages.length - 1 ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                      {i + 1}
                    </div>
                    <span className="text-[10px] font-medium mt-1">{s.name}</span>
                    <span className="text-[9px] text-muted-foreground">{s.date}</span>
                  </div>
                ))}
              </div>
              {/* Repurchase */}
              <div className="flex items-center gap-3 mt-3 p-2.5 rounded-lg border border-border/40 bg-muted/20">
                <div className="flex-1">
                  <span className="text-[10px] text-muted-foreground">增购潜力</span>
                  <div className="flex gap-1 mt-0.5">
                    {ec.repurchase.potentialItems.map(item => (
                      <span key={item} className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-primary">¥{ec.repurchase.estimatedAmount}</div>
                  <div className="text-[9px] text-muted-foreground">预估金额</div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── 带单能力 (Designer) ── */}
        {isDesigner && (
          <section id="referral">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={UserPlus} title="带单能力" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3">
                <div className="lg:col-span-4 grid grid-cols-2 gap-2">
                  <Stat label="推荐人数" value={d.referral.totalReferred} />
                  <Stat label="已转化" value={d.referral.convertedReferred} highlight />
                  <Stat label="转化率" value={`${d.referral.referralConvertRate}%`} />
                  <Stat label="带单金额" value={`¥${(d.referral.referralRevenue/10000).toFixed(1)}万`} highlight />
                </div>
                <div className="lg:col-span-8 space-y-1.5">
                  {d.referral.referredUsers.map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-border/40">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs font-medium">{u.name}</span>
                        <span className="text-[10px] text-muted-foreground">{u.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {u.amount > 0 && <span className="text-xs font-medium">¥{u.amount.toLocaleString()}</span>}
                        <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${u.status === "已付费" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{u.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 关联企业 (EC) ── */}
        {!isDesigner && (
          <section id="enterprise">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={Building2} title="关联企业" badge={`${ec.linkedEnterprises.length}家`} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                {ec.linkedEnterprises.map(ent => (
                  <div key={ent.id} className="p-3 rounded-lg border border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center"><Building2 className="h-3 w-3 text-primary" /></div>
                      <span className="text-xs font-medium">{ent.name}</span>
                      <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">{ent.type}</span>
                      <span className={`ml-auto px-1 py-0.5 rounded text-[9px] font-medium ${FOLLOW_STATUS_MAP[ent.followStatus].color}`}>{FOLLOW_STATUS_MAP[ent.followStatus].label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground ml-8">
                      <span>负责: {ent.staff}</span><span>服务: {ent.serviceCount}次</span>
                      <span>录入: {ent.createdAt}</span><span>最近: {ent.lastServiceAt}</span>
                      {ent.totalEntitlement && <span className="col-span-2 text-primary">权益: {ent.totalEntitlement}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 权益账户 (Designer) ── */}
        {isDesigner && (
          <section id="entitlement">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={Gift} title="权益账户" badge={`${d.currentPackage} · ${d.packageExpiry}`} />
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
                {d.entitlements.map((e, i) => {
                  const rate = Math.round((e.used / e.total) * 100);
                  return (
                    <div key={i} className="p-2.5 rounded-lg border border-border/40 text-center">
                      <span className="text-lg">{e.icon}</span>
                      <div className="text-[10px] font-medium mt-1">{e.name}</div>
                      <div className="text-sm font-bold mt-0.5">{e.used}<span className="text-[10px] text-muted-foreground font-normal">/{e.total}</span></div>
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full ${rate >= 80 ? "bg-amber-500" : rate >= 50 ? "bg-primary" : "bg-emerald-500"}`} style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* 30-day trend */}
              <div className="mt-3 pt-3 border-t border-border/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">近30天消耗趋势</span>
                </div>
                <div className="flex items-end gap-[1px] h-8">
                  {d.usageTrend.map((v, i) => (
                    <div key={i} className="flex-1 bg-primary/25 rounded-t hover:bg-primary/50 transition-colors" style={{ height: `${v}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 服务记录 (EC) ── */}
        {!isDesigner && (
          <section id="service">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={FileText} title="服务记录" badge={`${ec.serviceRecords.length}条`} />
              <div className="space-y-2 mt-3">
                {ec.serviceRecords.map(rec => (
                  <div key={rec.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/40">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{rec.type}</span>
                        <span className="text-[10px] text-muted-foreground">{rec.enterprise} · {rec.staff}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{rec.date}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{rec.note}</p>
                      {rec.entitlement && <span className="text-[10px] text-primary">权益: {rec.entitlement}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 行为轨迹 (Designer) ── */}
        {isDesigner && (
          <section id="behavior">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Recent behaviors */}
              <div className="lg:col-span-5 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={MousePointerClick} title="近期行为" />
                <div className="space-y-1.5 mt-2">
                  {d.behaviors.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium">{b.event}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">{b.detail}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{b.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Feature ranking + Active hours */}
              <div className="lg:col-span-4 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={BarChart3} title="功能偏好" />
                <div className="space-y-1.5 mt-2">
                  {d.featureUsage.map((f, i) => (
                    <div key={f.name} className="flex items-center gap-1.5">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${i < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                      <span className="text-[11px] flex-1">{f.name}</span>
                      <div className="w-14 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/50 rounded-full" style={{ width: `${f.pct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-6 text-right">{f.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Active hours heatmap */}
              <div className="lg:col-span-3 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={Clock} title="活跃时段" />
                <div className="flex items-end gap-[2px] h-16 mt-2">
                  {d.activeHours.map((v, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t hover:bg-primary/50 transition-colors"
                      style={{ height: `${(v / Math.max(...d.activeHours)) * 100}%` }}
                      title={`${i}:00 ${v}次`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
                  <span>0时</span><span>12时</span><span>23时</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 订单记录 (Designer) ── */}
        {isDesigner && (
          <section id="orders">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={ShoppingBag} title="订单记录" badge={`${d.orders.length}笔 · ¥${d.totalSpent.toLocaleString()}`} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mt-3">
                {d.orders.map(o => (
                  <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40">
                    <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center shrink-0">
                      <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{o.package}</div>
                      <div className="text-[10px] text-muted-foreground">{o.createdAt}</div>
                    </div>
                    <span className="text-sm font-semibold">¥{o.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 跟进 & 触达 ── */}
        <section id="follow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Follow records */}
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={MessageSquare} title="跟进记录"
                action={<button onClick={() => setShowAddFollow(true)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5"><Plus className="h-3 w-3" />新增</button>}
              />
              {showAddFollow && (
                <div className="mt-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {Object.entries(FOLLOW_TYPES_MAP).map(([k, v]) => (
                      <button key={k} onClick={() => setNewFollow(p => ({ ...p, type: k }))}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${newFollow.type === k ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}`}
                      >{v}</button>
                    ))}
                  </div>
                  <textarea className="w-full h-12 px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/20"
                    placeholder="跟进内容..." value={newFollow.content} onChange={e => setNewFollow(p => ({ ...p, content: e.target.value }))} />
                  <div className="flex justify-end gap-1.5 mt-1.5">
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setShowAddFollow(false)}>取消</Button>
                    <Button size="sm" className="h-6 text-[10px]" onClick={handleAddFollow}>提交</Button>
                  </div>
                </div>
              )}
              <div className="space-y-1.5 mt-2">
                {followRecords.slice(0, 4).map(r => (
                  <div key={r.id} className="p-2 rounded-lg border border-border/40">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="px-1 py-0.5 rounded text-[9px] bg-primary/10 text-primary font-medium">{FOLLOW_TYPES_MAP[r.type]}</span>
                      {r.enterprise && <span className="text-[10px] text-muted-foreground">{r.enterprise}</span>}
                      <span className="text-[10px] text-muted-foreground ml-auto">{r.createdAt}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-2">{r.content}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
                      <span>{r.operator}</span>
                      {r.feedback && <span>{r.feedback === "positive" ? "👍" : r.feedback === "neutral" ? "😐" : "👎"}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reach records */}
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={Send} title="触达记录" />
              <div className="space-y-1.5 mt-2">
                {(isDesigner ? d.reachRecords : ec.reachRecords).map(r => {
                  const typeMap: Record<string, string> = { sms: "短信", email: "邮件", in_app: "站内信", wechat: "微信" };
                  const statusMap: Record<string, { l: string; c: string }> = {
                    sent: { l: "已发", c: "bg-muted text-muted-foreground" },
                    opened: { l: "已读", c: "bg-cyan-100 text-cyan-700" },
                    replied: { l: "已复", c: "bg-emerald-100 text-emerald-700" },
                    converted: { l: "转化", c: "bg-primary/10 text-primary" },
                  };
                  const st = statusMap[r.status] || statusMap.sent;
                  return (
                    <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg border border-border/40">
                      <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <Send className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">{typeMap[r.type]}</span>
                          {r.campaign && <span className="text-[10px] text-primary truncate">{r.campaign}</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{r.content}</p>
                      </div>
                      <span className={`px-1 py-0.5 rounded text-[9px] font-medium shrink-0 ${st.c}`}>{st.l}</span>
                      <span className="text-[9px] text-muted-foreground shrink-0">{r.sentAt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SHARED COMPONENTS
   ══════════════════════════════════════════════ */

function SectionTitle({ icon: Icon, title, badge, action }: { icon: React.ElementType; title: string; badge?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <h4 className="text-xs font-medium">{title}</h4>
        {badge && <span className="text-[9px] text-muted-foreground px-1 py-0.5 rounded bg-muted">{badge}</span>}
      </div>
      {action}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <p className="text-xs mt-0.5">{value}</p>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`p-2 rounded-lg border text-center ${highlight ? "border-primary/30 bg-primary/5" : "border-border/40"}`}>
      <div className={`text-sm font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
      <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function CircleGauge({ value, label, max, color = "primary" }: { value: number; label: string; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  const colorMap: Record<string, string> = { primary: "stroke-primary", emerald: "stroke-emerald-500", blue: "stroke-blue-500", amber: "stroke-amber-500" };
  const textMap: Record<string, string> = { primary: "text-primary", emerald: "text-emerald-600", blue: "text-blue-600", amber: "text-amber-600" };
  return (
    <div className="text-center">
      <div className="relative w-12 h-12 mx-auto">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" className="stroke-muted" />
          <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" className={colorMap[color]} strokeLinecap="round"
            strokeDasharray={`${pct * 1.26} 126`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-[10px] font-bold ${textMap[color]}`}>{value}</span>
        </div>
      </div>
      <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function ScoreGauge({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "text-emerald-600" : value >= 60 ? "text-primary" : "text-amber-600";
  const bg = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-primary" : "bg-amber-500";
  return (
    <div className="p-2 rounded-lg border border-border/40 text-center">
      <div className={`text-base font-bold ${color}`}>{value}</div>
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-0.5">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${value}%` }} />
      </div>
      <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function RadarChart({ dimensions }: { dimensions: { name: string; value: number }[] }) {
  const n = dimensions.length;
  const cx = 70, cy = 70, r = 52;
  const getPoint = (i: number, val: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + (r * val / 100) * Math.cos(angle), y: cy + (r * val / 100) * Math.sin(angle) };
  };
  return (
    <svg viewBox="0 0 140 140" className="w-full h-full">
      {[25, 50, 75, 100].map(l => (
        <polygon key={l} points={Array.from({ length: n }, (_, i) => { const p = getPoint(i, l); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" className="stroke-border/30" strokeWidth="0.5" />
      ))}
      {dimensions.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="stroke-border/20" strokeWidth="0.5" />;
      })}
      <polygon points={dimensions.map((d, i) => { const p = getPoint(i, d.value); return `${p.x},${p.y}`; }).join(" ")}
        className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      {dimensions.map((d, i) => {
        const p = getPoint(i, d.value);
        return <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="2" className="fill-primary" />;
      })}
      {dimensions.map((d, i) => {
        const p = getPoint(i, 125);
        return <text key={`lbl-${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[7px]">{d.name}</text>;
      })}
    </svg>
  );
}
