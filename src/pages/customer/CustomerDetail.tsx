import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User, Phone, Building2, FileText, Gift, ShoppingBag, MousePointerClick,
  MessageSquare, Plus, TrendingUp, Send, Clock, BarChart3, MapPin, Mail,
  Briefcase, Award, AlertTriangle, Repeat, UserPlus, Brain, Lightbulb,
  Sparkles, ArrowRight, ChevronDown, ChevronUp, Target, Zap, Heart,
  Shield, RefreshCw, BookOpen, Megaphone, Star, Activity, Eye, ExternalLink,
} from "lucide-react";
import PortraitDialog, { DESIGNER_PORTRAIT, EC_PORTRAIT } from "./PortraitDialog";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DESIGNER_LIFECYCLE_MAP, END_CUSTOMER_LIFECYCLE_MAP, FOLLOW_STATUS_MAP,
  FOLLOW_TYPES_MAP, ALERT_TYPE_MAP,
  generateFollowRecords, type FollowRecord, type DesignerLifecycle,
} from "@/data/customer";

/* ══════════════════════════════════════════════
   MOCK — Designer
   ══════════════════════════════════════════════ */
const D = {
  id: "des-1", name: "张明", phone: "13800001111", email: "zhangming@design.com",
  lifecycle: "growing" as DesignerLifecycle, cvsScore: 72,
  currentPackage: "专业版", packageExpiry: "2026-09-15", usageRate: 56,
  totalSpent: 18600, registeredAt: "2024-03-15", lastLoginAt: "2026-03-25",
  source: "官网注册", tags: ["高价值", "VIP", "现代简约"],
  designCount: 42, renderCount: 312, loginDays30: 22, featuresUsed: 6, renewalCount: 2,
  remark: "资深室内设计师，擅长现代简约风格，服务过多个高端住宅项目",
  company: "明居设计工作室", city: "上海", district: "浦东新区",
  specialties: ["现代简约", "北欧", "轻奢"], experience: "8年",
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
    { event: "AI设计生成", time: "03-25 14:45", detail: "现代简约客厅 · 生成3张", cat: "creation" },
    { event: "3D渲染", time: "03-25 15:10", detail: "提交8K渲染 · 23s", cat: "creation" },
    { event: "方案导出", time: "03-24 10:20", detail: "PDF方案书 · 28页", cat: "output" },
    { event: "模型下载", time: "03-23 16:40", detail: "沙发x3 · 北欧风格", cat: "resource" },
    { event: "VR全景", time: "03-20 09:15", detail: "客厅VR全景图", cat: "creation" },
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
    { stage: "注册期", date: "2024-03-15", note: "官网自主注册" },
    { stage: "激活期", date: "2024-03-20", note: "购买基础版月卡" },
    { stage: "成长期", date: "2024-06-01", note: "使用率超过30%" },
  ],
  alerts: [{ type: "low_usage", detail: "4K渲染使用率仅16%，建议推送教程", level: "yellow" }],
  activeHours: [0,0,0,0,0,1,2,5,12,18,22,15,8,14,20,18,12,8,4,3,2,1,0,0],
  portrait: {
    dimensions: [
      { name: "创作活跃", value: 82 }, { name: "工具深度", value: 65 },
      { name: "付费意愿", value: 78 }, { name: "分享传播", value: 45 },
      { name: "学习成长", value: 70 }, { name: "客户服务", value: 58 },
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
    { priority: "high" as const, title: "升级旗舰版", desc: "AI设计使用率达89%，已接近500次配额上限。旗舰版提供2000次AI额度+无限4K渲染，按当前消耗速度预计45天后配额耗尽。", impact: "+¥5,200/年", impactType: "revenue" as const, confidence: 92, basis: "使用率89% · 配额剩余44% · 历史升级2次", actionLabel: "生成升级方案", icon: TrendingUp },
    { priority: "high" as const, title: "发起续费预约", desc: "距到期174天，参考该用户过去2次续费行为（均在到期前60天完成），建议提前90天安排CSM回访。", impact: "续费率+18%", impactType: "retention" as const, confidence: 85, basis: "续费概率85% · 历史续费2次 · 平均周期365天", actionLabel: "预约CSM回访", icon: RefreshCw },
    { priority: "medium" as const, title: "4K渲染功能引导", desc: "4K渲染已购50次仅使用8次(16%)，而3D渲染使用率达56%。用户具备渲染习惯但未发现4K价值，推送对比教程可有效提升。", impact: "功能深度+30%", impactType: "activation" as const, confidence: 78, basis: "4K使用率16% · 3D使用率56% · 渲染习惯已建立", actionLabel: "推送教程", icon: BookOpen },
    { priority: "medium" as const, title: "纳入推荐官计划", desc: "已成功推荐2人付费(转化率67%)，带单金额¥1.56万。符合VIP推荐官资质，入选后可获得推荐佣金10%+专属权益包。", impact: "预计带单3人/季", impactType: "referral" as const, confidence: 75, basis: "推荐转化率67% · 带单¥1.56万 · CVS 72分", actionLabel: "发送邀请", icon: Megaphone },
  ],
  reachRecords: [
    { id: "r1", type: "sms", campaign: "春季续费优惠", content: "续费享8折", status: "opened", sentAt: "03-20" },
    { id: "r2", type: "in_app", campaign: "新功能通知", content: "AI设计2.0升级", status: "converted", sentAt: "02-15" },
  ],
};

