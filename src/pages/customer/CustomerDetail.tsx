import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User, Phone, Building2, Tag, Calendar, Activity, FileText, Gift,
  ShoppingBag, MousePointerClick, MessageSquare, Plus, TrendingUp, TrendingDown,
} from "lucide-react";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { toast } from "sonner";
import {
  DESIGNER_LIFECYCLE_MAP, END_CUSTOMER_LIFECYCLE_MAP, FOLLOW_STATUS_MAP,
  FOLLOW_TYPES_MAP, generateFollowRecords, type FollowRecord,
} from "@/data/customer";

/* ── Mock Designer Detail ── */
const MOCK_DESIGNER = {
  id: "des-1", name: "张明", phone: "13800001111",
  lifecycle: "growing" as const, cvsScore: 72,
  currentPackage: "专业版", packageExpiry: "2026-09-15", usageRate: 56,
  totalSpent: 18600, registeredAt: "2024-03-15", lastLoginAt: "2026-03-25",
  source: "官网注册", tags: ["高价值", "VIP"],
  designCount: 42, renderCount: 312, loginDays30: 22, featuresUsed: 6, renewalCount: 2,
  remark: "资深室内设计师，擅长现代简约风格",
  entitlements: [
    { name: "AI设计生成", total: 500, used: 280, unit: "次" },
    { name: "3D渲染", total: 200, used: 112, unit: "次" },
    { name: "4K渲染", total: 50, used: 8, unit: "次" },
    { name: "模型下载", total: 100, used: 45, unit: "个" },
  ],
  orders: [
    { id: "ord-1", package: "专业版年卡", amount: 9800, status: "已完成", createdAt: "2025-09-15" },
    { id: "ord-2", package: "专业版年卡", amount: 8800, status: "已完成", createdAt: "2024-09-15" },
    { id: "ord-3", package: "基础版月卡", amount: 98, status: "已完成", createdAt: "2024-03-20" },
  ],
  behaviors: [
    { event: "登录", time: "2026-03-25 14:32", detail: "Web端" },
    { event: "AI设计生成", time: "2026-03-25 14:45", detail: "现代简约客厅" },
    { event: "3D渲染", time: "2026-03-25 15:10", detail: "提交8K渲染任务" },
    { event: "方案导出", time: "2026-03-24 10:20", detail: "导出PDF方案书" },
    { event: "登录", time: "2026-03-24 09:15", detail: "Web端" },
    { event: "模型下载", time: "2026-03-23 16:40", detail: "下载沙发模型x3" },
  ],
  usageTrend: [85, 72, 90, 68, 95, 88, 76, 92, 81, 70, 88, 95, 82, 78, 90, 85, 72, 96, 80, 88, 75, 92, 86, 78, 90, 84, 88, 76, 92, 85],
};

/* ── Mock End Customer Detail ── */
const MOCK_EC = {
  id: "ec-1", name: "李女士", phone: "13900002222",
  lifecycle: "serving" as const, followStatus: "won" as const,
  intentLevel: "high" as const,
  sourceEnterprise: "欧派家居集团", assignedStaff: "王设计师",
  createdAt: "2025-08-20", lastFollowAt: "2026-03-15",
  tags: ["已签约", "装修中"], remark: "120平三室两厅全屋定制，预算15万",
  address: "上海市浦东新区XX路XX号", houseType: "三室两厅", area: "120㎡", budget: "15万",
  linkedEnterprises: [
    { id: "ent-1", name: "欧派家居集团", type: "品牌商", staff: "王设计师", followStatus: "won" as const, createdAt: "2025-08-20" },
    { id: "ent-2", name: "索菲亚家居", type: "品牌商", staff: "李顾问", followStatus: "following" as const, createdAt: "2025-10-15" },
  ],
  serviceRecords: [
    { id: "s1", enterprise: "欧派家居集团", type: "量房", date: "2026-03-15", staff: "王设计师", note: "完成量房，厨房有特殊布局需求" },
    { id: "s2", enterprise: "欧派家居集团", type: "出方案", date: "2026-03-10", staff: "王设计师", note: "出具3套方案" },
    { id: "s3", enterprise: "索菲亚家居", type: "初次接触", date: "2025-10-20", staff: "李顾问", note: "客户咨询卧室衣柜" },
  ],
};

