import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User, Phone, Building2, Tag, Calendar, Activity, FileText, Gift,
  ShoppingBag, MousePointerClick, MessageSquare, Plus, TrendingUp, TrendingDown,
  Send, Clock, Target, Zap, BarChart3, Heart, MapPin, Home, DollarSign,
  Briefcase, Star, Award, Eye, Palette, Box, Layers, Mail, Smartphone,
  Globe, Shield, AlertTriangle, CheckCircle2, ArrowUpRight, Repeat, UserPlus,
  Brain, Lightbulb, Percent, ArrowRight, ThumbsUp, Sparkles,
} from "lucide-react";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  DESIGNER_LIFECYCLE_MAP, END_CUSTOMER_LIFECYCLE_MAP, FOLLOW_STATUS_MAP,
  FOLLOW_TYPES_MAP, ALERT_TYPE_MAP,
  generateFollowRecords, type FollowRecord, type DesignerLifecycle,
} from "@/data/customer";

/* ══════════════════════════════════════════════
   MOCK DATA — Designer
   ══════════════════════════════════════════════ */
const MOCK_DESIGNER = {
  id: "des-1", name: "张明", phone: "13800001111", email: "zhangming@design.com",
  lifecycle: "growing" as DesignerLifecycle, cvsScore: 72,
  currentPackage: "专业版", packageExpiry: "2026-09-15", usageRate: 56,
  totalSpent: 18600, registeredAt: "2024-03-15", lastLoginAt: "2026-03-25",
  source: "官网注册", tags: ["高价值", "VIP", "现代简约"],
  designCount: 42, renderCount: 312, loginDays30: 22, featuresUsed: 6, renewalCount: 2,
  remark: "资深室内设计师，擅长现代简约风格，服务过多个高端住宅项目",
  company: "明居设计工作室", city: "上海", district: "浦东新区",
  specialties: ["现代简约", "北欧", "轻奢"],
  experience: "8年",
  certifications: ["高级室内设计师", "BIM建模认证"],
  lastDevice: "MacBook Pro · Chrome 121",
  lastIP: "116.228.***",
  totalProjects: 156,
  avgProjectValue: 12500,
  referralCount: 3,
  entitlements: [
    { name: "AI设计生成", total: 500, used: 280, unit: "次", icon: "🤖" },
    { name: "3D渲染", total: 200, used: 112, unit: "次", icon: "🎨" },
    { name: "4K渲染", total: 50, used: 8, unit: "次", icon: "📺" },
    { name: "模型下载", total: 100, used: 45, unit: "个", icon: "📦" },
    { name: "VR全景", total: 30, used: 12, unit: "次", icon: "🔮" },
    { name: "方案导出", total: 200, used: 56, unit: "次", icon: "📄" },
  ],
  orders: [
    { id: "ord-1", package: "专业版年卡", amount: 9800, status: "completed", createdAt: "2025-09-15", payMethod: "微信支付" },
    { id: "ord-2", package: "专业版年卡", amount: 8800, status: "completed", createdAt: "2024-09-15", payMethod: "支付宝" },
    { id: "ord-3", package: "4K渲染包 x20", amount: 980, status: "completed", createdAt: "2024-06-20", payMethod: "微信支付" },
    { id: "ord-4", package: "基础版月卡", amount: 98, status: "completed", createdAt: "2024-03-20", payMethod: "微信支付" },
  ],
  behaviors: [
    { event: "登录", time: "2026-03-25 14:32", detail: "Web端 · MacBook Pro", icon: "login", category: "access" },
    { event: "AI设计生成", time: "2026-03-25 14:45", detail: "现代简约客厅 · 生成3张", icon: "ai", category: "creation" },
    { event: "3D渲染", time: "2026-03-25 15:10", detail: "提交8K渲染任务 · 耗时23s", icon: "render", category: "creation" },
    { event: "方案导出", time: "2026-03-24 10:20", detail: "导出PDF方案书 · 28页", icon: "export", category: "output" },
    { event: "模型下载", time: "2026-03-23 16:40", detail: "沙发模型x3 · 北欧风格", icon: "download", category: "resource" },
    { event: "客户邀请", time: "2026-03-22 11:00", detail: "邀请业主在线看方案", icon: "share", category: "collaboration" },
    { event: "VR全景", time: "2026-03-20 09:15", detail: "生成客厅VR全景图", icon: "vr", category: "creation" },
    { event: "首次使用AI设计", time: "2024-04-02 10:00", detail: "关键里程碑", icon: "milestone", category: "milestone" },
    { event: "首次付费", time: "2024-03-20 15:30", detail: "购买基础版月卡 ¥98", icon: "milestone", category: "milestone" },
    { event: "注册", time: "2024-03-15 09:00", detail: "官网自主注册", icon: "milestone", category: "milestone" },
  ],
  featureUsage: [
    { name: "AI设计生成", count: 280, pct: 89 },
    { name: "3D渲染", count: 112, pct: 71 },
    { name: "方案导出", count: 56, pct: 54 },
    { name: "模型下载", count: 45, pct: 38 },
    { name: "VR全景", count: 12, pct: 25 },
    { name: "4K渲染", count: 8, pct: 19 },
  ],
  usageTrend: [85,72,90,68,95,88,76,92,81,70,88,95,82,78,90,85,72,96,80,88,75,92,86,78,90,84,88,76,92,85],
  lifecycleHistory: [
    { stage: "注册期", date: "2024-03-15", note: "官网自主注册" },
    { stage: "激活期", date: "2024-03-20", note: "购买基础版月卡" },
    { stage: "成长期", date: "2024-06-01", note: "使用率超过30%" },
  ],
  alerts: [
    { type: "low_usage", detail: "4K渲染使用率仅16%，建议推送教程", level: "yellow" },
  ],
  reachRecords: [
    { id: "r1", type: "sms", campaign: "春季续费优惠活动", content: "尊敬的张明，您的专业版即将到期，续费享8折优惠", status: "opened", sentAt: "2026-03-20", openedAt: "2026-03-20" },
    { id: "r2", type: "in_app", campaign: "新功能上线通知", content: "AI设计2.0全新升级，快来体验", status: "converted", sentAt: "2026-02-15", openedAt: "2026-02-15" },
    { id: "r3", type: "email", campaign: "", content: "客户成功经理主动联系，了解使用情况", status: "replied", sentAt: "2026-01-10", openedAt: "2026-01-10" },
  ],
  activeHours: [0,0,0,0,0,1,2,5,12,18,22,15,8,14,20,18,12,8,4,3,2,1,0,0],
  // ── 新增：用户画像维度
  portrait: {
    // 雷达图维度 0-100
    dimensions: [
      { name: "创作活跃", value: 82 },
      { name: "工具深度", value: 65 },
      { name: "付费意愿", value: 78 },
      { name: "分享传播", value: 45 },
      { name: "学习成长", value: 70 },
      { name: "客户服务", value: 58 },
    ],
    persona: "高频创作型设计师",
    personaDesc: "该用户具有较高的创作频率和付费意愿，善于利用AI工具提升效率。分享传播维度有提升空间，可通过激励计划提升带单能力。",
    interests: ["AI设计", "高端住宅", "全屋定制", "智能家居", "新材料"],
    stylePreference: { primary: "现代简约", secondary: "北欧", score: 92 },
  },
  // ── 新增：转化与复购
  conversion: {
    firstPayDays: 5,   // 注册到首次付费天数
    upgradeCount: 2,    // 升级次数
    upgradePath: ["基础版月卡", "专业版年卡", "专业版年卡(续)"],
    avgRenewalCycle: 365, // 平均续费周期(天)
    churnRisk: 15,      // 流失风险 0-100
    renewalProbability: 85, // 续费概率
    ltv: 28400,         // 生命周期价值
    arpu: 775,          // 月均消费
    repurchaseRate: 67, // 复购率
    repurchaseHistory: [
      { period: "2024-Q2", amount: 98, type: "首购" },
      { period: "2024-Q3", amount: 980, type: "加购" },
      { period: "2024-Q4", amount: 8800, type: "续费" },
      { period: "2025-Q3", amount: 9800, type: "续费" },
    ],
  },
  // ── 新增：带单能力
  referral: {
    totalReferred: 3,
    convertedReferred: 2,
    referralRevenue: 15600,
    referralConvertRate: 67,
    referredUsers: [
      { name: "陈设计师", status: "已付费", amount: 8800, date: "2025-06-20" },
      { name: "周设计师", status: "已付费", amount: 6800, date: "2025-08-15" },
      { name: "刘设计师", status: "注册未付费", amount: 0, date: "2026-01-10" },
    ],
  },
  // ── 新增：运营建议
  recommendations: [
    { type: "upsell", priority: "high", title: "推荐升级旗舰版", desc: "该用户AI设计使用率89%，已接近配额上限，旗舰版可提供更多AI额度和4K渲染权益", impact: "+¥5,200/年", icon: "upgrade" },
    { type: "activation", priority: "medium", title: "推送4K渲染教程", desc: "4K渲染使用率仅16%，通过教程引导可提升功能深度评分", impact: "功能使用+30%", icon: "teach" },
    { type: "referral", priority: "medium", title: "邀请加入推荐计划", desc: "该用户已成功推荐2人付费，适合纳入VIP推荐官计划", impact: "预计带单3人/季", icon: "share" },
    { type: "retention", priority: "low", title: "预约续费回访", desc: "距离到期还有174天，可在到期前90天安排客户成功经理回访", impact: "续费率+12%", icon: "calendar" },
  ],
};

