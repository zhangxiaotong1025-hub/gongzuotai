import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Check, Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ── Constants ── */
const TAGS_POOL = ["高意向", "已签约", "待跟进", "VIP", "新客户", "老客户", "装修中", "已交付"];
const ENTERPRISES = [
  { id: "ent-1", name: "欧派家居集团股份有限公司" },
  { id: "ent-2", name: "索菲亚家居股份有限公司" },
  { id: "ent-3", name: "尚品宅配家居股份有限公司" },
  { id: "ent-4", name: "好莱客创意家居股份有限公司" },
  { id: "ent-5", name: "金牌厨柜家居科技股份有限公司" },
];

const STEPS_DESIGNER = [
  { key: "basic", label: "基础信息" },
  { key: "profile", label: "设计师信息" },
  { key: "done", label: "完成" },
];

const STEPS_CUSTOMER = [
  { key: "basic", label: "基础信息" },
  { key: "house", label: "房屋信息" },
  { key: "enterprise", label: "关联企业" },
  { key: "done", label: "完成" },
];

interface FormData {
  name: string;
  phone: string;
  tags: string[];
  remark: string;
  // designer fields
  specialties: string[];
  experience: string;
  // customer fields
  address: string;
  houseType: string;
  area: string;
  budget: string;
  linkedEnterpriseIds: string[];
}

const INIT_FORM: FormData = {
  name: "", phone: "", tags: [], remark: "",
  specialties: [], experience: "",
  address: "", houseType: "", area: "", budget: "",
  linkedEnterpriseIds: [],
};

const SPECIALTIES = ["现代简约", "北欧", "新中式", "轻奢", "工业风", "日式", "美式", "地中海"];
const HOUSE_TYPES = ["一室一厅", "两室一厅", "两室两厅", "三室一厅", "三室两厅", "四室两厅", "复式", "别墅", "商铺", "办公"];

/* ── Component ── */
export default function CustomerCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isEdit = params.get("mode") === "edit";
  const type = params.get("type") || "designer";
  const isDesigner = type === "designer";
  const steps = isDesigner ? STEPS_DESIGNER : STEPS_CUSTOMER;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INIT_FORM);
  const [entSearch, setEntSearch] = useState("");

  const update = <K extends keyof FormData>(key: K, val: FormData[K]) => setForm((p) => ({ ...p, [key]: val }));

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.phone.trim();
    return true;
  };

  const handleNext = () => {
    if (step === steps.length - 2) {
      toast.success(isEdit ? "客户信息已更新" : "客户创建成功");
    }
    setStep((s) => s + 1);
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-[80vh]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/customer")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{isEdit ? "编辑客户" : "新建客户"}</h1>
          <p className="text-xs text-muted-foreground">{isDesigner ? "个人设计师" : "企业客户"}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8 max-w-2xl">
        {steps.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  done ? "bg-primary text-primary-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-sm whitespace-nowrap ${active ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${done ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="max-w-2xl">
        <div className="rounded-xl border border-border/60 bg-card p-6">
          {/* Step: Basic Info */}
          {currentStep.key === "basic" && (
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-foreground mb-4">基础信息</h3>
              <FieldRow label="姓名" required>
                <input
                  className="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="请输入客户姓名"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </FieldRow>
              <FieldRow label="手机号" required>
                <input
                  className="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="请输入手机号"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  maxLength={11}
                />
              </FieldRow>
              <FieldRow label="标签">
                <div className="flex flex-wrap gap-2">
                  {TAGS_POOL.map((t) => {
                    const sel = form.tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => update("tags", sel ? form.tags.filter((x) => x !== t) : [...form.tags, t])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          sel ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </FieldRow>
              <FieldRow label="备注">
                <textarea
                  className="w-full h-20 px-3 py-2 rounded-lg border border-border/60 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="请输入备注信息"
                  value={form.remark}
                  onChange={(e) => update("remark", e.target.value)}
                />
              </FieldRow>
            </div>
          )}

          {/* Step: Designer Profile */}
          {currentStep.key === "profile" && (
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-foreground mb-4">设计师信息</h3>
              <FieldRow label="擅长风格">
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((s) => {
                    const sel = form.specialties.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update("specialties", sel ? form.specialties.filter((x) => x !== s) : [...form.specialties, s])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          sel ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </FieldRow>
              <FieldRow label="从业年限">
                <input
                  className="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="如：5年"
                  value={form.experience}
                  onChange={(e) => update("experience", e.target.value)}
                />
              </FieldRow>
            </div>
          )}

          {/* Step: House Info */}
          {currentStep.key === "house" && (
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-foreground mb-4">房屋信息</h3>
              <FieldRow label="地址">
                <input
                  className="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="请输入详细地址"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </FieldRow>
              <FieldRow label="户型">
                <div className="flex flex-wrap gap-2">
                  {HOUSE_TYPES.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => update("houseType", h)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.houseType === h ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </FieldRow>
              <FieldRow label="面积">
                <input
                  className="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="如：120㎡"
                  value={form.area}
                  onChange={(e) => update("area", e.target.value)}
                />
              </FieldRow>
              <FieldRow label="预算">
                <input
                  className="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="如：15万"
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                />
              </FieldRow>
            </div>
          )}

          {/* Step: Enterprise Association */}
          {currentStep.key === "enterprise" && (
            <div className="space-y-5">
              <h3 className="text-sm font-medium text-foreground mb-4">关联企业</h3>
              <p className="text-xs text-muted-foreground -mt-2 mb-4">选择服务该客户的企业，同一客户可关联多个企业</p>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="搜索企业名称"
                  value={entSearch}
                  onChange={(e) => setEntSearch(e.target.value)}
                />
              </div>
              {/* Selected */}
              {form.linkedEnterpriseIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.linkedEnterpriseIds.map((eid) => {
                    const ent = ENTERPRISES.find((e) => e.id === eid);
                    return ent ? (
                      <span key={eid} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {ent.name}
                        <button type="button" onClick={() => update("linkedEnterpriseIds", form.linkedEnterpriseIds.filter((x) => x !== eid))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              {/* List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {ENTERPRISES
                  .filter((e) => !entSearch || e.name.includes(entSearch))
                  .map((ent) => {
                    const sel = form.linkedEnterpriseIds.includes(ent.id);
                    return (
                      <button
                        key={ent.id}
                        type="button"
                        onClick={() => update("linkedEnterpriseIds", sel
                          ? form.linkedEnterpriseIds.filter((x) => x !== ent.id)
                          : [...form.linkedEnterpriseIds, ent.id]
                        )}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left ${
                          sel ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          sel ? "border-primary bg-primary" : "border-border"
                        }`}>
                          {sel && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className="text-sm">{ent.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Step: Done */}
          {currentStep.key === "done" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{isEdit ? "客户信息已更新" : "客户创建成功"}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {isDesigner ? `设计师 ${form.name} 已${isEdit ? "更新" : "创建"}` : `客户 ${form.name} 已${isEdit ? "更新" : "创建"}，关联 ${form.linkedEnterpriseIds.length} 家企业`}
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => navigate("/customer")}>返回列表</Button>
                {!isEdit && <Button onClick={() => { setStep(0); setForm(INIT_FORM); }}>继续创建</Button>}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {currentStep.key !== "done" && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => step === 0 ? navigate("/customer") : setStep((s) => s - 1)}>
              {step === 0 ? "取消" : "上一步"}
            </Button>
            <Button onClick={handleNext} disabled={!canNext()}>
              {step === steps.length - 2 ? (isEdit ? "保存" : "提交") : "下一步"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Field Row ── */
function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