/* ══════════════════════════════════════════════
   MOCK — End Customer
   ══════════════════════════════════════════════ */
const EC = {
  id: "ec-1", name: "李女士", phone: "13900002222",
  lifecycle: "serving" as const, followStatus: "won" as const,
  intentLevel: "high" as const,
  sourceEnterprise: "欧派家居集团", assignedStaff: "王设计师",
  createdAt: "2025-08-20", lastFollowAt: "2026-03-15",
  tags: ["已签约", "装修中", "高端客户"],
  remark: "120平三室两厅全屋定制，预算15万，风格偏现代简约",
  address: "上海市浦东新区XX路XX号XX小区3栋2单元1801", houseType: "三室两厅", area: "120㎡", budget: "15万",
  decorateStage: "施工中", expectedDelivery: "2026-06-30",
  familyMembers: "夫妻+1个孩子(5岁)", preferenceStyle: "现代简约",
  linkedEnterprises: [
    { id: "ent-1", name: "欧派家居集团", type: "品牌商", staff: "王设计师", followStatus: "won" as const, createdAt: "2025-08", serviceCount: 5, lastServiceAt: "2026-03", totalEntitlement: "AI设计x8, 3D渲染x12" },
    { id: "ent-2", name: "索菲亚家居", type: "品牌商", staff: "李顾问", followStatus: "following" as const, createdAt: "2025-10", serviceCount: 1, lastServiceAt: "2025-10", totalEntitlement: "" },
  ],
  serviceRecords: [
    { id: "s1", enterprise: "欧派家居", type: "量房", date: "03-15", staff: "王设计师", note: "厨房U型橱柜定制需求", entitlement: "3D渲染x2" },
    { id: "s2", enterprise: "欧派家居", type: "出方案", date: "03-10", staff: "王设计师", note: "3套方案，客户倾向方案B", entitlement: "AI设计x3, 3D渲染x6" },
    { id: "s3", enterprise: "欧派家居", type: "签约", date: "2025-11-15", staff: "王设计师", note: "签订全屋定制合同 ¥12.8万", entitlement: "" },
  ],
  lifecycleHistory: [
    { stage: "新录入", date: "2025-08-20", note: "欧派家居集团录入" },
    { stage: "跟进中", date: "2025-09-01", note: "首次电话沟通" },
    { stage: "已成交", date: "2025-11-15", note: "签订全屋定制合同" },
    { stage: "服务中", date: "2025-12-01", note: "进入施工阶段" },
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
    potentialItems: ["软装搭配方案", "卧室衣柜定制", "智能家居集成"],
    estimatedAmount: "3-5万",
  },
  recommendations: [
    { priority: "high" as const, title: "推荐软装搭配服务", desc: "客户全屋定制即将于6月完工，参考同类高端客户数据，完工后30天内追加软装需求概率为68%。当前已出3套硬装方案，客户满意度88分。", impact: "+¥3-5万", impactType: "revenue" as const, confidence: 82, basis: "满意度88分 · 完工倒计时92天 · 同类客户追加率68%", actionLabel: "推送软装方案", icon: Star },
    { priority: "high" as const, title: "老带新激励", desc: "客户满意度88分且为高端小区住户，该小区尚有35户待装修。赠送免费保养服务可激发转介绍意愿(当前60分)。", impact: "预计带单1-2单", impactType: "referral" as const, confidence: 76, basis: "满意度88 · 小区35户待装修 · 转介绍意愿60分", actionLabel: "发送邀请", icon: Megaphone },
    { priority: "medium" as const, title: "阶段满意度回访", desc: "木工阶段即将完成，是关键质量验收节点。主动回访可预防售后投诉并巩固口碑。建议安排王设计师上门回访。", impact: "满意度+5%", impactType: "retention" as const, confidence: 88, basis: "施工进度65% · 木工即将完成 · 上次回访20天前", actionLabel: "安排回访", icon: Heart },
  ],
  reachRecords: [
    { id: "r1", type: "wechat", campaign: "", content: "效果图确认，客户满意", status: "replied", sentAt: "03-12" },
    { id: "r2", type: "sms", campaign: "进度通知", content: "木工阶段", status: "opened", sentAt: "03-01" },
  ],
};