/* ══════════════════════════════════════════════
   MOCK DATA — End Customer
   ══════════════════════════════════════════════ */
const MOCK_EC = {
  id: "ec-1", name: "李女士", phone: "13900002222",
  lifecycle: "serving" as const, followStatus: "won" as const,
  intentLevel: "high" as const,
  sourceEnterprise: "欧派家居集团", assignedStaff: "王设计师",
  createdAt: "2025-08-20", lastFollowAt: "2026-03-15",
  tags: ["已签约", "装修中", "高端客户"], remark: "120平三室两厅全屋定制，预算15万，风格偏现代简约",
  address: "上海市浦东新区XX路XX号XX小区3栋2单元1801", houseType: "三室两厅", area: "120㎡", budget: "15万",
  decorateStage: "施工中",
  expectedDelivery: "2026-06-30",
  familyMembers: "夫妻+1个孩子(5岁)",
  preferenceStyle: "现代简约",
  linkedEnterprises: [
    { id: "ent-1", name: "欧派家居集团", type: "品牌商", staff: "王设计师", followStatus: "won" as const, createdAt: "2025-08-20", serviceCount: 5, lastServiceAt: "2026-03-15", totalEntitlement: "AI设计x8, 3D渲染x12" },
    { id: "ent-2", name: "索菲亚家居", type: "品牌商", staff: "李顾问", followStatus: "following" as const, createdAt: "2025-10-15", serviceCount: 1, lastServiceAt: "2025-10-20", totalEntitlement: "" },
  ],
  serviceRecords: [
    { id: "s1", enterprise: "欧派家居集团", type: "量房", date: "2026-03-15", staff: "王设计师", note: "完成量房，厨房有特殊布局需求，需要定制U型橱柜", entitlement: "3D渲染 x2" },
    { id: "s2", enterprise: "欧派家居集团", type: "出方案", date: "2026-03-10", staff: "王设计师", note: "出具3套方案供客户选择，客户倾向方案B", entitlement: "AI设计 x3, 3D渲染 x6" },
    { id: "s3", enterprise: "欧派家居集团", type: "签约", date: "2025-11-15", staff: "王设计师", note: "签订全屋定制合同，总金额12.8万", entitlement: "" },
    { id: "s4", enterprise: "索菲亚家居", type: "初次接触", date: "2025-10-20", staff: "李顾问", note: "客户咨询卧室衣柜定制方案", entitlement: "" },
  ],
  lifecycleHistory: [
    { stage: "新录入", date: "2025-08-20", note: "欧派家居集团录入" },
    { stage: "跟进中", date: "2025-09-01", note: "首次电话沟通" },
    { stage: "已成交", date: "2025-11-15", note: "签订全屋定制合同" },
    { stage: "服务中", date: "2025-12-01", note: "进入施工阶段" },
  ],
  alerts: [],
  reachRecords: [
    { id: "r1", type: "wechat", campaign: "", content: "微信发送效果图确认，客户非常满意客厅方案", status: "replied", sentAt: "2026-03-12", openedAt: "2026-03-12" },
    { id: "r2", type: "sms", campaign: "施工进度通知", content: "您的装修项目已进入木工阶段", status: "opened", sentAt: "2026-03-01", openedAt: "2026-03-01" },
  ],
  // ── 新增：客户画像
  portrait: {
    intentScore: 92,
    satisfactionScore: 88,
    cooperationDepth: 75,
    referralWillingness: 60,
    persona: "高净值全屋定制客户",
    personaDesc: "该客户预算充裕，决策明确，对设计品质要求高。已签约并进入施工阶段，满意度较高。具备转介绍潜力。",
    decisionFactors: ["设计效果", "品牌口碑", "价格合理", "服务态度"],
    budgetLevel: "高端" as const,
  },
  // ── 新增：转化路径
  conversionPath: {
    totalDays: 87,   // 从录入到成交天数
    touchpoints: 12,  // 触达次数
    stages: [
      { name: "初次接触", date: "2025-08-20", days: 0 },
      { name: "需求确认", date: "2025-09-01", days: 12 },
      { name: "方案沟通", date: "2025-09-20", days: 31 },
      { name: "到店体验", date: "2025-10-10", days: 51 },
      { name: "报价确认", date: "2025-10-30", days: 71 },
      { name: "签约成交", date: "2025-11-15", days: 87 },
    ],
    contractAmount: 128000,
    estimateRepurchase: "高（可能追加软装/衣柜）",
  },
  // ── 新增：复购与增购潜力
  repurchase: {
    probability: 72,
    potentialItems: ["软装搭配方案", "卧室衣柜定制", "智能家居集成"],
    estimatedAmount: "3-5万",
    nextBestAction: "施工完成后推送软装搭配服务",
  },
  // ── 新增：运营建议
  recommendations: [
    { type: "cross_sell", priority: "high", title: "推荐软装搭配服务", desc: "客户全屋定制即将完工，可适时推送软装搭配方案，预计增购3-5万", impact: "+¥3-5万", icon: "package" },
    { type: "referral", priority: "high", title: "邀请老带新", desc: "客户满意度88分，可邀请参与老带新活动，赠送保养服务作为激励", impact: "预计带单1-2单", icon: "users" },
    { type: "satisfaction", priority: "medium", title: "安排阶段回访", desc: "木工阶段即将完成，建议安排回访确认满意度，预防售后投诉", impact: "满意度+5%", icon: "heart" },
    { type: "retention", priority: "low", title: "建立长期关系", desc: "施工完成后纳入VIP客户群，定期推送家居保养和智能家居升级信息", impact: "LTV+30%", icon: "star" },
  ],
};

