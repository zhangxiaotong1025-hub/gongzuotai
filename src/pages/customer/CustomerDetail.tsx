import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User, Phone, Building2, Tag, Calendar, Activity, FileText, Gift,
  ShoppingBag, MousePointerClick, MessageSquare, Plus, TrendingUp, TrendingDown,
  Send, Ticket, Clock, Target, Zap, BarChart3, Heart,
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
  id: "des-1", name: "张明", phone: "13800001111",
  lifecycle: "growing" as DesignerLifecycle, cvsScore: 72,
  currentPackage: "专业版", packageExpiry: "2026-09-15", usageRate: 56,
  totalSpent: 18600, registeredAt: "2024-03-15", lastLoginAt: "2026-03-25",
  source: "官网注册", tags: ["高价值", "VIP"],
  designCount: 42, renderCount: 312, loginDays30: 22, featuresUsed: 6, renewalCount: 2,
  remark: "资深室内设计师，擅长现代简约风格",
  // ── 权益账户 ──
  entitlements: [
    { name: "AI设计生成", total: 500, used: 280, unit: "次" },
    { name: "3D渲染", total: 200, used: 112, unit: "次" },
    { name: "4K渲染", total: 50, used: 8, unit: "次" },
    { name: "模型下载", total: 100, used: 45, unit: "个" },
  ],
  // ── 订单记录 ──
  orders: [
    { id: "ord-1", package: "专业版年卡", amount: 9800, status: "completed", createdAt: "2025-09-15" },
    { id: "ord-2", package: "专业版年卡", amount: 8800, status: "completed", createdAt: "2024-09-15" },
    { id: "ord-3", package: "基础版月卡", amount: 98, status: "completed", createdAt: "2024-03-20" },
  ],
  // ── 行为轨迹 ──
  behaviors: [
    { event: "登录", time: "2026-03-25 14:32", detail: "Web端", icon: "login" },
    { event: "AI设计生成", time: "2026-03-25 14:45", detail: "现代简约客厅", icon: "ai" },
    { event: "3D渲染", time: "2026-03-25 15:10", detail: "提交8K渲染任务", icon: "render" },
    { event: "方案导出", time: "2026-03-24 10:20", detail: "导出PDF方案书", icon: "export" },
    { event: "登录", time: "2026-03-24 09:15", detail: "Web端", icon: "login" },
    { event: "模型下载", time: "2026-03-23 16:40", detail: "下载沙发模型x3", icon: "download" },
    { event: "首次使用AI设计", time: "2024-04-02 10:00", detail: "关键里程碑", icon: "milestone" },
    { event: "首次付费", time: "2024-03-20 15:30", detail: "购买基础版月卡 ¥98", icon: "milestone" },
    { event: "注册", time: "2024-03-15 09:00", detail: "官网自主注册", icon: "milestone" },
  ],
  // ── 功能偏好 ──
  featureUsage: [
    { name: "AI设计生成", count: 280, pct: 89 },
    { name: "3D渲染", count: 112, pct: 71 },
    { name: "方案导出", count: 56, pct: 54 },
    { name: "模型下载", count: 45, pct: 38 },
    { name: "4K渲染", count: 8, pct: 19 },
  ],
  // ── 使用趋势 ──
  usageTrend: [85,72,90,68,95,88,76,92,81,70,88,95,82,78,90,85,72,96,80,88,75,92,86,78,90,84,88,76,92,85],
  // ── 生命周期历程 ──
  lifecycleHistory: [
    { stage: "注册期", date: "2024-03-15", note: "官网自主注册" },
    { stage: "激活期", date: "2024-03-20", note: "购买基础版月卡" },
    { stage: "成长期", date: "2024-06-01", note: "使用率超过30%" },
  ],
  // ── 预警 ──
  alerts: [
    { type: "low_usage", detail: "4K渲染使用率仅16%", level: "yellow" },
  ],
  // ── 触达记录 ──
  reachRecords: [
    { id: "r1", type: "sms", campaign: "春季续费优惠活动", content: "尊敬的张明，您的专业版即将到期...", status: "opened", sentAt: "2026-03-20", openedAt: "2026-03-20" },
    { id: "r2", type: "in_app", campaign: "新功能上线通知", content: "AI设计2.0全新升级，快来体验", status: "converted", sentAt: "2026-02-15", openedAt: "2026-02-15" },
    { id: "r3", type: "email", campaign: "", content: "客户成功经理主动联系，了解使用情况", status: "replied", sentAt: "2026-01-10", openedAt: "2026-01-10" },
  ],
};

