import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, Plus, ShoppingBag, Link2, Tag, FileText } from "lucide-react";

const steps = [
  { key: "info", label: "商品基本信息" },
  { key: "commercial", label: "配置商业属性" },
  { key: "model", label: "建立模型关系" },
  { key: "confirm", label: "确认提交" },
];

export default function ProductCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    code: "",
    brand: "",
    backendCategory: "",
    frontendCategory: "",
    libraryType: "PRIVATE",
    description: "",
    origin: "",
    warranty: "",
    deliveryCycle: "",
  });

  const handleNext = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
  const handlePrev = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-6">
        <button onClick={() => navigate("/product")} className="hover:text-primary transition-colors">商品管理</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">创建商品</span>
      </div>

      {/* Step indicator */}
      <div className="bg-card rounded-xl border p-6 mb-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium transition-all ${
                    i < currentStep
                      ? "bg-primary text-primary-foreground"
                      : i === currentStep
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/10"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-[13px] ${i === currentStep ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-px mx-4 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-card rounded-xl border p-8" style={{ boxShadow: "var(--shadow-sm)" }}>
        {currentStep === 0 && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-[15px] font-semibold mb-6 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />商品基本信息
            </h3>
            <div className="space-y-5">
              {[
                { label: "商品名称", key: "name", required: true, placeholder: "例：北欧客厅三人沙发" },
                { label: "商品编码", key: "code", required: true, placeholder: "例：PRD-001（创建后不可修改）" },
              ].map(({ label, key, required, placeholder }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-[13px] text-muted-foreground shrink-0 text-right" style={{ width: "var(--form-label-width)" }}>
                    {required && <span className="text-destructive mr-0.5">*</span>}{label}
                  </label>
                  <input
                    className="filter-input flex-1"
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="flex items-center gap-3">
                <label className="text-[13px] text-muted-foreground shrink-0 text-right" style={{ width: "var(--form-label-width)" }}>
                  <span className="text-destructive mr-0.5">*</span>品牌
                </label>
                <select className="filter-select flex-1" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}>
                  <option value="">请选择</option>
                  <option value="居然优选">居然优选</option>
                  <option value="欧派">欧派</option>
                  <option value="索菲亚">索菲亚</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[13px] text-muted-foreground shrink-0 text-right" style={{ width: "var(--form-label-width)" }}>
                  <span className="text-destructive mr-0.5">*</span>库类型
                </label>
                <select className="filter-select flex-1" value={form.libraryType} onChange={(e) => setForm((f) => ({ ...f, libraryType: e.target.value }))}>
                  <option value="PRIVATE">私有库</option>
                  <option value="PUBLIC">公有库</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[13px] text-muted-foreground shrink-0 text-right" style={{ width: "var(--form-label-width)" }}>
                  <span className="text-destructive mr-0.5">*</span>后台分类
                </label>
                <select className="filter-select flex-1" value={form.backendCategory} onChange={(e) => setForm((f) => ({ ...f, backendCategory: e.target.value }))}>
                  <option value="">请选择</option>
                  <option value="沙发">沙发</option>
                  <option value="茶几">茶几</option>
                  <option value="床">床</option>
                  <option value="衣柜">衣柜</option>
                  <option value="套装">套装</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[13px] text-muted-foreground shrink-0 text-right" style={{ width: "var(--form-label-width)" }}>
                  <span className="text-destructive mr-0.5">*</span>前台分类
                </label>
                <select className="filter-select flex-1" value={form.frontendCategory} onChange={(e) => setForm((f) => ({ ...f, frontendCategory: e.target.value }))}>
                  <option value="">请选择</option>
                  <option value="客厅家具">客厅家具</option>
                  <option value="卧室家具">卧室家具</option>
                  <option value="客厅套装">客厅套装</option>
                </select>
              </div>
              <div className="flex items-start gap-3">
                <label className="text-[13px] text-muted-foreground shrink-0 text-right pt-2" style={{ width: "var(--form-label-width)" }}>商品描述</label>
                <textarea
                  className="filter-input flex-1 h-20 py-2"
                  placeholder="输入商品描述..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-[15px] font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />配置商业属性
            </h3>
            <p className="text-[12px] text-muted-foreground mb-6">商业属性不影响3D渲染效果，仅用于商品信息展示和交易履约</p>
            <div className="space-y-5">
              {[
                { label: "产地", key: "origin", required: true, placeholder: "例：广东佛山" },
                { label: "保修期", key: "warranty", required: true, placeholder: "例：3年" },
                { label: "交货周期", key: "deliveryCycle", required: true, placeholder: "例：7-15天" },
              ].map(({ label, key, required, placeholder }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-[13px] text-muted-foreground shrink-0 text-right" style={{ width: "var(--form-label-width)" }}>
                    {required && <span className="text-destructive mr-0.5">*</span>}{label}
                  </label>
                  <input
                    className="filter-input flex-1"
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-[15px] font-semibold mb-2 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />建立模型关系
            </h3>
            <p className="text-[12px] text-muted-foreground mb-6">选择模型SKU，为每个商品SKU配置价格和库存信息</p>
            <div className="border rounded-xl p-5 bg-muted/10 text-center">
              <Tag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground mb-4">从模型库中选择SKU，建立商品与模型的关联关系</p>
              <button className="btn-primary text-[13px]">
                <Plus className="h-3.5 w-3.5" />选择模型SKU
              </button>
              <p className="text-[11px] text-muted-foreground/60 mt-3">支持跨模型SPU选择，同一商品可关联多个模型的SKU</p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-[15px] font-semibold mb-6">确认提交</h3>
            <div className="border rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="商品名称" value={form.name || "未填写"} />
                <InfoItem label="商品编码" value={form.code || "未填写"} />
                <InfoItem label="品牌" value={form.brand || "未选择"} />
                <InfoItem label="库类型" value={form.libraryType === "PUBLIC" ? "公有库" : "私有库"} />
                <InfoItem label="产地" value={form.origin || "未填写"} />
                <InfoItem label="保修期" value={form.warranty || "未填写"} />
              </div>
              <div className="pt-3 border-t border-border/20">
                <p className="text-[12px] text-muted-foreground">
                  {form.libraryType === "PUBLIC" ? "公有库商品提交后将进入待审核状态，审核通过后可上架" : "私有库商品提交后可直接上架"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => navigate("/product")} className="btn-ghost">取消</button>
        <div className="flex gap-3">
          {currentStep > 0 && <button onClick={handlePrev} className="btn-secondary">上一步</button>}
          {currentStep < steps.length - 1 ? (
            <button onClick={handleNext} className="btn-primary">下一步</button>
          ) : (
            <button onClick={() => navigate("/product")} className="btn-primary">
              <Check className="h-3.5 w-3.5" />确认提交
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground mb-0.5">{label}</div>
      <div className="text-[13px] font-medium">{value}</div>
    </div>
  );
}