/* ══════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════ */
export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesigner = !id?.startsWith("ec");
  const [followRecords] = useState<FollowRecord[]>(generateFollowRecords(6));
  const [showAddFollow, setShowAddFollow] = useState(false);
  const [newFollow, setNewFollow] = useState({ type: "phone", content: "" });
  const d = MOCK_DESIGNER;
  const ec = MOCK_EC;

  const lcMap = isDesigner ? DESIGNER_LIFECYCLE_MAP : END_CUSTOMER_LIFECYCLE_MAP;
  const lcKey = isDesigner ? d.lifecycle : ec.lifecycle;
  const lcInfo = lcMap[lcKey as keyof typeof lcMap];

  const handleAddFollow = () => {
    if (!newFollow.content.trim()) return;
    toast.success("跟进记录已添加");
    setShowAddFollow(false);
    setNewFollow({ type: "phone", content: "" });
  };

  return (
    <div>
      <DetailActionBar
        backLabel="客户列表"
        backPath="/customer/list"
        currentName={isDesigner ? d.name : ec.name}
        onEdit={() => navigate(`/customer/create?mode=edit&id=${id}&type=${isDesigner ? "designer" : "end_customer"}`)}
        statusToggle={{ currentActive: true, onToggle: () => toast.success("状态已切换") }}
      />

      {/* ═══════════════════════════════════════════
          HEADER: Profile Summary Strip
          ═══════════════════════════════════════════ */}
      <div className="mt-4 rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="p-5 flex items-start gap-5">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">{(isDesigner ? d.name : ec.name)[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold">{isDesigner ? d.name : ec.name}</h2>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${isDesigner ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-700"}`}>
                {isDesigner ? "个人设计师" : "企业客户"}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${lcInfo.color}`}>{lcInfo.label}</span>
              {!isDesigner && <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${FOLLOW_STATUS_MAP[ec.followStatus].color}`}>{FOLLOW_STATUS_MAP[ec.followStatus].label}</span>}
              {/* Persona tag */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-50 text-violet-700">
                <Sparkles className="h-3 w-3" />
                {isDesigner ? d.portrait.persona : ec.portrait.persona}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /><span className="font-mono">{isDesigner ? d.phone : ec.phone}</span></span>
              {isDesigner && d.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{d.email}</span>}
              {isDesigner && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{d.city} · {d.district}</span>}
              {isDesigner && <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{d.company}</span>}
              {!isDesigner && <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{ec.sourceEnterprise}</span>}
              {!isDesigner && <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />负责人: {ec.assignedStaff}</span>}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(isDesigner ? d.tags : ec.tags).map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>
          {/* Right: Key metrics */}
          <div className="hidden lg:flex items-center gap-5 shrink-0">
            {isDesigner ? (
              <>
                <MetricPill label="CVS" value={d.cvsScore} suffix="/100" color={d.cvsScore >= 80 ? "text-emerald-600" : d.cvsScore >= 50 ? "text-primary" : "text-amber-600"} />
                <MetricPill label="续费概率" value={`${d.conversion.renewalProbability}%`} color="text-emerald-600" />
                <MetricPill label="LTV" value={`¥${d.conversion.ltv.toLocaleString()}`} />
                <MetricPill label="流失风险" value={`${d.conversion.churnRisk}%`} color={d.conversion.churnRisk >= 50 ? "text-red-600" : "text-emerald-600"} />
              </>
            ) : (
              <>
                <MetricPill label="意向度" value={`${ec.portrait.intentScore}分`} color="text-emerald-600" />
                <MetricPill label="满意度" value={`${ec.portrait.satisfactionScore}分`} color="text-primary" />
                <MetricPill label="合同额" value={`¥${(ec.conversionPath.contractAmount/10000).toFixed(1)}万`} />
                <MetricPill label="复购概率" value={`${ec.repurchase.probability}%`} color="text-emerald-600" />
              </>
            )}
          </div>
        </div>

        {/* Alerts banner */}
        {(isDesigner ? d.alerts : ec.alerts).length > 0 && (
          <div className="px-5 pb-3">
            {(isDesigner ? d.alerts : ec.alerts).map((a, i) => {
              const info = ALERT_TYPE_MAP[a.type];
              return (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                  <span>{info?.icon || "⚠️"}</span>
                  <span className="font-medium text-amber-800">{info?.label}</span>
                  <span className="text-amber-700">{a.detail}</span>
                  <Button variant="outline" size="sm" className="ml-auto h-6 text-xs" onClick={() => toast.success("已处理")}>处理</Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          BODY: Dense Information Grid
          ═══════════════════════════════════════════ */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── LEFT COLUMN (5 cols) ── */}
        <div className="lg:col-span-5 space-y-5">

          {/* ★ 用户画像 — 雷达图 + 画像描述 */}
          <SectionCard title="用户画像" icon={Brain}>
            {isDesigner ? (
              <div>
                {/* Radar chart via SVG */}
                <div className="flex items-start gap-4">
                  <div className="w-[160px] h-[160px] shrink-0">
                    <RadarChart dimensions={d.portrait.dimensions} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-50 text-violet-700">{d.portrait.persona}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{d.portrait.personaDesc}</p>
                    <div className="mb-2">
                      <span className="text-[11px] text-muted-foreground">兴趣标签</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {d.portrait.interests.map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground">风格偏好</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium">{d.portrait.stylePreference.primary}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[80px]">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${d.portrait.stylePreference.score}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{d.portrait.stylePreference.score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{ec.portrait.personaDesc}</p>
                <div className="grid grid-cols-2 gap-3">
                  <ScoreGauge label="意向度" value={ec.portrait.intentScore} />
                  <ScoreGauge label="满意度" value={ec.portrait.satisfactionScore} />
                  <ScoreGauge label="合作深度" value={ec.portrait.cooperationDepth} />
                  <ScoreGauge label="转介绍意愿" value={ec.portrait.referralWillingness} />
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">决策因素</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {ec.portrait.decisionFactors.map((f, i) => (
                      <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                        <span className="text-primary font-bold">{i + 1}</span>{f}
                      </span>
                    ))}
                  </div>
                </div>
                <InfoItem label="预算水平" value={ec.portrait.budgetLevel === "高端" ? "💎 高端客户" : "中端客户"} />
              </div>
            )}
          </SectionCard>

          {/* Section: 基本档案 */}
          <SectionCard title="基本档案" icon={FileText}>
            {isDesigner ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                <InfoItem label="注册时间" value={d.registeredAt} />
                <InfoItem label="最后登录" value={d.lastLoginAt} />
                <InfoItem label="来源渠道" value={d.source} />
                <InfoItem label="从业年限" value={d.experience} />
                <InfoItem label="当前套餐" value={d.currentPackage} />
                <InfoItem label="套餐到期" value={d.packageExpiry} />
                <InfoItem label="最近设备" value={d.lastDevice} />
                <InfoItem label="最近IP" value={d.lastIP} mono />
                <div className="col-span-2"><InfoItem label="擅长风格" value={d.specialties.join("、")} /></div>
                <div className="col-span-2"><InfoItem label="认证资质" value={d.certifications.join("、")} /></div>
                <div className="col-span-2"><InfoItem label="备注" value={d.remark || "—"} /></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                <InfoItem label="录入时间" value={ec.createdAt} />
                <InfoItem label="最近跟进" value={ec.lastFollowAt} />
                <InfoItem label="所属企业" value={ec.sourceEnterprise} />
                <InfoItem label="负责人" value={ec.assignedStaff} />
                <InfoItem label="装修阶段" value={ec.decorateStage} />
                <InfoItem label="户型" value={ec.houseType} />
                <InfoItem label="面积" value={ec.area} />
                <InfoItem label="预算" value={ec.budget} />
                <InfoItem label="交付预期" value={ec.expectedDelivery} />
                <InfoItem label="家庭成员" value={ec.familyMembers} />
                <InfoItem label="风格偏好" value={ec.preferenceStyle} />
                <InfoItem label="地址" value={ec.address} />
                <div className="col-span-2"><InfoItem label="备注" value={ec.remark || "—"} /></div>
              </div>
            )}
          </SectionCard>

          {/* Section: 生命周期历程 */}
          <SectionCard title="生命周期历程" icon={Clock}>
            <div className="relative pl-5">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border/60" />
              {(isDesigner ? d.lifecycleHistory : ec.lifecycleHistory).map((h, i, arr) => (
                <div key={i} className="relative pb-4 last:pb-0">
                  <div className={`absolute left-[-13px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-card ${i === arr.length - 1 ? "border-primary" : "border-muted-foreground/40"}`} />
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{h.stage}</span>
                    <span className="text-[11px] text-muted-foreground">{h.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 关联企业 (EC only) */}
          {!isDesigner && (
            <SectionCard title="关联企业" icon={Building2} badge={`${ec.linkedEnterprises.length}家`}>
              <div className="space-y-3">
                {ec.linkedEnterprises.map(ent => (
                  <div key={ent.id} className="p-3 rounded-lg border border-border/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center"><Building2 className="h-3.5 w-3.5 text-primary" /></div>
                        <span className="text-sm font-medium">{ent.name}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{ent.type}</span>
                      </div>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${FOLLOW_STATUS_MAP[ent.followStatus].color}`}>{FOLLOW_STATUS_MAP[ent.followStatus].label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground ml-9">
                      <span>负责人: {ent.staff}</span>
                      <span>录入: {ent.createdAt}</span>
                      <span>服务次数: {ent.serviceCount}次</span>
                      <span>最近服务: {ent.lastServiceAt}</span>
                      {ent.totalEntitlement && <span className="col-span-2 text-primary">消耗权益: {ent.totalEntitlement}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* 跟进记录 */}
          <SectionCard title="跟进记录" icon={MessageSquare}
            action={<button onClick={() => setShowAddFollow(true)} className="text-xs text-primary hover:underline flex items-center gap-0.5"><Plus className="h-3 w-3" />新增</button>}
          >
            {showAddFollow && (
              <div className="mb-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex gap-2 flex-wrap mb-2">
                  {Object.entries(FOLLOW_TYPES_MAP).map(([k, v]) => (
                    <button key={k} onClick={() => setNewFollow(p => ({ ...p, type: k }))}
                      className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${newFollow.type === k ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}`}
                    >{v}</button>
                  ))}
                </div>
                <textarea className="w-full h-16 px-3 py-2 rounded-lg border border-border/60 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-2"
                  placeholder="请输入跟进内容..." value={newFollow.content} onChange={e => setNewFollow(p => ({ ...p, content: e.target.value }))} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowAddFollow(false)}>取消</Button>
                  <Button size="sm" className="h-7 text-xs" onClick={handleAddFollow}>提交</Button>
                </div>
              </div>
            )}
            <div className="relative pl-5">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border/60" />
              {followRecords.slice(0, 5).map(r => (
                <div key={r.id} className="relative pb-4 last:pb-0">
                  <div className="absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-primary bg-card" />
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium">{FOLLOW_TYPES_MAP[r.type] || r.type}</span>
                    {r.enterprise && <span className="text-[10px] text-muted-foreground">{r.enterprise}</span>}
                    <span className="text-[10px] text-muted-foreground ml-auto">{r.createdAt}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{r.content}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>{r.operator}</span>
                    {r.feedback && <span>{r.feedback === "positive" ? "👍积极" : r.feedback === "neutral" ? "😐一般" : "👎消极"}</span>}
                    {r.nextFollowAt && <span>下次: {r.nextFollowAt}</span>}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 触达记录 */}
          <SectionCard title="触达记录" icon={Send}>
            {(isDesigner ? d.reachRecords : ec.reachRecords).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">暂无触达记录</p>
            ) : (
              <div className="space-y-2">
                {(isDesigner ? d.reachRecords : ec.reachRecords).map(r => {
                  const typeMap: Record<string, string> = { sms: "短信", email: "邮件", in_app: "站内信", phone: "电话", wechat: "微信" };
                  const statusMap: Record<string, { label: string; color: string }> = {
                    sent: { label: "已发送", color: "bg-muted text-muted-foreground" },
                    opened: { label: "已打开", color: "bg-cyan-100 text-cyan-700" },
                    replied: { label: "已回复", color: "bg-emerald-100 text-emerald-700" },
                    converted: { label: "已转化", color: "bg-primary/10 text-primary" },
                  };
                  const st = statusMap[r.status] || statusMap.sent;
                  return (
                    <div key={r.id} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/40">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Send className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">{typeMap[r.type] || r.type}</span>
                          {r.campaign && <span className="text-[10px] text-primary truncate">{r.campaign}</span>}
                          <span className={`inline-flex px-1 py-0.5 rounded text-[10px] font-medium ml-auto ${st.color}`}>{st.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.content}</p>
                        <span className="text-[10px] text-muted-foreground">{r.sentAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── RIGHT COLUMN (7 cols) ── */}
        <div className="lg:col-span-7 space-y-5">

          {/* ★ 运营建议 — AI Smart Recommendations */}
          <SectionCard title="智能运营建议" icon={Lightbulb}>
            <div className="space-y-2.5">
              {(isDesigner ? d.recommendations : ec.recommendations).map((rec, i) => {
                const priorityColors: Record<string, string> = {
                  high: "border-l-red-500 bg-red-50/30",
                  medium: "border-l-amber-500 bg-amber-50/30",
                  low: "border-l-blue-500 bg-blue-50/30",
                };
                const priorityLabels: Record<string, { label: string; color: string }> = {
                  high: { label: "高优", color: "bg-red-100 text-red-700" },
                  medium: { label: "中优", color: "bg-amber-100 text-amber-700" },
                  low: { label: "低优", color: "bg-blue-100 text-blue-700" },
                };
                const pl = priorityLabels[rec.priority];
                return (
                  <div key={i} className={`p-3 rounded-lg border-l-[3px] border border-border/40 ${priorityColors[rec.priority]}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${pl.color}`}>{pl.label}</span>
                      <span className="text-sm font-medium">{rec.title}</span>
                      <span className="ml-auto text-[11px] font-medium text-emerald-600">{rec.impact}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="h-6 text-[11px]" onClick={() => toast.success("已创建执行任务")}>立即执行</Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => toast.success("已加入待办")}>加入待办</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* ★ 转化分析 (Designer) — 复购路径 + LTV */}
          {isDesigner && (
            <SectionCard title="转化与复购分析" icon={Repeat}>
              <div className="space-y-4">
                {/* Key conversion metrics row */}
                <div className="grid grid-cols-5 gap-3">
                  <MiniStat label="首购转化" value={`${d.conversion.firstPayDays}天`} desc="注册→付费" />
                  <MiniStat label="复购率" value={`${d.conversion.repurchaseRate}%`} desc="重复购买" highlight />
                  <MiniStat label="续费概率" value={`${d.conversion.renewalProbability}%`} desc="预测值" />
                  <MiniStat label="月均ARPU" value={`¥${d.conversion.arpu}`} desc="平均消费" />
                  <MiniStat label="客户LTV" value={`¥${(d.conversion.ltv/10000).toFixed(1)}万`} desc="生命周期价值" highlight />
                </div>

                {/* Upgrade path visualization */}
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">升级路径</h5>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {d.conversion.upgradePath.map((step, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className={`px-2 py-1 rounded-lg text-[11px] font-medium border ${i === d.conversion.upgradePath.length - 1 ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}`}>{step}</span>
                        {i < d.conversion.upgradePath.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/50" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repurchase timeline */}
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">复购时间线</h5>
                  <div className="flex gap-2 flex-wrap">
                    {d.conversion.repurchaseHistory.map((rp, i) => (
                      <div key={i} className="flex-1 min-w-[100px] p-2.5 rounded-lg border border-border/40 text-center">
                        <div className="text-[10px] text-muted-foreground">{rp.period}</div>
                        <div className="text-sm font-bold mt-0.5">¥{rp.amount.toLocaleString()}</div>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium mt-1 ${rp.type === "首购" ? "bg-blue-100 text-blue-700" : rp.type === "加购" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{rp.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk meter */}
                <div className="flex items-center gap-4 p-3 rounded-lg border border-border/40 bg-muted/20">
                  <div>
                    <span className="text-[11px] text-muted-foreground">流失风险</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${d.conversion.churnRisk >= 50 ? "bg-red-500" : d.conversion.churnRisk >= 30 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${d.conversion.churnRisk}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${d.conversion.churnRisk >= 50 ? "text-red-600" : d.conversion.churnRisk >= 30 ? "text-amber-600" : "text-emerald-600"}`}>{d.conversion.churnRisk}%</span>
                    </div>
                  </div>
                  <div className="flex-1 text-xs text-muted-foreground">
                    平均续费周期 {d.conversion.avgRenewalCycle} 天，已升级 {d.conversion.upgradeCount} 次
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ★ 转化路径 (EC) */}
          {!isDesigner && (
            <SectionCard title="转化路径分析" icon={Target}>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <MiniStat label="转化周期" value={`${ec.conversionPath.totalDays}天`} desc="录入→成交" />
                  <MiniStat label="触达次数" value={`${ec.conversionPath.touchpoints}次`} desc="总接触点" />
                  <MiniStat label="合同金额" value={`¥${(ec.conversionPath.contractAmount/10000).toFixed(1)}万`} desc="已签约" highlight />
                </div>

                {/* Conversion stages flow */}
                <div className="relative">
                  <div className="flex items-center">
                    {ec.conversionPath.stages.map((s, i) => (
                      <div key={i} className="flex-1 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === ec.conversionPath.stages.length - 1 ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                            {i + 1}
                          </div>
                          <span className="text-[10px] font-medium mt-1 text-center">{s.name}</span>
                          <span className="text-[9px] text-muted-foreground">{s.date}</span>
                          {s.days > 0 && <span className="text-[9px] text-primary">+{s.days}天</span>}
                        </div>
                        {i < ec.conversionPath.stages.length - 1 && (
                          <div className="absolute top-4 left-[60%] w-[80%] h-px bg-border/60" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repurchase potential */}
                <div className="p-3 rounded-lg border border-border/40 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">复购与增购潜力</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                      <TrendingUp className="h-3 w-3" />{ec.repurchase.probability}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {ec.repurchase.potentialItems.map(item => (
                      <span key={item} className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium">{item}</span>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">预估增购金额: </span>{ec.repurchase.estimatedAmount}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">最佳行动: </span>{ec.repurchase.nextBestAction}
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Designer: 核心指标 + CVS */}
          {isDesigner && (
            <>
              <SectionCard title="核心指标" icon={BarChart3}>
                <div className="grid grid-cols-4 gap-3">
                  <StatBlock label="设计方案" value={d.designCount} suffix="个" />
                  <StatBlock label="渲染次数" value={d.renderCount} suffix="次" />
                  <StatBlock label="30天登录" value={d.loginDays30} suffix="天" />
                  <StatBlock label="功能使用" value={d.featuresUsed} suffix="/8" />
                  <StatBlock label="总项目" value={d.totalProjects} suffix="个" />
                  <StatBlock label="均单价值" value={`¥${d.avgProjectValue.toLocaleString()}`} />
                  <StatBlock label="推荐客户" value={d.referralCount} suffix="人" />
                  <StatBlock label="续费次数" value={d.renewalCount} suffix="次" />
                </div>
              </SectionCard>

              <SectionCard title="客户价值评分 (CVS)" icon={Award}>
                <div className="flex items-center gap-6 mb-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="35" fill="none" strokeWidth="6" className="stroke-muted" />
                      <circle cx="40" cy="40" r="35" fill="none" strokeWidth="6" className="stroke-primary" strokeLinecap="round"
                        strokeDasharray={`${d.cvsScore * 2.2} 220`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{d.cvsScore}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[
                      { dim: "权益使用率", weight: 30, score: Math.round(d.usageRate * 0.3) },
                      { dim: "登录活跃度", weight: 20, score: Math.round((d.loginDays30 / 30) * 100 * 0.2) },
                      { dim: "消费金额", weight: 25, score: Math.min(25, Math.round(d.totalSpent / 2000)) },
                      { dim: "续费次数", weight: 15, score: Math.min(15, d.renewalCount * 5) },
                      { dim: "功能深度", weight: 10, score: Math.round((d.featuresUsed / 8) * 10) },
                    ].map(s => (
                      <div key={s.dim} className="flex items-center gap-2 text-xs">
                        <span className="min-w-[68px] text-muted-foreground">{s.dim}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(s.score / s.weight) * 100}%` }} />
                        </div>
                        <span className="font-medium min-w-[36px] text-right text-muted-foreground">{s.score}/{s.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* ★ 带单能力 (Designer) */}
          {isDesigner && (
            <SectionCard title="带单能力" icon={UserPlus}>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <MiniStat label="推荐人数" value={d.referral.totalReferred} desc="累计推荐" />
                <MiniStat label="转化人数" value={d.referral.convertedReferred} desc="已付费" highlight />
                <MiniStat label="转化率" value={`${d.referral.referralConvertRate}%`} desc="推荐转化" />
                <MiniStat label="推荐营收" value={`¥${(d.referral.referralRevenue/10000).toFixed(1)}万`} desc="带单金额" highlight />
              </div>
              <div className="space-y-2">
                {d.referral.referredUsers.map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{u.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">{u.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.amount > 0 && <span className="text-sm font-medium">¥{u.amount.toLocaleString()}</span>}
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${u.status === "已付费" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{u.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* 权益账户 (Designer) */}
          {isDesigner && (
            <SectionCard title="权益账户" icon={Gift} badge={`${d.currentPackage} · 到期 ${d.packageExpiry}`}>
              <div className="grid grid-cols-3 gap-3">
                {d.entitlements.map((e, i) => {
                  const rate = Math.round((e.used / e.total) * 100);
                  return (
                    <div key={i} className="p-3 rounded-lg border border-border/40">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span>{e.icon}</span>
                        <span className="text-xs font-medium">{e.name}</span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-1.5">
                        <span className="text-lg font-bold">{e.used}</span>
                        <span className="text-xs text-muted-foreground">/ {e.total} {e.unit}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${rate >= 80 ? "bg-amber-500" : rate >= 50 ? "bg-primary" : "bg-emerald-500"}`} style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">近30天消耗趋势</span>
                </div>
                <div className="flex items-end gap-[2px] h-12">
                  {d.usageTrend.map((v, i) => (
                    <div key={i} className="flex-1 bg-primary/30 rounded-t hover:bg-primary/60 transition-colors cursor-default" style={{ height: `${v}%` }} title={`Day ${i + 1}: ${v}%`} />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5"><span>30天前</span><span>今天</span></div>
              </div>
            </SectionCard>
          )}

          {/* 服务记录 (EC) */}
          {!isDesigner && (
            <SectionCard title="服务记录" icon={FileText} badge={`${ec.serviceRecords.length}条`}>
              <div className="relative pl-5">
                <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border/60" />
                {ec.serviceRecords.map(rec => (
                  <div key={rec.id} className="relative pb-4 last:pb-0">
                    <div className="absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-primary bg-card" />
                    <div className="p-3 rounded-lg border border-border/40 bg-card">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{rec.type}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{rec.enterprise}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{rec.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.staff} · {rec.note}</p>
                      {rec.entitlement && <p className="text-[11px] text-primary mt-1">消耗权益: {rec.entitlement}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* 行为轨迹 (Designer) */}
          {isDesigner && (
            <SectionCard title="行为轨迹" icon={MousePointerClick}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 relative pl-5">
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border/60" />
                  {d.behaviors.map((b, i) => (
                    <div key={i} className="relative pb-3.5 last:pb-0">
                      <div className={`absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-card ${b.icon === "milestone" ? "border-amber-500" : "border-primary/60"}`} />
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${b.icon === "milestone" ? "text-amber-700" : ""}`}>{b.event}</span>
                        {b.icon === "milestone" && <span className="px-1 py-0.5 rounded text-[9px] bg-amber-100 text-amber-700">里程碑</span>}
                        <span className="text-[10px] text-muted-foreground ml-auto">{b.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{b.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h5 className="text-xs font-medium mb-2 text-muted-foreground">功能偏好排名</h5>
                    <div className="space-y-2">
                      {d.featureUsage.map((f, i) => (
                        <div key={f.name} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-3">{i + 1}</span>
                          <span className="text-xs flex-1 truncate">{f.name}</span>
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/50 rounded-full" style={{ width: `${f.pct}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-8 text-right">{f.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium mb-2 text-muted-foreground">活跃时段</h5>
                    <div className="flex items-end gap-[2px] h-10">
                      {d.activeHours.map((v, i) => (
                        <div key={i} className="flex-1 bg-primary/25 rounded-t hover:bg-primary/50 transition-colors cursor-default"
                          style={{ height: `${(v / Math.max(...d.activeHours)) * 100}%` }}
                          title={`${i}:00 - ${v}次`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5"><span>0时</span><span>12时</span><span>23时</span></div>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* 订单记录 (Designer) */}
          {isDesigner && (
            <SectionCard title="订单记录" icon={ShoppingBag} badge={`${d.orders.length}笔 · ¥${d.totalSpent.toLocaleString()}`}>
              <div className="space-y-2">
                {d.orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{o.package}</div>
                        <div className="text-[11px] text-muted-foreground">{o.createdAt} · {o.payMethod}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">¥{o.amount.toLocaleString()}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">已完成</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SHARED UI COMPONENTS
   ══════════════════════════════════════════════ */

function SectionCard({ title, icon: Icon, children, badge, action }: {
  title: string; icon: React.ElementType; children: React.ReactNode; badge?: string; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">{title}</h4>
          {badge && <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">{badge}</span>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function InfoItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <p className={`text-sm mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function MetricPill({ label, value, suffix, color }: { label: string; value: React.ReactNode; suffix?: string; color?: string }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${color || "text-foreground"}`}>
        {value}{suffix && <span className="text-xs font-normal text-muted-foreground">{suffix}</span>}
      </div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function StatBlock({ label, value, suffix }: { label: string; value: React.ReactNode; suffix?: string }) {
  return (
    <div className="p-3 rounded-lg border border-border/40 text-center">
      <div className="text-lg font-bold">
        {value}{suffix && <span className="text-xs font-normal text-muted-foreground">{suffix}</span>}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function MiniStat({ label, value, desc, highlight }: { label: string; value: React.ReactNode; desc?: string; highlight?: boolean }) {
  return (
    <div className={`p-2.5 rounded-lg border text-center ${highlight ? "border-primary/30 bg-primary/5" : "border-border/40"}`}>
      <div className={`text-base font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
      <div className="text-[10px] font-medium mt-0.5">{label}</div>
      {desc && <div className="text-[9px] text-muted-foreground">{desc}</div>}
    </div>
  );
}

function ScoreGauge({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "text-emerald-600" : value >= 60 ? "text-primary" : "text-amber-600";
  const bgColor = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-primary" : "bg-amber-500";
  return (
    <div className="p-2.5 rounded-lg border border-border/40 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
        <div className={`h-full rounded-full ${bgColor}`} style={{ width: `${value}%` }} />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

/* ── SVG Radar Chart ── */
function RadarChart({ dimensions }: { dimensions: { name: string; value: number }[] }) {
  const n = dimensions.length;
  const cx = 80, cy = 80, r = 60;

  const getPoint = (i: number, val: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + (r * val / 100) * Math.cos(angle),
      y: cy + (r * val / 100) * Math.sin(angle),
    };
  };

  const levels = [25, 50, 75, 100];

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full">
      {/* Grid rings */}
      {levels.map(l => (
        <polygon key={l}
          points={Array.from({ length: n }, (_, i) => {
            const p = getPoint(i, l);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none" className="stroke-border/40" strokeWidth="0.5"
        />
      ))}
      {/* Axes */}
      {dimensions.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="stroke-border/30" strokeWidth="0.5" />;
      })}
      {/* Data polygon */}
      <polygon
        points={dimensions.map((d, i) => {
          const p = getPoint(i, d.value);
          return `${p.x},${p.y}`;
        }).join(" ")}
        className="fill-primary/15 stroke-primary" strokeWidth="1.5"
      />
      {/* Data points */}
      {dimensions.map((d, i) => {
        const p = getPoint(i, d.value);
        return <circle key={i} cx={p.x} cy={p.y} r="2.5" className="fill-primary" />;
      })}
      {/* Labels */}
      {dimensions.map((d, i) => {
        const p = getPoint(i, 120);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            className="fill-muted-foreground text-[8px]">
            {d.name}
          </text>
        );
      })}
    </svg>
  );
}
