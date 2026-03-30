import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileUp, Check, ChevronRight, Plus, X } from "lucide-react";

const steps = [
  { key: "upload", label: "上传3D文件" },
  { key: "info", label: "填写基本信息" },
  { key: "params", label: "配置可编辑参数" },
  { key: "confirm", label: "确认提交" },
];

export default function ModelCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    fileName: "",
    fileFormat: ".max",
    fileSize: 0,
    spuName: "",
    spuCode: "",
    libraryType: "PUBLIC",
    brand: "",
    category: "",
    description: "",
  });
  const [uploaded, setUploaded] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-6">
        <button onClick={() => navigate("/model")} className="hover:text-primary transition-colors">模型管理</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">上传模型</span>
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
          <div className="max-w-xl mx-auto">
            <h3 className="text-[15px] font-semibold mb-6">上传3D文件</h3>
            {!uploaded ? (
              <div
                onClick={() => { setUploaded(true); setForm(f => ({ ...f, fileName: "北欧布艺沙发.max", fileFormat: ".max", fileSize: 125829120 })); }}
                className="border-2 border-dashed border-border/60 rounded-xl p-12 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/2 transition-all"
              >
                <FileUp className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-[14px] text-foreground mb-1">点击或拖拽上传3D文件</p>
                <p className="text-[12px] text-muted-foreground">支持 .max / .fbx / .gltf 格式，文件大小 ≤ 500MB</p>
              </div>
            ) : (
              <div className="border rounded-xl p-5 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-[14px]">{form.fileName}</div>
                      <div className="text-[12px] text-muted-foreground">
                        {form.fileFormat} · {(form.fileSize / 1048576).toFixed(0)} MB · 45,230 面 · 4 个部件
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setUploaded(false)} className="btn-ghost text-[12px]">
                    <X className="h-3.5 w-3.5" />重新选择
                  </button>
                </div>
                <div className="mt-4 bg-primary/5 rounded-lg p-3">
                  <div className="text-[12px] font-medium text-primary mb-2">自动解析部件列表</div>
                  <div className="flex flex-wrap gap-2">
                    {["沙发主体", "靠垫", "坐垫", "沙发腿"].map((c) => (
                      <span key={c} className="badge-product">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-[15px] font-semibold mb-6">填写基本信息</h3>
            <div className="space-y-5">
              {[
                { label: "模型名称", key: "spuName", required: true, placeholder: "例：北欧布艺沙发" },
                { label: "模型编码", key: "spuCode", required: true, placeholder: "例：SF-001（需唯一）" },
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
                  <span className="text-destructive mr-0.5">*</span>库类型
                </label>
                <select
                  className="filter-select flex-1"
                  value={form.libraryType}
                  onChange={(e) => setForm((f) => ({ ...f, libraryType: e.target.value }))}
                >
                  <option value="PUBLIC">公有库</option>
                  <option value="BRAND">品牌库</option>
                  <option value="PRIVATE">私有库</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[13px] text-muted-foreground shrink-0 text-right" style={{ width: "var(--form-label-width)" }}>
                  品牌
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
                  <span className="text-destructive mr-0.5">*</span>后台分类
                </label>
                <select className="filter-select flex-1" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="">请选择</option>
                  <option value="沙发">沙发</option>
                  <option value="茶几">茶几</option>
                  <option value="床">床</option>
                  <option value="衣柜">衣柜</option>
                  <option value="书桌">书桌</option>
                  <option value="灯具">灯具</option>
                </select>
              </div>
              <div className="flex items-start gap-3">
                <label className="text-[13px] text-muted-foreground shrink-0 text-right pt-2" style={{ width: "var(--form-label-width)" }}>描述</label>
                <textarea
                  className="filter-input flex-1 h-20 py-2"
                  placeholder="输入模型描述..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[15px] font-semibold">配置可编辑参数</h3>
              <span className="text-[12px] text-muted-foreground">可跳过此步骤，后续在模型详情中配置</span>
            </div>
            <div className="border rounded-xl p-5 bg-muted/10 text-center">
              <Settings2Icon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground mb-4">为部件配置材质、颜色、尺寸等可编辑参数</p>
              <button className="btn-secondary text-[13px]">
                <Plus className="h-3.5 w-3.5" />添加参数配置
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-[15px] font-semibold mb-6">确认提交</h3>
            <div className="border rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="文件名" value={form.fileName || "未上传"} />
                <InfoItem label="文件格式" value={form.fileFormat} />
                <InfoItem label="模型名称" value={form.spuName || "未填写"} />
                <InfoItem label="模型编码" value={form.spuCode || "未填写"} />
                <InfoItem label="库类型" value={{ PUBLIC: "公有库", BRAND: "品牌库", PRIVATE: "私有库" }[form.libraryType]} />
                <InfoItem label="品牌" value={form.brand || "未选择"} />
                <InfoItem label="后台分类" value={form.category || "未选择"} />
              </div>
              <div className="pt-3 border-t border-border/20">
                <p className="text-[12px] text-muted-foreground">
                  {form.libraryType === "PUBLIC" ? "公有库模型提交后将进入待审核状态" : "提交后模型状态为待上架"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => navigate("/model")} className="btn-ghost">取消</button>
        <div className="flex gap-3">
          {currentStep > 0 && <button onClick={handlePrev} className="btn-secondary">上一步</button>}
          {currentStep === 2 && <button onClick={handleNext} className="btn-ghost">跳过此步</button>}
          {currentStep < steps.length - 1 ? (
            <button onClick={handleNext} className="btn-primary" disabled={currentStep === 0 && !uploaded}>
              下一步
            </button>
          ) : (
            <button onClick={() => navigate("/model")} className="btn-primary">
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

function Settings2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
