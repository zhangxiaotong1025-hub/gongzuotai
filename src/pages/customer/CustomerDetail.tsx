import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, Phone, Building2, Tag, Calendar, Activity, FileText, Edit } from "lucide-react";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { toast } from "sonner";

/* ── Mock ── */
const MOCK_DESIGNER = {
  id: "des-1",
  type: "designer" as const,
  name: "张明",
  phone: "13800001111",
  status: "active" as "active" | "inactive",
  tags: ["高意向", "VIP"],
  source: "平台注册",
  registeredAt: "2024-03-15",
  lastActiveAt: "2025-06-20",
  designCount: 28,
  renderCount: 156,
  remark: "资深室内设计师，擅长现代简约风格",
  recentDesigns: [
    { id: "d1", name: "现代简约客厅方案", date: "2025-06-18", renders: 12 },
    { id: "d2", name: "北欧风卧室方案", date: "2025-06-10", renders: 8 },
    { id: "d3", name: "新中式书房方案", date: "2025-05-28", renders: 5 },
    { id: "d4", name: "轻奢风餐厅方案", date: "2025-05-15", renders: 10 },
  ],
};

const MOCK_CUSTOMER = {
  id: "cust-1",
  type: "enterprise_customer" as const,
  name: "李女士",
  phone: "13900002222",
  status: "active" as "active" | "inactive",
  tags: ["已签约", "装修中"],
  source: "欧派家居集团",
  sourceEnterprise: "欧派家居集团",
  createdAt: "2024-08-20",
  lastServiceAt: "2025-06-15",
  remark: "120平三室两厅全屋定制，预算15万",
  address: "上海市浦东新区XX路XX号",
  budget: "15万",
  houseType: "三室两厅",
  area: "120㎡",
  serviceRecords: [
    { id: "s1", enterprise: "欧派家居集团", type: "量房", date: "2025-06-15", staff: "王设计师", note: "已完成量房，客户对厨房布局有特殊要求" },
    { id: "s2", enterprise: "欧派家居集团", type: "出方案", date: "2025-06-10", staff: "王设计师", note: "出具了3套方案供客户选择" },
    { id: "s3", enterprise: "索菲亚家居", type: "初次接触", date: "2025-05-20", staff: "李顾问", note: "客户咨询卧室衣柜定制" },
  ],
  linkedEnterprises: [
    { id: "ent-1", name: "欧派家居集团", type: "品牌商", serviceCount: 5, lastService: "2025-06-15" },
    { id: "ent-2", name: "索菲亚家居", type: "品牌商", serviceCount: 1, lastService: "2025-05-20" },
  ],
};

function InfoRow({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
        <div className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
    </div>
  );
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesigner = id?.startsWith("des");
  const data = isDesigner ? MOCK_DESIGNER : MOCK_CUSTOMER;
  const [status, setStatus] = useState(data.status);

  const toggleStatus = () => {
    const next = status === "active" ? "inactive" : "active";
    setStatus(next);
    toast.success(`已${next === "active" ? "启用" : "停用"}客户`);
  };

  return (
    <div>
      <DetailActionBar
        backLabel="客户管理"
        backPath="/customer"
        currentName={data.name}
        onEdit={() => navigate(`/customer/create?mode=edit&id=${id}&type=${data.type}`)}
        statusToggle={{
          currentActive: status === "active",
          onToggle: toggleStatus,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold">{data.name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"
                }`}>
                  {status === "active" ? "启用" : "停用"}
                </span>
              </div>
            </div>
            <div className="space-y-1 border-t border-border/40 pt-3">
              <InfoRow icon={Phone} label="手机号" value={data.phone} mono />
              <InfoRow icon={Building2} label="来源" value={data.source} />
              <InfoRow icon={Calendar} label={isDesigner ? "注册时间" : "录入时间"} value={isDesigner ? (data as typeof MOCK_DESIGNER).registeredAt : (data as typeof MOCK_CUSTOMER).createdAt} />
              <InfoRow icon={Activity} label={isDesigner ? "最后活跃" : "最后服务"} value={isDesigner ? (data as typeof MOCK_DESIGNER).lastActiveAt : (data as typeof MOCK_CUSTOMER).lastServiceAt} />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />客户标签
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">{t}</span>
              ))}
            </div>
          </div>

          {data.remark && (
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />备注
              </h4>
              <p className="text-sm text-muted-foreground">{data.remark}</p>
            </div>
          )}

          {!isDesigner && (
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h4 className="text-sm font-medium mb-3">房屋信息</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">地址</span><span>{(data as typeof MOCK_CUSTOMER).address}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">户型</span><span>{(data as typeof MOCK_CUSTOMER).houseType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">面积</span><span>{(data as typeof MOCK_CUSTOMER).area}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">预算</span><span>{(data as typeof MOCK_CUSTOMER).budget}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {isDesigner ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/60 bg-card p-5 text-center">
                  <div className="text-2xl font-bold text-primary">{(data as typeof MOCK_DESIGNER).designCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">设计方案</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-5 text-center">
                  <div className="text-2xl font-bold text-primary">{(data as typeof MOCK_DESIGNER).renderCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">渲染次数</div>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-5">
                <h4 className="text-sm font-medium mb-4">近期设计方案</h4>
                <div className="space-y-3">
                  {(data as typeof MOCK_DESIGNER).recentDesigns.map((d) => (
                    <div key={d.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                      <div>
                        <div className="text-sm font-medium">{d.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{d.date}</div>
                      </div>
                      <span className="text-xs text-muted-foreground">{d.renders} 张渲染</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-border/60 bg-card p-5">
                <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  关联企业
                  <span className="text-xs text-muted-foreground">（同一客户可被多个企业服务）</span>
                </h4>
                <div className="space-y-3">
                  {(data as typeof MOCK_CUSTOMER).linkedEnterprises.map((ent) => (
                    <div key={ent.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/40 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{ent.name}</div>
                          <div className="text-xs text-muted-foreground">{ent.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{ent.serviceCount} 次服务</div>
                        <div className="text-xs text-muted-foreground">最后: {ent.lastService}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-5">
                <h4 className="text-sm font-medium mb-4">服务记录</h4>
                <div className="relative pl-6">
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />
                  {(data as typeof MOCK_CUSTOMER).serviceRecords.map((rec) => (
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