const MOCK_EC = {
  id: "ec-1", name: "李女士", phone: "13900002222",
  lifecycle: "serving" as const, followStatus: "won" as const,
  intentLevel: "high" as const,
  sourceEnterprise: "欧派家居集团", assignedStaff: "王设计师",
  createdAt: "2025-08-20", lastFollowAt: "2026-03-15",
  tags: ["已签约", "装修中"], remark: "120平三室两厅全屋定制，预算15万",
  address: "上海市浦东新区XX路XX号", houseType: "三室两厅", area: "120㎡", budget: "15万",
  linkedEnterprises: [
    { id: "ent-1", name: "欧派家居集团", type: "品牌商", staff: "王设计师", followStatus: "won" as const, createdAt: "2025-08-20", serviceCount: 5 },
    { id: "ent-2", name: "索菲亚家居", type: "品牌商", staff: "李顾问", followStatus: "following" as const, createdAt: "2025-10-15", serviceCount: 1 },
  ],
  serviceRecords: [
    { id: "s1", enterprise: "欧派家居集团", type: "量房", date: "2026-03-15", staff: "王设计师", note: "完成量房，厨房有特殊布局需求", entitlement: "3D渲染 x2" },
    { id: "s2", enterprise: "欧派家居集团", type: "出方案", date: "2026-03-10", staff: "王设计师", note: "出具3套方案", entitlement: "AI设计 x3, 3D渲染 x6" },
    { id: "s3", enterprise: "索菲亚家居", type: "初次接触", date: "2025-10-20", staff: "李顾问", note: "客户咨询卧室衣柜", entitlement: "" },
  ],
  lifecycleHistory: [
    { stage: "新录入", date: "2025-08-20", note: "欧派家居集团录入" },
    { stage: "跟进中", date: "2025-09-01", note: "首次电话沟通" },
    { stage: "已成交", date: "2025-11-15", note: "签订全屋定制合同" },
    { stage: "服务中", date: "2025-12-01", note: "进入施工阶段" },
  ],
  alerts: [],
  reachRecords: [
    { id: "r1", type: "wechat", campaign: "", content: "微信发送效果图确认", status: "replied", sentAt: "2026-03-12", openedAt: "2026-03-12" },
  ],
};

/* ══════════════════════════════════════════════
   TABS
   ══════════════════════════════════════════════ */
const TABS_DESIGNER = [
  { key: "overview", label: "客户画像", icon: User },
  { key: "entitlement", label: "权益账户", icon: Gift },
  { key: "behavior", label: "行为轨迹", icon: MousePointerClick },
  { key: "orders", label: "订单记录", icon: ShoppingBag },
  { key: "follow", label: "跟进记录", icon: MessageSquare },
  { key: "reach", label: "触达记录", icon: Send },
];

const TABS_EC = [
  { key: "overview", label: "客户画像", icon: User },
  { key: "enterprise", label: "关联企业", icon: Building2 },
  { key: "service", label: "服务记录", icon: FileText },
  { key: "follow", label: "跟进记录", icon: MessageSquare },
  { key: "reach", label: "触达记录", icon: Send },
];

