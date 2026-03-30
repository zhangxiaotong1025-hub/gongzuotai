import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, Plus, X, Upload, Search, Package, Link2, Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── Types ── */
interface SkuRow {
  id: string;
  name: string;
  modelSkuName: string;
  modelSpuName: string;
  price: string;
  originalPrice: string;
  stock: string;
  barcode: string;
  params: Record<string, string>;
}

/* ── Mock model data for picker ── */
const MOCK_MODEL_SKUS = [
  { id: "msku-1", name: "酒红·白橡木·1800mm", spuName: "北欧布艺沙发", spuId: "mspu-1" },
  { id: "msku-2", name: "雾蓝·白橡木·1800mm", spuName: "北欧布艺沙发", spuId: "mspu-1" },
  { id: "msku-3", name: "烟灰·胡桃木·2000mm", spuName: "北欧布艺沙发", spuId: "mspu-1" },
  { id: "msku-5", name: "大理石·有置物架", spuName: "北欧圆形茶几", spuId: "mspu-2" },
  { id: "msku-6", name: "原木·有置物架", spuName: "北欧圆形茶几", spuId: "mspu-2" },
  { id: "msku-8", name: "象牙白·真皮·1500mm", spuName: "现代轻奢双人床", spuId: "mspu-3" },
  { id: "msku-9", name: "雅致黑·布艺·1800mm", spuName: "现代轻奢双人床", spuId: "mspu-3" },
  { id: "msku-13", name: "暖白色免漆板", spuName: "步入式衣柜", spuId: "mspu-4" },
  { id: "msku-14", name: "橡木纹免漆板", spuName: "步入式衣柜", spuId: "mspu-4" },
];

const createSkuRow = (modelSku?: typeof MOCK_MODEL_SKUS[0]): SkuRow => ({
  id: crypto.randomUUID(),
  name: modelSku?.name || "",
  modelSkuName: modelSku?.name || "",
  modelSpuName: modelSku?.spuName || "",
  price: "",
  originalPrice: "",
  stock: "",
  barcode: "",
  params: {},
});

