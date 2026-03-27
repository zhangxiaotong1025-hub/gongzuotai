import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Upload, X, Plus, Info, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COUNTRIES = ["中国", "美国", "日本", "韩国", "德国", "意大利", "法国", "英国"];
const CATEGORIES = ["瓷砖", "卫浴", "地板", "涂料", "灯具", "家具", "橱柜", "门窗", "五金", "墙纸"];

const STEPS = [
  { key: "basic", label: "基础信息" },
  { key: "category", label: "品类与系列" },
  { key: "enterprise", label: "企业关联" },
  { key: "done", label: "完成" },
];

const MOCK_ENTERPRISES = [
  { id: "e1", name: "居然设计家总部", type: "品牌商" },
  { id: "e2", name: "居然之家北四环店", type: "卖场" },
  { id: "e3", name: "居然之家丽泽店", type: "门店" },
  { id: "e4", name: "欧派家居集团", type: "品牌商" },
  { id: "e5", name: "索菲亚家居", type: "品牌商" },
  { id: "e6", name: "尚品宅配", type: "经销商" },
];

export default function BrandCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("mode") === "edit";
  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] = useState({
    name: isEdit ? "马可波罗" : "",
    country: isEdit ? "中国" : "中国",
    info: isEdit ? "马可波罗瓷砖，始创于1996年，国内建陶行业知名品牌。" : "",
    logo: null as File | null,
    status: "active" as "active" | "inactive",
    categories: isEdit ? ["瓷砖", "卫浴"] : [] as string[],
    series: isEdit ? [
      { id: "s1", name: "真石系列" },
      { id: "s2", name: "岩板大板系列" },
      { id: "s3", name: "1295系列" },
    ] : [] as { id: string; name: string }[],
    ownerEnterpriseIds: isEdit ? ["e1"] : [] as string[],
    agentEnterpriseIds: isEdit ? ["e2", "e3"] : [] as string[],
  });

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const currentStepKey = STEPS[currentStep]?.key;
  const lastStepIndex = STEPS.length - 1;
  const isLastContentStep = currentStep === lastStepIndex - 1;

  const goNext = () => {
    if (currentStepKey === "basic" && !form.name.trim()) {
      toast.error("请填写品牌名称");
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, lastStepIndex));
  };
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/brand")} className="text-[13px] text-muted-foreground hover:text-primary transition-colors">品牌管理</button>
        <span className="text-muted-foreground/30 text-xs">/</span>
        <span className="text-[14px] text-foreground font-semibold tracking-tight">{isEdit ? "编辑品牌" : "新建品牌"}</span>
      </div>

      {/* Steps */}
      <div className="bg-card rounded-2xl border border-border/70 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center justify-center max-w-[720px] mx-auto">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-all border",
                    isCompleted && "bg-primary text-primary-foreground border-primary shadow-sm",
                    isCurrent && "bg-primary text-primary-foreground border-primary shadow-sm",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground border-border",
                  )}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={cn("text-[13px] whitespace-nowrap transition-colors", isCurrent ? "text-foreground font-medium" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-4"><div className={cn("h-px", i < currentStep ? "bg-primary/40" : "bg-border")} /></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-card rounded-2xl border border-border/70 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        {currentStepKey === "basic" && <StepBasic form={form} update={update} />}
        {currentStepKey === "category" && <StepCategory form={form} update={update} />}
        {currentStepKey === "enterprise" && <StepEnterprise form={form} update={update} />}
        {currentStepKey === "done" && <StepDone form={form} navigate={navigate} isEdit={isEdit} />}

        {/* Footer */}
        <div className="flex justify-center gap-3 px-6 py-5 border-t border-border/70 bg-muted/20">
          {currentStep === 0 && <button onClick={() => navigate("/brand")} className="btn-secondary">取消</button>}
          {currentStep > 0 && currentStepKey !== "done" && (
            <>
              <button onClick={() => navigate("/brand")} className="btn-secondary">取消</button>
              <button onClick={goPrev} className="btn-secondary"><ChevronLeft className="h-4 w-4" />上一步</button>
            </>
          )}
          {currentStepKey !== "done" && (
            <button onClick={goNext} className="btn-primary">{isLastContentStep ? "提交" : "下一步"}</button>
          )}
          {currentStepKey === "done" && (
            <button onClick={() => navigate("/brand")} className="btn-secondary">返回列表</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Basic Info ─── */
function StepBasic({ form, update }: { form: Record<string, any>; update: (k: string, v: unknown) => void }) {
  return (
    <div className="p-6">
      <div className="max-w-[780px] mx-auto space-y-6">
        <SectionTitle title="基础信息" description="填写品牌的基本资料信息。" />
        <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-4" style={{ boxShadow: "var(--shadow-xs)" }}>
          <FormRow label="品牌名称" required>
            <input className="filter-input w-full" placeholder="请输入品牌名称" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </FormRow>
          <FormRow label="品牌Logo">
            <div className="w-24 h-24 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-1.5 cursor-pointer text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors">
              <Upload className="h-5 w-5" />
              <span className="text-[11px]">点击上传</span>
            </div>
          </FormRow>
          <FormRow label="国家" required>
            <select className="filter-select w-full" value={form.country} onChange={(e) => update("country", e.target.value)}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormRow>
          <FormRow label="品牌简介">
            <textarea className="filter-input w-full min-h-[92px] resize-none py-2.5" placeholder="请输入品牌简介" value={form.info} onChange={(e) => update("info", e.target.value)} />
          </FormRow>
          <FormRow label="状态">
            <div className="flex items-center gap-6">
              {(["active", "inactive"] as const).map((s) => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <div className={cn("w-4 h-4 rounded-full border-2 transition-all", form.status === s ? "border-[5px] border-primary" : "border-border")} />
                  <span className="text-[13px] text-foreground">{s === "active" ? "启用" : "停用"}</span>
                </label>
              ))}
            </div>
          </FormRow>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Categories & Series ─── */
function StepCategory({ form, update }: { form: Record<string, any>; update: (k: string, v: unknown) => void }) {
  const toggleCategory = (cat: string) => {
    const cats = form.categories as string[];
    update("categories", cats.includes(cat) ? cats.filter((c: string) => c !== cat) : [...cats, cat]);
  };

  const addSeries = () => {
    update("series", [...form.series, { id: crypto.randomUUID(), name: "" }]);
  };

  const removeSeries = (id: string) => {
    update("series", (form.series as any[]).filter((s) => s.id !== id));
  };

  const updateSeriesName = (id: string, name: string) => {
    update("series", (form.series as any[]).map((s) => s.id === id ? { ...s, name } : s));
  };

  return (
    <div className="p-6">
      <div className="max-w-[780px] mx-auto space-y-6">
        <SectionTitle title="品类与系列" description="配置品牌经营的产品品类，并创建品牌下的系列。" />

        {/* Categories */}
        <div className="rounded-2xl border border-border/70 bg-card p-6" style={{ boxShadow: "var(--shadow-xs)" }}>
          <SubSectionTitle title="经营品类" />
          <div className="mt-4 flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => {
              const selected = (form.categories as string[]).includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[13px] font-medium border transition-all",
                    selected
                      ? "bg-primary/8 border-primary/30 text-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-foreground",
                  )}
                >
                  {selected && <Check className="h-3 w-3 inline mr-1.5" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Series */}
        <div className="rounded-2xl border border-border/70 bg-card p-6" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center justify-between mb-4">
            <SubSectionTitle title="品牌系列" />
            <button onClick={addSeries} className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 font-medium transition-colors">
              <Plus className="h-3.5 w-3.5" /> 添加系列
            </button>
          </div>

          {(form.series as any[]).length === 0 ? (
            <div onClick={addSeries} className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed rounded-xl text-muted-foreground cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors">
              <Plus className="h-5 w-5 opacity-60" />
              <span className="text-[13px]">点击添加系列</span>
            </div>
          ) : (
            <div className="space-y-3">
              {(form.series as any[]).map((s, idx) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground w-6 text-right shrink-0">{idx + 1}.</span>
                  <input
                    className="filter-input flex-1"
                    value={s.name}
                    placeholder="请输入系列名称"
                    onChange={(e) => updateSeriesName(s.id, e.target.value)}
                  />
                  <button
                    onClick={() => removeSeries(s.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Enterprise Association ─── */
function StepEnterprise({ form, update }: { form: Record<string, any>; update: (k: string, v: unknown) => void }) {
  const toggleOwner = (id: string) => {
    const ids = form.ownerEnterpriseIds as string[];
    update("ownerEnterpriseIds", ids.includes(id) ? ids.filter((x: string) => x !== id) : [...ids, id]);
  };

  const toggleAgent = (id: string) => {
    const ids = form.agentEnterpriseIds as string[];
    update("agentEnterpriseIds", ids.includes(id) ? ids.filter((x: string) => x !== id) : [...ids, id]);
  };

  return (
    <div className="p-6">
      <div className="max-w-[780px] mx-auto space-y-6">
        <SectionTitle title="企业关联" description="配置哪些企业拥有或代理该品牌。" />

        <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/25 px-4 py-4 text-[12px] text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
          <div className="leading-6">
            <strong className="text-foreground font-semibold">拥有企业</strong> 拥有品牌的完整管理权限，可上传公有模型；
            <strong className="text-foreground font-semibold">代理企业</strong> 可使用品牌资源，但不可上传公有模型。
          </div>
        </div>

        {/* Owner */}
        <div className="rounded-2xl border border-border/70 bg-card p-6" style={{ boxShadow: "var(--shadow-xs)" }}>
          <SubSectionTitle title="拥有企业" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {MOCK_ENTERPRISES.map((ent) => {
              const selected = (form.ownerEnterpriseIds as string[]).includes(ent.id);
              return (
                <div
                  key={ent.id}
                  onClick={() => toggleOwner(ent.id)}
                  className={cn(
                    "relative rounded-xl border p-4 cursor-pointer transition-all",
                    selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/20",
                  )}
                >
                  {selected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="text-[13px] font-medium text-foreground">{ent.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{ent.type}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent */}
        <div className="rounded-2xl border border-border/70 bg-card p-6" style={{ boxShadow: "var(--shadow-xs)" }}>
          <SubSectionTitle title="代理企业" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {MOCK_ENTERPRISES.map((ent) => {
              const selected = (form.agentEnterpriseIds as string[]).includes(ent.id);
              return (
                <div
                  key={ent.id}
                  onClick={() => toggleAgent(ent.id)}
                  className={cn(
                    "relative rounded-xl border p-4 cursor-pointer transition-all",
                    selected ? "border-amber-500 bg-amber-500/5 shadow-sm" : "border-border hover:border-amber-500/30 hover:bg-muted/20",
                  )}
                >
                  {selected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="text-[13px] font-medium text-foreground">{ent.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{ent.type}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 4: Done ─── */
function StepDone({ form, navigate, isEdit }: { form: Record<string, any>; navigate: (p: string) => void; isEdit: boolean }) {
  return (
    <div className="py-14 px-6">
      <div className="flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: "hsl(var(--success) / 0.12)" }}>
          <Check className="h-10 w-10" style={{ color: "hsl(var(--success))" }} strokeWidth={3} />
        </div>
        <h3 className="text-[22px] font-semibold text-foreground tracking-tight">{isEdit ? "编辑成功" : "创建成功"}</h3>
        <p className="text-[13px] text-muted-foreground mt-2">品牌信息已{isEdit ? "更新" : "创建"}完成</p>
        <div className="flex items-center gap-3 mt-6">
          <button onClick={() => navigate("/brand")} className="btn-secondary">返回列表</button>
          {!isEdit && <button onClick={() => { window.location.reload(); }} className="btn-secondary">继续创建</button>}
          <button onClick={() => navigate(`/brand/detail/BRD001`)} className="btn-primary">查看详情</button>
        </div>
      </div>

      <div className="max-w-[780px] mx-auto mt-10 rounded-2xl border border-border/70 bg-muted/20 p-6">
        <div className="grid grid-cols-2 gap-x-14 gap-y-5">
          <SummaryItem label="品牌名称" value={form.name || "未填写"} />
          <SummaryItem label="国家" value={form.country} />
          <SummaryItem label="状态" value={form.status === "active" ? "启用" : "停用"} />
          <SummaryItem label="系列数" value={`${(form.series as any[]).length} 个`} />
          <div className="col-span-2">
            <SummaryItem label="经营品类" value={
              (form.categories as string[]).length > 0
                ? <div className="flex flex-wrap gap-1.5">
                    {(form.categories as string[]).map((c) => (
                      <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-muted text-muted-foreground font-medium">{c}</span>
                    ))}
                  </div>
                : "未选择"
            } />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */
function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <div className="w-0.5 h-4 rounded-full bg-primary/60" />
        <h3 className="text-[15px] font-semibold text-foreground tracking-tight">{title}</h3>
      </div>
      {description && <p className="text-[12px] leading-6 text-muted-foreground ml-[14px]">{description}</p>}
    </div>
  );
}

function SubSectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-0.5 h-4 rounded-full bg-primary/50" />
      <h4 className="text-[14px] font-semibold text-foreground">{title}</h4>
    </div>
  );
}

function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <label className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right pt-2 whitespace-nowrap">
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1 max-w-[480px]">{children}</div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">{label}：</span>
      <span className="text-[13px] text-foreground font-medium">{value}</span>
    </div>
  );
}