/* ══════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════ */
export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesigner = !id?.startsWith("ec");
  const tabs = isDesigner ? TABS_DESIGNER : TABS_EC;
  const [activeTab, setActiveTab] = useState("overview");
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
        backLabel={isDesigner ? "个人设计师" : "企业下游客户"}
        backPath={isDesigner ? "/customer/designer" : "/customer/end-customer"}
        currentName={isDesigner ? d.name : ec.name}
        onEdit={() => navigate(`/customer/create?mode=edit&id=${id}&type=${isDesigner ? "designer" : "end_customer"}`)}
        statusToggle={{ currentActive: true, onToggle: () => toast.success("状态已切换") }}
      />

      {/* Tab Nav */}
      <div className="flex items-center gap-0.5 mt-4 border-b border-border/60 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">

        {/* ═══ TAB: 客户画像 (Overview) ═══ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1: Profile + Lifecycle */}
            <div className="space-y-5">
              {/* Profile */}
              <Card>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold">{isDesigner ? d.name : ec.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${lcInfo.color}`}>{lcInfo.label}</span>
                      {!isDesigner && <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${FOLLOW_STATUS_MAP[ec.followStatus].color}`}>{FOLLOW_STATUS_MAP[ec.followStatus].label}</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 border-t border-border/40 pt-3">
                  <InfoRow icon={Phone} label="手机号" value={isDesigner ? d.phone : ec.phone} mono />
                  {isDesigner ? (
                    <>
                      <InfoRow icon={Calendar} label="注册时间" value={d.registeredAt} />
                      <InfoRow icon={Activity} label="最后登录" value={d.lastLoginAt} />
                      <InfoRow icon={Gift} label="来源渠道" value={d.source} />
                      <InfoRow icon={ShoppingBag} label="当前套餐" value={`${d.currentPackage} · 到期 ${d.packageExpiry}`} />
                    </>
                  ) : (
                    <>
                      <InfoRow icon={Building2} label="所属企业" value={ec.sourceEnterprise} />
                      <InfoRow icon={User} label="负责人" value={ec.assignedStaff} />
                      <InfoRow icon={Calendar} label="录入时间" value={ec.createdAt} />
                      <InfoRow icon={Activity} label="最近跟进" value={ec.lastFollowAt} />
                    </>
                  )}
                </div>
              </Card>

              {/* Tags */}
              <Card>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />客户标签</h4>
                <div className="flex flex-wrap gap-2">
                  {(isDesigner ? d.tags : ec.tags).map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">{t}</span>
                  ))}
                </div>
              </Card>

              {/* Remark */}
              {(isDesigner ? d.remark : ec.remark) && (
                <Card>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />备注</h4>
                  <p className="text-sm text-muted-foreground">{isDesigner ? d.remark : ec.remark}</p>
                </Card>
              )}

              {/* EC: House Info */}
              {!isDesigner && (
                <Card>
                  <h4 className="text-sm font-medium mb-3">房屋信息</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-xs text-muted-foreground">地址</span><p className="mt-0.5">{ec.address}</p></div>
                    <div><span className="text-xs text-muted-foreground">户型</span><p className="mt-0.5">{ec.houseType}</p></div>
                    <div><span className="text-xs text-muted-foreground">面积</span><p className="mt-0.5">{ec.area}</p></div>
                    <div><span className="text-xs text-muted-foreground">预算</span><p className="mt-0.5">{ec.budget}</p></div>
                  </div>
                </Card>
              )}
            </div>

            {/* Col 2-3: Key Metrics + Lifecycle Journey + Alerts */}
            <div className="lg:col-span-2 space-y-5">
              {/* Key Metrics (Designer) */}
              {isDesigner && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <ScoreCard label="客户价值 CVS" value={d.cvsScore} max={100} grade={d.cvsScore >= 80 ? "🏆 高价值" : d.cvsScore >= 50 ? "⭐ 中价值" : "📈 待培育"} color={d.cvsScore >= 80 ? "text-emerald-600" : d.cvsScore >= 50 ? "text-primary" : "text-amber-600"} />
                    <ScoreCard label="权益使用率" value={d.usageRate} max={100} suffix="%" color={d.usageRate >= 70 ? "text-emerald-600" : d.usageRate >= 30 ? "text-primary" : "text-amber-600"} />
                    <ScoreCard label="累计消费" value={d.totalSpent} prefix="¥" color="text-foreground" />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <MiniStat label="设计方案" value={d.designCount} />
                    <MiniStat label="渲染次数" value={d.renderCount} />
                    <MiniStat label="30天登录" value={`${d.loginDays30}天`} />
                    <MiniStat label="续费次数" value={d.renewalCount} />
                  </div>
                </>
              )}

              {/* Lifecycle Journey */}
              <Card>
                <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />生命周期历程
                </h4>
                <div className="flex items-center gap-0 overflow-x-auto pb-2">
                  {(isDesigner ? d.lifecycleHistory : ec.lifecycleHistory).map((h, i, arr) => (
                    <div key={i} className="flex items-center">
                      <div className="flex flex-col items-center min-w-[100px]">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${i === arr.length - 1 ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"}`}>
                          {i + 1}
                        </div>
                        <div className="text-xs font-medium mt-1.5">{h.stage}</div>
                        <div className="text-[10px] text-muted-foreground">{h.date}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[90px] text-center">{h.note}</div>
                      </div>
                      {i < arr.length - 1 && <div className="w-8 h-px bg-primary/30 shrink-0" />}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Active Alerts */}
              {(isDesigner ? d.alerts : ec.alerts).length > 0 && (
                <Card className="border-amber-200">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700">运营预警</span>
                  </h4>
                  <div className="space-y-2">
                    {(isDesigner ? d.alerts : ec.alerts).map((a, i) => {
                      const info = ALERT_TYPE_MAP[a.type];
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                          <span className="text-base">{info?.icon || "⚠️"}</span>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{info?.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">{a.detail}</span>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.success("已标记处理")}>处理</Button>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* EC: Quick linked enterprises overview */}
              {!isDesigner && (
                <Card>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />关联企业概览
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ec.linkedEnterprises.map(ent => (
                      <div key={ent.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{ent.name}</div>
                          <div className="text-xs text-muted-foreground">{ent.type} · {ent.staff} · {ent.serviceCount}次服务</div>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${FOLLOW_STATUS_MAP[ent.followStatus].color}`}>{FOLLOW_STATUS_MAP[ent.followStatus].label}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB: 权益账户 (Designer only) ═══ */}
        {activeTab === "entitlement" && isDesigner && (
          <div className="space-y-5">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium">权益配额</h4>
                <span className="text-xs text-muted-foreground">{d.currentPackage} · 到期 {d.packageExpiry}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {d.entitlements.map((e, i) => {
                  const rate = Math.round((e.used / e.total) * 100);
                  return (
                    <div key={i} className="p-4 rounded-lg border border-border/40">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{e.name}</span>
                        <span className="text-xs text-muted-foreground">{e.used}/{e.total} {e.unit}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${rate >= 80 ? "bg-amber-500" : rate >= 50 ? "bg-primary" : "bg-emerald-500"}`} style={{ width: `${rate}%` }} />
                      </div>
                      <div className="text-right text-[11px] text-muted-foreground mt-1">{rate}%</div>
                    </div>
                  );
                })}
              </div>
            </Card>
            {/* Usage Trend */}
            <Card>
              <h4 className="text-sm font-medium mb-3">近30天消耗趋势</h4>
              <div className="flex items-end gap-[3px] h-20">
                {d.usageTrend.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t bg-primary/20" style={{ height: `${v}%` }}>
                    <div className="w-full h-full bg-primary/60 rounded-t" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>30天前</span><span>今天</span></div>
            </Card>
          </div>
        )}

        {/* ═══ TAB: 行为轨迹 (Designer only) ═══ */}
        {activeTab === "behavior" && isDesigner && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <h4 className="text-sm font-medium mb-4">行为时间线</h4>
                <div className="relative pl-6">
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />
                  {d.behaviors.map((b, i) => (
                    <div key={i} className="relative pb-5 last:pb-0">
                      <div className={`absolute left-[-15px] top-1.5 w-3 h-3 rounded-full border-2 bg-card ${b.icon === "milestone" ? "border-amber-500" : "border-primary"}`} />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${b.icon === "milestone" ? "text-amber-700" : ""}`}>{b.event}</span>
                          {b.icon === "milestone" && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700">里程碑</span>}
                          <span className="text-[11px] text-muted-foreground ml-auto">{b.time}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{b.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-5">
              <Card>
                <h4 className="text-sm font-medium mb-3">功能偏好</h4>
                <div className="space-y-3">
                  {d.featureUsage.map((f, i) => (
                    <div key={f.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{f.name}</span>
                        <span className="text-muted-foreground">{f.count}次 · {f.pct}%用户</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${i < 2 ? "bg-primary" : "bg-primary/40"}`} style={{ width: `${f.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h4 className="text-sm font-medium mb-2">CVS 评分明细</h4>
                <div className="space-y-2">
                  {[
                    { dim: "权益使用率", weight: 30, score: Math.round(d.usageRate * 0.3) },
                    { dim: "登录活跃度", weight: 20, score: Math.round((d.loginDays30 / 30) * 100 * 0.2) },
                    { dim: "消费金额", weight: 25, score: Math.min(25, Math.round(d.totalSpent / 2000)) },
                    { dim: "续费次数", weight: 15, score: Math.min(15, d.renewalCount * 5) },
                    { dim: "功能深度", weight: 10, score: Math.round((d.featuresUsed / 8) * 10) },
                  ].map(s => (
                    <div key={s.dim} className="flex items-center gap-2 text-xs">
                      <span className="min-w-[70px] text-muted-foreground">{s.dim}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(s.score / s.weight) * 100}%` }} />
                      </div>
                      <span className="font-medium min-w-[30px] text-right">{s.score}/{s.weight}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border/40 flex justify-between text-sm">
                    <span className="text-muted-foreground">总分</span>
                    <span className="font-bold text-primary">{d.cvsScore}/100</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ═══ TAB: 订单记录 (Designer only) ═══ */}
        {activeTab === "orders" && isDesigner && (
          <Card>
            <h4 className="text-sm font-medium mb-4">历史订单</h4>
            <div className="space-y-3">
              {d.orders.map(o => (
                <div key={o.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/40">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <div><div className="text-sm font-medium">{o.package}</div><div className="text-xs text-muted-foreground">{o.createdAt}</div></div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">¥{o.amount.toLocaleString()}</div>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">已完成</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ═══ TAB: 关联企业 (EC only) ═══ */}
        {activeTab === "enterprise" && !isDesigner && (
          <Card>
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />关联企业
              <span className="text-xs text-muted-foreground">（同一客户可被多个企业录入服务）</span>
            </h4>
            <div className="space-y-3">
              {ec.linkedEnterprises.map(ent => (
                <div key={ent.id} className="flex items-center justify-between py-4 px-4 rounded-lg border border-border/40 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="text-sm font-medium">{ent.name}</div>
                      <div className="text-xs text-muted-foreground">{ent.type} · 负责人: {ent.staff}</div>
                      <div className="text-xs text-muted-foreground">录入于 {ent.createdAt} · {ent.serviceCount} 次服务</div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${FOLLOW_STATUS_MAP[ent.followStatus].color}`}>{FOLLOW_STATUS_MAP[ent.followStatus].label}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ═══ TAB: 服务记录 (EC only) ═══ */}
        {activeTab === "service" && !isDesigner && (
          <Card>
            <h4 className="text-sm font-medium mb-4">服务记录</h4>
            <div className="relative pl-6">
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />
              {ec.serviceRecords.map(rec => (
                <div key={rec.id} className="relative pb-6 last:pb-0">
                  <div className="absolute left-[-15px] top-1.5 w-3 h-3 rounded-full border-2 border-primary bg-card" />
                  <div className="ml-3 p-3 rounded-lg border border-border/40 bg-card">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{rec.type}</span>
                      <span className="px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground">{rec.enterprise}</span>
                      <span className="text-[11px] text-muted-foreground ml-auto">{rec.date}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{rec.staff} · {rec.note}</div>
                    {rec.entitlement && <div className="text-[11px] text-primary mt-1">消耗: {rec.entitlement}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ═══ TAB: 跟进记录 (Shared) ═══ */}
        {activeTab === "follow" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">跟进记录</h4>
              <button onClick={() => setShowAddFollow(true)} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"><Plus className="h-4 w-4" />新增跟进</button>
            </div>
            {showAddFollow && (
              <Card>
                <h4 className="text-sm font-medium mb-3">新增跟进记录</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">跟进方式</label>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(FOLLOW_TYPES_MAP).map(([k, v]) => (
                        <button key={k} onClick={() => setNewFollow(p => ({ ...p, type: k }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${newFollow.type === k ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}
                        >{v}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">跟进内容</label>
                    <textarea className="w-full h-20 px-3 py-2 rounded-lg border border-border/60 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="请输入跟进内容..." value={newFollow.content} onChange={e => setNewFollow(p => ({ ...p, content: e.target.value }))} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAddFollow(false)}>取消</Button>
                    <Button size="sm" onClick={handleAddFollow}>提交</Button>
                  </div>
                </div>
              </Card>
            )}
            <div className="relative pl-6">
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />
              {followRecords.map(r => (
                <div key={r.id} className="relative pb-5 last:pb-0">
                  <div className="absolute left-[-15px] top-1.5 w-3 h-3 rounded-full border-2 border-primary bg-card" />
                  <div className="ml-3 p-4 rounded-lg border border-border/40 bg-card">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[11px] bg-primary/10 text-primary">{FOLLOW_TYPES_MAP[r.type] || r.type}</span>
                      {r.enterprise && <span className="text-[11px] text-muted-foreground">{r.enterprise}</span>}
                      <span className="text-[11px] text-muted-foreground ml-auto">{r.createdAt}</span>
                    </div>
                    <p className="text-sm mt-1">{r.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span>操作人: {r.operator}</span>
                      {r.feedback && <span>反馈: {r.feedback === "positive" ? "👍积极" : r.feedback === "neutral" ? "😐一般" : "👎消极"}</span>}
                      {r.nextFollowAt && <span>下次跟进: {r.nextFollowAt}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB: 触达记录 (Shared) ═══ */}
        {activeTab === "reach" && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">触达记录</h4>
            {(isDesigner ? d.reachRecords : ec.reachRecords).length === 0 ? (
              <Card className="text-center py-10">
                <Send className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">暂无触达记录</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {(isDesigner ? d.reachRecords : ec.reachRecords).map(r => {
                  const typeMap: Record<string, string> = { sms: "短信", email: "邮件", in_app: "站内信", phone: "电话", wechat: "微信" };
                  const statusMap: Record<string, { label: string; color: string }> = {
                    sent: { label: "已发送", color: "bg-muted text-muted-foreground" },
                    delivered: { label: "已送达", color: "bg-blue-100 text-blue-700" },
                    opened: { label: "已打开", color: "bg-cyan-100 text-cyan-700" },
                    replied: { label: "已回复", color: "bg-emerald-100 text-emerald-700" },
                    converted: { label: "已转化", color: "bg-primary/10 text-primary" },
                  };
                  const st = statusMap[r.status] || statusMap.sent;
                  return (
                    <div key={r.id} className="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-card">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Send className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{typeMap[r.type] || r.type}</span>
                          {r.campaign && <span className="text-xs text-primary">{r.campaign}</span>}
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ml-auto ${st.color}`}>{st.label}</span>
                        </div>
                        <p className="text-sm">{r.content}</p>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          发送: {r.sentAt}
                          {r.openedAt && <span className="ml-3">打开: {r.openedAt}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Shared UI ── */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border/60 bg-card p-5 ${className || ""}`}>{children}</div>;
}

function InfoRow({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div><div className="text-xs text-muted-foreground mb-0.5">{label}</div><div className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</div></div>
    </div>
  );
}

function ScoreCard({ label, value, max, prefix, suffix, color, grade }: { label: string; value: number; max?: number; prefix?: string; suffix?: string; color: string; grade?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{prefix}{value > 999 ? value.toLocaleString() : value}{suffix}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      {grade && <div className="text-[11px] mt-1">{grade}</div>}
      {max && <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(value / max) * 100}%` }} /></div>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