export default function ProductCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    code: "",
    brand: "",
    series: "",
    category: "SUPPLY_CHAIN" as string,
    backendCategory: "",
    frontendCategory: "",
    description: "",
    origin: "",
    warranty: "",
    deliveryCycle: "",
    certifications: "",
  });

  const [skuRows, setSkuRows] = useState<SkuRow[]>([]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const addSkuFromModel = (modelSku: typeof MOCK_MODEL_SKUS[0]) => {
    if (skuRows.some((r) => r.modelSkuName === modelSku.name)) return;
    setSkuRows((prev) => [...prev, createSkuRow(modelSku)]);
    setShowModelPicker(false);
    setModelSearch("");
  };

  const removeSku = (id: string) => setSkuRows((prev) => prev.filter((r) => r.id !== id));

  const updateSku = (id: string, field: string, value: string) => {
    setSkuRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = () => {
    if (!form.name || !form.code || !form.brand) {
      toast.error("请填写必填字段");
      return;
    }
    toast.success("商品创建成功");
    navigate("/product");
  };

  const filteredModels = MOCK_MODEL_SKUS.filter(
    (m) => m.name.includes(modelSearch) || m.spuName.includes(modelSearch)
  );

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <button onClick={() => navigate("/product")} className="hover:text-primary transition-colors">商品管理</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">创建商品</span>
      </div>

      {/* ═══ Section 1: 基本信息 ═══ */}
      <SectionCard>
        <SectionTitle title="商品基本信息" />
        <div className="space-y-4 mt-5">
          <FormRow label="商品名称" required>
            <input className="filter-input w-full" placeholder="例：北欧客厅三人沙发" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </FormRow>
          <FormRow label="商品编码" required>
            <input className="filter-input w-full" placeholder="例：PRD-013（创建后不可修改）" value={form.code} onChange={(e) => update("code", e.target.value)} />
          </FormRow>
          <FormRow label="商品分类" required>
            <select className="filter-select w-full" value={form.category} onChange={(e) => update("category", e.target.value)}>
              <option value="SUPPLY_CHAIN">供应链商品</option>
              <option value="ENTERPRISE">企业商品</option>
              <option value="PRIVATE">私有商品</option>
            </select>
          </FormRow>
          <FormRow label="品牌" required>
            <select className="filter-select w-full" value={form.brand} onChange={(e) => update("brand", e.target.value)}>
              <option value="">请选择</option>
              <option value="居然优选">居然优选</option>
              <option value="欧派">欧派</option>
              <option value="索菲亚">索菲亚</option>
              <option value="好莱客">好莱客</option>
              <option value="金牌">金牌</option>
              <option value="尚品宅配">尚品宅配</option>
            </select>
          </FormRow>
          <FormRow label="系列">
            <input className="filter-input w-full" placeholder="例：北欧简约系列" value={form.series} onChange={(e) => update("series", e.target.value)} />
          </FormRow>
          <FormRow label="后台分类" required>
            <select className="filter-select w-full" value={form.backendCategory} onChange={(e) => update("backendCategory", e.target.value)}>
              <option value="">请选择</option>
              <option value="沙发">沙发</option><option value="茶几">茶几</option>
              <option value="床">床</option><option value="衣柜">衣柜</option>
              <option value="套装">套装</option><option value="餐桌">餐桌</option>
              <option value="电视柜">电视柜</option><option value="橱柜">橱柜</option>
            </select>
          </FormRow>
          <FormRow label="前台分类">
            <select className="filter-select w-full" value={form.frontendCategory} onChange={(e) => update("frontendCategory", e.target.value)}>
              <option value="">请选择</option>
              <option value="客厅家具">客厅家具</option><option value="卧室家具">卧室家具</option>
              <option value="餐厅家具">餐厅家具</option><option value="办公家具">办公家具</option>
              <option value="儿童家具">儿童家具</option><option value="厨房家具">厨房家具</option>
            </select>
          </FormRow>
          <FormRow label="商品缩略图">
            <UploadCard label="上传缩略图" />
          </FormRow>
          <FormRow label="商品描述">
            <textarea className="filter-input w-full min-h-[80px] resize-none py-2.5" placeholder="输入商品描述..." value={form.description} onChange={(e) => update("description", e.target.value)} />
          </FormRow>
        </div>
      </SectionCard>

      {/* ═══ Section 2: 商业属性 ═══ */}
      <SectionCard>
        <SectionTitle title="商业属性" description="用于商品信息展示和交易履约，不影响3D渲染效果" />
        <div className="space-y-4 mt-5">
          <FormRow label="产地">
            <input className="filter-input w-full" placeholder="例：广东佛山" value={form.origin} onChange={(e) => update("origin", e.target.value)} />
          </FormRow>
          <FormRow label="保修期">
            <input className="filter-input w-full" placeholder="例：3年" value={form.warranty} onChange={(e) => update("warranty", e.target.value)} />
          </FormRow>
          <FormRow label="交货周期">
            <input className="filter-input w-full" placeholder="例：7-15天" value={form.deliveryCycle} onChange={(e) => update("deliveryCycle", e.target.value)} />
          </FormRow>
          <FormRow label="认证信息">
            <input className="filter-input w-full" placeholder="例：ISO9001、绿色环保认证（逗号分隔）" value={form.certifications} onChange={(e) => update("certifications", e.target.value)} />
          </FormRow>
        </div>
      </SectionCard>

      {/* ═══ Section 3: SKU 配置（同企业权益设置样式）═══ */}
      <div className="rounded-2xl border border-border/70 overflow-hidden bg-card" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/25 px-5 py-4">
          <div>
            <div className="text-[14px] font-semibold text-foreground">SKU 配置</div>
            <div className="text-[12px] text-muted-foreground mt-1">选择关联的模型SKU，为每个商品SKU配置价格和库存</div>
          </div>
          <span className="rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
            已配置 {skuRows.length} 个SKU
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* Model selection field (upload-card style) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-muted-foreground tracking-wide">商品SKU列表</span>
              <button onClick={() => setShowModelPicker(true)} className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors font-medium">
                <Plus className="h-3 w-3" /> 添加SKU
              </button>
            </div>

            {skuRows.length === 0 ? (
              <div
                onClick={() => setShowModelPicker(true)}
                className="flex flex-col items-center justify-center gap-2 py-8 border border-dashed border-border rounded-xl text-muted-foreground cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <Box className="h-5 w-5 opacity-60" />
                <span className="text-[12px]">点击选择模型SKU，创建商品SKU</span>
                <span className="text-[10px] text-muted-foreground/60">支持跨模型SPU选择，同一商品可关联多个模型的SKU</span>
              </div>
            ) : (
              <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
                {/* Table header */}
                <div
                  className="grid bg-muted/35 border-b border-border/60 text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground"
                  style={{ gridTemplateColumns: "minmax(160px,1.5fr) minmax(120px,1fr) 100px 100px 80px 36px" }}
                >
                  <div className="px-4 py-3">SKU名称</div>
                  <div className="px-4 py-3">关联模型</div>
                  <div className="px-4 py-3">售价(¥)</div>
                  <div className="px-4 py-3">原价(¥)</div>
                  <div className="px-4 py-3">库存</div>
                  <div />
                </div>
                {/* Rows */}
                {skuRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid items-center border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors group"
                    style={{ gridTemplateColumns: "minmax(160px,1.5fr) minmax(120px,1fr) 100px 100px 80px 36px" }}
                  >
                    <div className="px-4 py-3">
                      <input
                        className="filter-input h-9 w-full px-2 text-[13px]"
                        placeholder="SKU名称"
                        value={row.name}
                        onChange={(e) => updateSku(row.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium whitespace-nowrap max-w-full truncate"
                        style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}
                      >
                        <Link2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{row.modelSkuName}</span>
                      </span>
                    </div>
                    <div className="px-3 py-3">
                      <input className="filter-input h-9 w-full px-2 text-center text-[13px]" type="number" placeholder="0" value={row.price} onChange={(e) => updateSku(row.id, "price", e.target.value)} />
                    </div>
                    <div className="px-3 py-3">
                      <input className="filter-input h-9 w-full px-2 text-center text-[13px]" type="number" placeholder="0" value={row.originalPrice} onChange={(e) => updateSku(row.id, "originalPrice", e.target.value)} />
                    </div>
                    <div className="px-3 py-3">
                      <input className="filter-input h-9 w-full px-2 text-center text-[13px]" type="number" placeholder="0" value={row.stock} onChange={(e) => updateSku(row.id, "stock", e.target.value)} />
                    </div>
                    <div className="px-2 py-3 flex justify-center">
                      <button
                        onClick={() => removeSku(row.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Footer actions ═══ */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => navigate("/product")} className="btn-secondary">取消</button>
        <button onClick={handleSubmit} className="btn-primary">
          <Plus className="h-3.5 w-3.5" />提交创建
        </button>
      </div>

      {/* ═══ Model SKU Picker (same as enterprise benefit picker) ═══ */}
      {showModelPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowModelPicker(false); setModelSearch(""); }}>
          <div
            className="bg-card rounded-2xl border border-border/70 w-[560px] max-h-[520px] flex flex-col overflow-hidden"
            style={{ boxShadow: "var(--shadow-md)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/25">
              <div>
                <h4 className="text-[14px] font-semibold text-foreground">选择模型SKU</h4>
                <p className="text-[12px] text-muted-foreground mt-1">选择后自动创建对应的商品SKU</p>
              </div>
              <button onClick={() => { setShowModelPicker(false); setModelSearch(""); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-border/60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input className="filter-input w-full pl-9" placeholder="搜索模型名称..." value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredModels.length === 0 ? (
                <div className="text-center py-10 text-[13px] text-muted-foreground">暂无匹配的模型SKU</div>
              ) : (
                filteredModels.map((m) => {
                  const alreadyAdded = skuRows.some((r) => r.modelSkuName === m.name);
                  return (
                    <div
                      key={m.id}
                      onClick={() => !alreadyAdded && addSkuFromModel(m)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                        alreadyAdded
                          ? "opacity-50 cursor-not-allowed bg-muted/20"
                          : "cursor-pointer hover:border-primary/30 hover:bg-muted/20",
                      )}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.08)" }}>
                        <Package className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-foreground">{m.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          <span className="inline-flex items-center gap-1"><Link2 className="h-3 w-3" />{m.spuName}</span>
                        </div>
                      </div>
                      {alreadyAdded && <span className="text-[11px] text-muted-foreground shrink-0">已添加</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared layout components (same as EnterpriseCreate) ── */

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

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6" style={{ boxShadow: "var(--shadow-xs)" }}>
      {children}
    </div>
  );
}

function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <label className="text-[13px] text-muted-foreground pt-2 text-right shrink-0" style={{ width: "var(--form-label-width)" }}>
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1 min-w-0 flex items-center">{children}</div>
    </div>
  );
}

function UploadCard({ label }: { label: string }) {
  return (
    <div className="w-24 h-24 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-1.5 cursor-pointer text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors">
      <Upload className="h-5 w-5" />
      <span className="text-[11px]">{label}</span>
    </div>
  );
}