/* ══════════════════════════════════════════════
   FLOOR NAV
   ══════════════════════════════════════════════ */
const D_SECTIONS = [
  { id: "sec-portrait", label: "画像", icon: Brain },
  { id: "sec-recommend", label: "运营建议", icon: Lightbulb },
  { id: "sec-conversion", label: "转化复购", icon: Repeat },
  { id: "sec-referral", label: "带单", icon: UserPlus },
  { id: "sec-entitlement", label: "权益", icon: Gift },
  { id: "sec-behavior", label: "行为", icon: MousePointerClick },
  { id: "sec-orders", label: "订单", icon: ShoppingBag },
  { id: "sec-follow", label: "跟进触达", icon: MessageSquare },
];
const EC_SECTIONS = [
  { id: "sec-portrait", label: "画像", icon: Brain },
  { id: "sec-recommend", label: "运营建议", icon: Lightbulb },
  { id: "sec-conversion", label: "转化路径", icon: Repeat },
  { id: "sec-enterprise", label: "关联企业", icon: Building2 },
  { id: "sec-service", label: "服务记录", icon: FileText },
  { id: "sec-follow", label: "跟进触达", icon: MessageSquare },
];

const SCROLL_OFFSET = 56; // sticky nav height

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
  const [activeSection, setActiveSection] = useState("sec-portrait");
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showPortrait, setShowPortrait] = useState(false);

  const d = D;
  const ec = EC;
  const lcMap = isDesigner ? DESIGNER_LIFECYCLE_MAP : END_CUSTOMER_LIFECYCLE_MAP;
  const lcKey = isDesigner ? d.lifecycle : ec.lifecycle;
  const lcInfo = lcMap[lcKey as keyof typeof lcMap];
  const sections = isDesigner ? D_SECTIONS : EC_SECTIONS;

  // scroll spy
  useEffect(() => {
    const handler = () => {
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= SCROLL_OFFSET + 40) {
            setActiveSection(sections[i].id);
            return;
          }
        }
      }
      setActiveSection(sections[0].id);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [isDesigner]);

  const scrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleAddFollow = () => {
    if (!newFollow.content.trim()) return;
    toast.success("跟进记录已添加");
    setShowAddFollow(false);
    setNewFollow({ type: "phone", content: "" });
  };

  return (
    <div>
      <DetailActionBar backLabel="客户列表" backPath="/customer/list"
        currentName={isDesigner ? d.name : ec.name}
        onEdit={() => navigate(`/customer/create?mode=edit&id=${id}&type=${isDesigner ? "designer" : "end_customer"}`)}
        statusToggle={{ currentActive: true, onToggle: () => toast.success("状态已切换") }}
      />

      {/* ═══ HEADER ═══ */}
      <div className="mt-4 rounded-xl border border-border/60 bg-card">
        <div className="p-4 flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-primary">{(isDesigner ? d.name : ec.name)[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold">{isDesigner ? d.name : ec.name}</h2>
              <Badge color={isDesigner ? "primary" : "amber"}>{isDesigner ? "设计师" : "企业客户"}</Badge>
              <Badge color="custom" className={lcInfo.color}>{lcInfo.label}</Badge>
              {!isDesigner && <Badge color="custom" className={FOLLOW_STATUS_MAP[ec.followStatus].color}>{FOLLOW_STATUS_MAP[ec.followStatus].label}</Badge>}
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700">
                <Sparkles className="h-2.5 w-2.5" />{isDesigner ? d.portrait.persona : ec.portrait.persona}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground mt-1">
              <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{isDesigner ? d.phone : ec.phone}</span>
              {isDesigner && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{d.email}</span>}
              {isDesigner && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{d.city} · {d.district}</span>}
              {isDesigner && <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{d.company}</span>}
              {!isDesigner && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{ec.sourceEnterprise}</span>}
              {!isDesigner && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{ec.assignedStaff}</span>}
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(isDesigner ? d.tags : ec.tags).map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{t}</span>)}
            </div>
          </div>
          {/* Gauges */}
          <div className="hidden lg:grid grid-cols-4 gap-3 shrink-0">
            {isDesigner ? (
              <>
                <CircleGauge value={d.cvsScore} label="CVS" />
                <CircleGauge value={d.conversion.renewalProbability} label="续费率" color="emerald" />
                <CircleGauge value={d.conversion.repurchaseRate} label="复购率" color="blue" />
                <CircleGauge value={100 - d.conversion.churnRisk} label="健康度" color="emerald" />
              </>
            ) : (
              <>
                <CircleGauge value={ec.portrait.intentScore} label="意向度" />
                <CircleGauge value={ec.portrait.satisfactionScore} label="满意度" color="emerald" />
                <CircleGauge value={ec.repurchase.probability} label="复购率" color="blue" />
                <CircleGauge value={ec.portrait.cooperationDepth} label="合作度" color="amber" />
              </>
            )}
          </div>
        </div>

        {/* Expandable detailed info */}
        <div className="border-t border-border/40">
          <button onClick={() => setShowMoreInfo(!showMoreInfo)}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            {showMoreInfo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showMoreInfo ? "收起详细信息" : "查看详细信息"}
          </button>
          {showMoreInfo && (
            <div className="px-5 pb-4 pt-1">
              {isDesigner ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                  <InfoItem label="注册时间" value={d.registeredAt} />
                  <InfoItem label="最后登录" value={d.lastLoginAt} />
                  <InfoItem label="来源渠道" value={d.source} />
                  <InfoItem label="从业年限" value={d.experience} />
                  <InfoItem label="当前套餐" value={d.currentPackage} />
                  <InfoItem label="套餐到期" value={d.packageExpiry} />
                  <InfoItem label="最近设备" value={d.lastDevice} />
                  <InfoItem label="最近IP" value={d.lastIP} mono />
                  <InfoItem label="擅长风格" value={d.specialties.join("、")} />
                  <InfoItem label="认证资质" value={d.certifications.join("、")} />
                  <div className="col-span-2 lg:col-span-4"><InfoItem label="备注" value={d.remark} /></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                  <InfoItem label="录入时间" value={ec.createdAt} />
                  <InfoItem label="最近跟进" value={ec.lastFollowAt} />
                  <InfoItem label="户型" value={ec.houseType} />
                  <InfoItem label="面积" value={ec.area} />
                  <InfoItem label="预算" value={ec.budget} />
                  <InfoItem label="装修阶段" value={ec.decorateStage} />
                  <InfoItem label="交付预期" value={ec.expectedDelivery} />
                  <InfoItem label="家庭成员" value={ec.familyMembers} />
                  <InfoItem label="风格偏好" value={ec.preferenceStyle} />
                  <InfoItem label="地址" value={ec.address} />
                  <div className="col-span-2 lg:col-span-4"><InfoItem label="备注" value={ec.remark} /></div>
                </div>
              )}
              {/* Lifecycle timeline inline */}
              <div className="mt-3 pt-3 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground font-medium">生命周期</span>
                <div className="flex items-center gap-2 mt-1.5 overflow-x-auto">
                  {(isDesigner ? d.lifecycleHistory : ec.lifecycleHistory).map((h, i, arr) => (
                    <div key={i} className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === arr.length - 1 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                        <span className="text-[10px] font-medium mt-0.5">{h.stage}</span>
                        <span className="text-[9px] text-muted-foreground">{h.date}</span>
                      </div>
                      {i < arr.length - 1 && <div className="w-6 h-px bg-border/60 mb-4" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alerts */}
        {(isDesigner ? d.alerts : ec.alerts).length > 0 && (
          <div className="px-4 pb-3 flex gap-2">
            {(isDesigner ? d.alerts : ec.alerts).map((a, i) => {
              const info = ALERT_TYPE_MAP[a.type];
              return (
                <div key={i} className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                  <span>{info?.icon}</span><span className="text-amber-800 truncate">{a.detail}</span>
                  <Button variant="outline" size="sm" className="ml-auto h-5 text-[10px] px-2" onClick={() => toast.success("已处理")}>处理</Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ STICKY FLOOR NAV ═══ */}
      <div className="sticky top-0 z-20 mt-3 bg-background/95 backdrop-blur-sm border-b border-border/40 -mx-1 px-1">
        <div className="flex items-center gap-0.5 py-1.5 overflow-x-auto">
          {sections.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeSection === s.id
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <s.icon className="h-3.5 w-3.5" />{s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="mt-4 space-y-5">

        {/* ── 画像 ── */}
        <section id="sec-portrait">
          {isDesigner ? (() => {
            const portrait = DESIGNER_PORTRAIT;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Radar + Behavior Summary */}
                  <div className="lg:col-span-4 rounded-xl border border-border/60 bg-card p-4">
                    <SectionTitle icon={Brain} title="行为画像"
                      action={<button onClick={() => setShowPortrait(true)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5"><ExternalLink className="h-3 w-3" />完整画像</button>}
                    />
                    <div className="w-[140px] h-[140px] mx-auto mt-2"><RadarChart dimensions={portrait.radarDimensions} /></div>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed text-center">{portrait.personaDesc}</p>
                  </div>
                  {/* CVS + Core Stats */}
                  <div className="lg:col-span-4 rounded-xl border border-border/60 bg-card p-4">
                    <SectionTitle icon={Award} title="价值评分 CVS" />
                    <div className="flex items-center gap-4 mt-2">
                      <div className="relative w-16 h-16 shrink-0">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="27" fill="none" strokeWidth="5" className="stroke-muted" />
                          <circle cx="32" cy="32" r="27" fill="none" strokeWidth="5" className="stroke-primary" strokeLinecap="round" strokeDasharray={`${d.cvsScore * 1.7} 170`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-primary">{d.cvsScore}</span></div>
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
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary/60 rounded-full" style={{ width: `${(s.s / s.w) * 100}%` }} /></div>
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

                {/* Behavior Traits + Deep Needs Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-6 rounded-xl border border-border/60 bg-card p-4">
                    <SectionTitle icon={Activity} title="行为特征" />
                    <div className="space-y-1.5 mt-2">
                      {portrait.behaviorTraits.slice(0, 4).map((t, i) => {
                        const levelMap = { high: { l: "显著", c: "bg-emerald-100 text-emerald-700" }, medium: { l: "中等", c: "bg-amber-100 text-amber-700" }, low: { l: "较弱", c: "bg-muted text-muted-foreground" } };
                        const lv = levelMap[t.level];
                        const Icon = t.icon;
                        return (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border/40">
                            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center shrink-0"><Icon className="h-3 w-3 text-blue-600" /></div>
                            <span className="text-xs font-medium">{t.label}</span>
                            <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${lv.c}`}>{lv.l}</span>
                            <span className="text-[10px] text-muted-foreground flex-1 truncate ml-1">{t.evidence.split("；")[0]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="lg:col-span-6 rounded-xl border border-border/60 bg-card p-4">
                    <SectionTitle icon={Target} title="深层需求" />
                    <div className="space-y-1.5 mt-2">
                      {portrait.deepNeeds.map((n, i) => {
                        const uMap = { urgent: { l: "迫切", c: "bg-red-100 text-red-700" }, normal: { l: "常规", c: "bg-blue-100 text-blue-700" }, latent: { l: "潜在", c: "bg-muted text-muted-foreground" } };
                        const u = uMap[n.urgency];
                        const Icon = n.icon;
                        return (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border/40">
                            <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center shrink-0"><Icon className="h-3 w-3 text-emerald-600" /></div>
                            <span className="px-1 py-0.5 rounded text-[9px] bg-muted text-muted-foreground">{n.category}</span>
                            <span className="text-xs font-medium flex-1 truncate">{n.need}</span>
                            <span className={`px-1 py-0.5 rounded text-[9px] font-medium shrink-0 ${u.c}`}>{u.l}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">{portrait.serviceApproach}</p>
                  </div>
                </div>
              </div>
            );
          })() : (() => {
            const portrait = EC_PORTRAIT;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-5 rounded-xl border border-border/60 bg-card p-4">
                    <SectionTitle icon={Brain} title="客户画像"
                      action={<button onClick={() => setShowPortrait(true)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5"><ExternalLink className="h-3 w-3" />完整画像</button>}
                    />
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
                          <span key={f} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"><strong className="text-primary mr-0.5">{i+1}</strong>{f}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">{portrait.personaDesc}</p>
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
                {/* Behavior Traits + Deep Needs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-6 rounded-xl border border-border/60 bg-card p-4">
                    <SectionTitle icon={Activity} title="行为特征" />
                    <div className="space-y-1.5 mt-2">
                      {portrait.behaviorTraits.slice(0, 4).map((t, i) => {
                        const levelMap = { high: { l: "显著", c: "bg-emerald-100 text-emerald-700" }, medium: { l: "中等", c: "bg-amber-100 text-amber-700" }, low: { l: "较弱", c: "bg-muted text-muted-foreground" } };
                        const lv = levelMap[t.level];
                        const Icon = t.icon;
                        return (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border/40">
                            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center shrink-0"><Icon className="h-3 w-3 text-blue-600" /></div>
                            <span className="text-xs font-medium">{t.label}</span>
                            <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${lv.c}`}>{lv.l}</span>
                            <span className="text-[10px] text-muted-foreground flex-1 truncate ml-1">{t.evidence.split("，")[0]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="lg:col-span-6 rounded-xl border border-border/60 bg-card p-4">
                    <SectionTitle icon={Target} title="深层需求" />
                    <div className="space-y-1.5 mt-2">
                      {portrait.deepNeeds.map((n, i) => {
                        const uMap = { urgent: { l: "迫切", c: "bg-red-100 text-red-700" }, normal: { l: "常规", c: "bg-blue-100 text-blue-700" }, latent: { l: "潜在", c: "bg-muted text-muted-foreground" } };
                        const u = uMap[n.urgency];
                        const Icon = n.icon;
                        return (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border/40">
                            <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center shrink-0"><Icon className="h-3 w-3 text-emerald-600" /></div>
                            <span className="px-1 py-0.5 rounded text-[9px] bg-muted text-muted-foreground">{n.category}</span>
                            <span className="text-xs font-medium flex-1 truncate">{n.need}</span>
                            <span className={`px-1 py-0.5 rounded text-[9px] font-medium shrink-0 ${u.c}`}>{u.l}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">{portrait.serviceApproach}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* ── 智能运营建议 ── */}
        <section id="sec-recommend">
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <SectionTitle icon={Lightbulb} title="智能运营建议" badge="基于用户行为数据分析" />
            <div className="space-y-3 mt-3">
              {(isDesigner ? d.recommendations : ec.recommendations).map((rec, i) => {
                const pBorder: Record<string, string> = { high: "border-l-red-400", medium: "border-l-amber-400", low: "border-l-blue-400" };
                const pLabel: Record<string, { t: string; c: string }> = { high: { t: "高优", c: "bg-red-100 text-red-700" }, medium: { t: "中优", c: "bg-amber-100 text-amber-700" }, low: { t: "低优", c: "bg-blue-100 text-blue-700" } };
                const impactColors: Record<string, string> = { revenue: "text-emerald-600", retention: "text-blue-600", activation: "text-amber-600", referral: "text-violet-600" };
                const impactIcons: Record<string, string> = { revenue: "💰", retention: "🔄", activation: "⚡", referral: "📢" };
                const pl = pLabel[rec.priority];
                const RecIcon = rec.icon;
                return (
                  <div key={i} className={`rounded-lg border border-border/40 border-l-[3px] ${pBorder[rec.priority]} overflow-hidden`}>
                    <div className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                          <RecIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${pl.c}`}>{pl.t}</span>
                            <span className="text-sm font-medium">{rec.title}</span>
                            <span className={`ml-auto text-xs font-semibold ${impactColors[rec.impactType]}`}>
                              {impactIcons[rec.impactType]} {rec.impact}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
                        </div>
                      </div>
                      {/* Confidence + basis */}
                      <div className="flex items-center gap-4 mt-2.5 ml-11">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">置信度</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${rec.confidence >= 80 ? "bg-emerald-500" : rec.confidence >= 60 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${rec.confidence}%` }} />
                          </div>
                          <span className="text-[10px] font-medium">{rec.confidence}%</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-1 truncate">依据: {rec.basis}</span>
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 shrink-0" onClick={() => toast.success("任务已创建")}>{rec.actionLabel}</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 转化分析 ── */}
        <section id="sec-conversion">
          {isDesigner ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
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
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">流失风险</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.conversion.churnRisk >= 50 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${d.conversion.churnRisk}%` }} />
                  </div>
                  <span className="text-xs font-bold text-emerald-600">{d.conversion.churnRisk}%</span>
                </div>
              </div>
              <div className="lg:col-span-7 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={TrendingUp} title="升级路径与复购时间线" />
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
              <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                {ec.conversionPath.stages.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${i === ec.conversionPath.stages.length - 1 ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"}`}>{i + 1}</div>
                    <span className="text-[10px] font-medium mt-1">{s.name}</span>
                    <span className="text-[9px] text-muted-foreground">{s.date}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-3 p-2.5 rounded-lg border border-border/40 bg-muted/20">
                <div className="flex-1">
                  <span className="text-[10px] text-muted-foreground">增购潜力</span>
                  <div className="flex gap-1 mt-0.5">
                    {ec.repurchase.potentialItems.map(item => <span key={item} className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary">{item}</span>)}
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

        {/* ── 带单 (Designer) ── */}
        {isDesigner && (
          <section id="sec-referral">
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
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-3 w-3 text-primary" /></div>
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
          <section id="sec-enterprise">
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

        {/* ── 权益 (Designer) ── */}
        {isDesigner && (
          <section id="sec-entitlement">
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
              <div className="mt-3 pt-3 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground">近30天消耗趋势</span>
                <div className="flex items-end gap-[1px] h-8 mt-1">
                  {d.usageTrend.map((v, i) => <div key={i} className="flex-1 bg-primary/25 rounded-t hover:bg-primary/50 transition-colors" style={{ height: `${v}%` }} />)}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 服务记录 (EC) ── */}
        {!isDesigner && (
          <section id="sec-service">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={FileText} title="服务记录" badge={`${ec.serviceRecords.length}条`} />
              <div className="space-y-2 mt-3">
                {ec.serviceRecords.map(rec => (
                  <div key={rec.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/40">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><FileText className="h-3 w-3 text-primary" /></div>
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
          <section id="sec-behavior">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={MousePointerClick} title="近期行为" />
                <div className="space-y-1.5 mt-2">
                  {d.behaviors.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0"><Sparkles className="h-2.5 w-2.5 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium">{b.event}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">{b.detail}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{b.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={BarChart3} title="功能偏好" />
                <div className="space-y-1.5 mt-2">
                  {d.featureUsage.map((f, i) => (
                    <div key={f.name} className="flex items-center gap-1.5">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${i < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                      <span className="text-[11px] flex-1">{f.name}</span>
                      <div className="w-14 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary/50 rounded-full" style={{ width: `${f.pct}%` }} /></div>
                      <span className="text-[10px] text-muted-foreground w-6 text-right">{f.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-3 rounded-xl border border-border/60 bg-card p-4">
                <SectionTitle icon={Clock} title="活跃时段" />
                <div className="flex items-end gap-[2px] h-16 mt-2">
                  {d.activeHours.map((v, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t hover:bg-primary/50 transition-colors"
                      style={{ height: `${(v / Math.max(...d.activeHours)) * 100}%` }} title={`${i}:00 ${v}次`} />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5"><span>0时</span><span>12时</span><span>23时</span></div>
              </div>
            </div>
          </section>
        )}

        {/* ── 订单 (Designer) ── */}
        {isDesigner && (
          <section id="sec-orders">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={ShoppingBag} title="订单记录" badge={`${d.orders.length}笔 · ¥${d.totalSpent.toLocaleString()}`} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mt-3">
                {d.orders.map(o => (
                  <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40">
                    <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center shrink-0"><ShoppingBag className="h-3.5 w-3.5 text-emerald-600" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{o.package}</div>
                      <div className="text-[10px] text-muted-foreground">{o.createdAt} · {o.payMethod}</div>
                    </div>
                    <span className="text-sm font-semibold">¥{o.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 跟进 & 触达 ── */}
        <section id="sec-follow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <SectionTitle icon={Send} title="触达记录" />
              <div className="space-y-1.5 mt-2">
                {(isDesigner ? d.reachRecords : ec.reachRecords).map(r => {
                  const typeMap: Record<string, string> = { sms: "短信", email: "邮件", in_app: "站内信", wechat: "微信" };
                  const stMap: Record<string, { l: string; c: string }> = {
                    sent: { l: "已发", c: "bg-muted text-muted-foreground" }, opened: { l: "已读", c: "bg-cyan-100 text-cyan-700" },
                    replied: { l: "已复", c: "bg-emerald-100 text-emerald-700" }, converted: { l: "转化", c: "bg-primary/10 text-primary" },
                  };
                  const st = stMap[r.status] || stMap.sent;
                  return (
                    <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg border border-border/40">
                      <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0"><Send className="h-2.5 w-2.5 text-primary" /></div>
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

      <PortraitDialog open={showPortrait} onOpenChange={setShowPortrait} isDesigner={isDesigner} name={isDesigner ? d.name : ec.name} />
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

function InfoItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <p className={`text-xs mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
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

function Badge({ children, color, className: cn }: { children: React.ReactNode; color?: string; className?: string }) {
  const base = "px-1.5 py-0.5 rounded text-[10px] font-medium";
  const c = color === "primary" ? "bg-primary/10 text-primary" : color === "amber" ? "bg-amber-50 text-amber-700" : "";
  return <span className={`${base} ${cn || c}`}>{children}</span>;
}

function CircleGauge({ value, label, color = "primary" }: { value: number; label: string; color?: string }) {
  const pct = Math.round(value);
  const colors: Record<string, { s: string; t: string }> = {
    primary: { s: "stroke-primary", t: "text-primary" },
    emerald: { s: "stroke-emerald-500", t: "text-emerald-600" },
    blue: { s: "stroke-blue-500", t: "text-blue-600" },
    amber: { s: "stroke-amber-500", t: "text-amber-600" },
  };
  const c = colors[color];
  return (
    <div className="text-center">
      <div className="relative w-12 h-12 mx-auto">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" className="stroke-muted" />
          <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" className={c.s} strokeLinecap="round" strokeDasharray={`${pct * 1.26} 126`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className={`text-[10px] font-bold ${c.t}`}>{value}</span></div>
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
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-0.5"><div className={`h-full rounded-full ${bg}`} style={{ width: `${value}%` }} /></div>
      <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function RadarChart({ dimensions }: { dimensions: { name: string; value: number }[] }) {
  const n = dimensions.length;
  const cx = 70, cy = 70, r = 52;
  const pt = (i: number, val: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + (r * val / 100) * Math.cos(a), y: cy + (r * val / 100) * Math.sin(a) };
  };
  return (
    <svg viewBox="0 0 140 140" className="w-full h-full">
      {[25, 50, 75, 100].map(l => (
        <polygon key={l} points={Array.from({ length: n }, (_, i) => { const p = pt(i, l); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" className="stroke-border/30" strokeWidth="0.5" />
      ))}
      {dimensions.map((_, i) => { const p = pt(i, 100); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="stroke-border/20" strokeWidth="0.5" />; })}
      <polygon points={dimensions.map((dd, i) => { const p = pt(i, dd.value); return `${p.x},${p.y}`; }).join(" ")} className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      {dimensions.map((dd, i) => { const p = pt(i, dd.value); return <circle key={`d${i}`} cx={p.x} cy={p.y} r="2" className="fill-primary" />; })}
      {dimensions.map((dd, i) => { const p = pt(i, 125); return <text key={`t${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[7px]">{dd.name}</text>; })}
    </svg>
  );
}