const TABS_DESIGNER = ["基本信息", "权益账户", "订单记录", "行为轨迹", "跟进记录"];
const TABS_EC = ["基本信息", "关联企业", "服务记录", "跟进记录"];

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesigner = !id?.startsWith("ec");
  const tabs = isDesigner ? TABS_DESIGNER : TABS_EC;
  const [activeTab, setActiveTab] = useState(0);
  const [followRecords] = useState<FollowRecord[]>(generateFollowRecords(6));
  const [showAddFollow, setShowAddFollow] = useState(false);
  const [newFollow, setNewFollow] = useState({ type: "phone", content: "" });
  const d = MOCK_DESIGNER;
  const ec = MOCK_EC;
  const backPath = isDesigner ? "/customer/designer" : "/customer/end-customer";

  const handleAddFollow = () => {
    if (!newFollow.content.trim()) return;
    toast.success("跟进记录已添加");
    setShowAddFollow(false);
    setNewFollow({ type: "phone", content: "" });
  };

  const lcMap = isDesigner ? DESIGNER_LIFECYCLE_MAP : END_CUSTOMER_LIFECYCLE_MAP;
  const lcKey = isDesigner ? d.lifecycle : ec.lifecycle;
  const lcInfo = lcMap[lcKey as keyof typeof lcMap];

  return (
    <div>
      <DetailActionBar
        backLabel={isDesigner ? "个人设计师" : "企业下游客户"}
        backPath={backPath}
        currentName={isDesigner ? d.name : ec.name}
        onEdit={() => navigate(`/customer/create?mode=edit&id=${id}&type=${isDesigner ? "designer" : "end_customer"}`)}
        statusToggle={{ currentActive: true, onToggle: () => toast.success("状态已切换") }}
      />

      {/* Tab Nav */}
      <div className="flex items-center gap-1 mt-4 border-b border-border/60">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{t}</button>
        ))}
      </div>

      <div className="mt-6">
        {/* ── DESIGNER TABS ── */}
        {isDesigner && activeTab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-5">
              <Card>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h3 className="text-base font-semibold">{d.name}</h3>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${lcInfo.color}`}>{lcInfo.label}</span>
                  </div>
                </div>
                <div className="space-y-1 border-t border-border/40 pt-3">
                  <InfoRow icon={Phone} label="手机号" value={d.phone} mono />
                  <InfoRow icon={Calendar} label="注册时间" value={d.registeredAt} />
                  <InfoRow icon={Activity} label="最后登录" value={d.lastLoginAt} />
                  <InfoRow icon={Gift} label="来源渠道" value={d.source} />
                </div>
              </Card>
              <Card>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />标签</h4>
                <div className="flex flex-wrap gap-2">{d.tags.map((t, i) => <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">{t}</span>)}</div>
              </Card>
              {d.remark && <Card><h4 className="text-sm font-medium mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />备注</h4><p className="text-sm text-muted-foreground">{d.remark}</p></Card>}
            </div>
            <div className="lg:col-span-2 space-y-5">
              {/* CVS Score */}
              <div className="grid grid-cols-3 gap-4">
                <ScoreCard label="客户价值评分" value={d.cvsScore} max={100} color={d.cvsScore >= 80 ? "text-emerald-600" : d.cvsScore >= 50 ? "text-primary" : "text-amber-600"} />
                <ScoreCard label="权益使用率" value={d.usageRate} max={100} suffix="%" color={d.usageRate >= 70 ? "text-emerald-600" : d.usageRate >= 30 ? "text-primary" : "text-amber-600"} />
                <ScoreCard label="累计消费" value={d.totalSpent} prefix="¥" color="text-foreground" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <MiniStat label="设计方案" value={d.designCount} />
                <MiniStat label="渲染次数" value={d.renderCount} />
                <MiniStat label="30天登录" value={`${d.loginDays30}天`} />
                <MiniStat label="续费次数" value={d.renewalCount} />
              </div>
            </div>
          </div>
        )}

        {isDesigner && activeTab === 1 && (
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium">权益账户总览</h4>
                <span className="text-xs text-muted-foreground">套餐: {d.currentPackage} · 到期 {d.packageExpiry}</span>
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
          </div>
        )}

        {isDesigner && activeTab === 2 && (
          <Card>
            <h4 className="text-sm font-medium mb-4">订单记录</h4>
            <div className="space-y-3">
              {d.orders.map(o => (
                <div key={o.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/40">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <div><div className="text-sm font-medium">{o.package}</div><div className="text-xs text-muted-foreground">{o.createdAt}</div></div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">¥{o.amount.toLocaleString()}</div>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {isDesigner && activeTab === 3 && (
          <div className="space-y-5">
            <Card>
              <h4 className="text-sm font-medium mb-4">近30天权益消耗趋势</h4>
              <div className="flex items-end gap-[3px] h-20">
                {d.usageTrend.map((v, i) => (
                  <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${v}%` }} title={`第${i+1}天: ${v}`}>
                    <div className="w-full bg-primary rounded-t" style={{ height: `${Math.min(v, 100)}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>30天前</span><span>今天</span></div>
            </Card>
            <Card>
              <h4 className="text-sm font-medium mb-4">行为轨迹</h4>
              <div className="relative pl-6">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />
                {d.behaviors.map((b, i) => (
                  <div key={i} className="relative pb-5 last:pb-0">
                    <div className="absolute left-[-15px] top-1.5 w-3 h-3 rounded-full border-2 border-primary bg-card" />
                    <div className="ml-3">
                      <div className="flex items-center gap-2"><span className="text-sm font-medium">{b.event}</span><span className="text-[11px] text-muted-foreground">{b.time}</span></div>
                      <div className="text-xs text-muted-foreground mt-0.5">{b.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Follow Records (shared between designer tab 4 and EC tab 3) */}
        {((isDesigner && activeTab === 4) || (!isDesigner && activeTab === 3)) && (
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
                    <button onClick={() => setShowAddFollow(false)} className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">取消</button>
                    <button onClick={handleAddFollow} className="px-4 py-1.5 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90">提交</button>
                  </div>
                </div>
              </Card>
            )}
            <div className="relative pl-6">
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />
              {followRecords.map(r => (
                <div key={r.id} className="relative pb-6 last:pb-0">
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

        {/* ── END CUSTOMER TABS ── */}
        {!isDesigner && activeTab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-5">
              <Card>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h3 className="text-base font-semibold">{ec.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${lcInfo.color}`}>{lcInfo.label}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${FOLLOW_STATUS_MAP[ec.followStatus].color}`}>{FOLLOW_STATUS_MAP[ec.followStatus].label}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 border-t border-border/40 pt-3">
                  <InfoRow icon={Phone} label="手机号" value={ec.phone} mono />
                  <InfoRow icon={Building2} label="所属企业" value={ec.sourceEnterprise} />
                  <InfoRow icon={User} label="负责人" value={ec.assignedStaff} />
                  <InfoRow icon={Calendar} label="录入时间" value={ec.createdAt} />
                  <InfoRow icon={Activity} label="最近跟进" value={ec.lastFollowAt} />
                </div>
              </Card>
              <Card>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />标签</h4>
                <div className="flex flex-wrap gap-2">{ec.tags.map((t, i) => <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">{t}</span>)}</div>
              </Card>
              {ec.remark && <Card><h4 className="text-sm font-medium mb-2">备注</h4><p className="text-sm text-muted-foreground">{ec.remark}</p></Card>}
            </div>
            <div className="lg:col-span-2">
              <Card>
                <h4 className="text-sm font-medium mb-3">房屋信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">地址</span><p>{ec.address}</p></div>
                  <div><span className="text-muted-foreground">户型</span><p>{ec.houseType}</p></div>
                  <div><span className="text-muted-foreground">面积</span><p>{ec.area}</p></div>
                  <div><span className="text-muted-foreground">预算</span><p>{ec.budget}</p></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {!isDesigner && activeTab === 1 && (
          <Card>
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" />关联企业 <span className="text-xs text-muted-foreground">（同一客户可被多个企业录入服务）</span></h4>
            <div className="space-y-3">
              {ec.linkedEnterprises.map(ent => (
                <div key={ent.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/40 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="h-4 w-4 text-primary" /></div>
                    <div>
                      <div className="text-sm font-medium">{ent.name}</div>
                      <div className="text-xs text-muted-foreground">{ent.type} · 负责人: {ent.staff}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${FOLLOW_STATUS_MAP[ent.followStatus].color}`}>{FOLLOW_STATUS_MAP[ent.followStatus].label}</span>
                    <div className="text-xs text-muted-foreground mt-1">录入于 {ent.createdAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {!isDesigner && activeTab === 2 && (
          <Card>
            <h4 className="text-sm font-medium mb-4">服务记录</h4>
            <div className="relative pl-6">
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />
              {ec.serviceRecords.map(rec => (
                <div key={rec.id} className="relative pb-6 last:pb-0">
                  <div className="absolute left-[-15px] top-1.5 w-3 h-3 rounded-full border-2 border-primary bg-card" />
                  <div className="ml-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{rec.type}</span>
                      <span className="px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground">{rec.enterprise}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{rec.date} · {rec.staff}</div>
                    <p className="text-sm text-muted-foreground">{rec.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── Shared UI Components ── */
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

function ScoreCard({ label, value, max, prefix, suffix, color }: { label: string; value: number; max?: number; prefix?: string; suffix?: string; color: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{prefix}{typeof value === "number" && value > 999 ? value.toLocaleString() : value}{suffix}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      {max && <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(value / max) * 100}%` }} /></div>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
