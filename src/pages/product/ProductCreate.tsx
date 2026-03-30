import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, Plus, X, Upload, Search, Package, Link2, Box,
  Settings2, Image, Play, FileText, Trash2, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════ */

interface SkuAttrDef {
  id: string;
  name: string;
  /** 是否影响3D模型渲染 */
  isModelAttr: boolean;
}

interface SkuRow {
  id: string;
  name: string;
  modelSkuId: string;
  modelSkuName: string;
  modelSpuName: string;
  price: string;
  originalPrice: string;
  costPrice: string;
  stock: string;
  barcode: string;
  weight: string;
  attrs: Record<string, string>;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
}

/* ── Mock data ── */
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

const ATTR_LIBRARY: SkuAttrDef[] = [
  { id: "attr-color", name: "颜色", isModelAttr: true },
  { id: "attr-size", name: "尺寸", isModelAttr: true },
  { id: "attr-material", name: "材质", isModelAttr: true },
  { id: "attr-style", name: "风格", isModelAttr: false },
  { id: "attr-texture", name: "纹理", isModelAttr: true },
  { id: "attr-finish", name: "表面处理", isModelAttr: false },
  { id: "attr-leg", name: "腿部材质", isModelAttr: true },
  { id: "attr-cushion", name: "坐垫类型", isModelAttr: false },
  { id: "attr-frame", name: "框架材质", isModelAttr: false },
];

const createEmptySkuRow = (): SkuRow => ({
  id: crypto.randomUUID(),
  name: "",
  modelSkuId: "",
  modelSkuName: "",
  modelSpuName: "",
  price: "",
  originalPrice: "",
  costPrice: "",
  stock: "",
  barcode: "",
  weight: "",
  attrs: {},
});

/* ══════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════ */

export default function ProductCreate() {
  const navigate = useNavigate();

  /* ── Form state ── */
  const [form, setForm] = useState({
    name: "", code: "", brand: "", series: "",
    category: "SUPPLY_CHAIN",
    backendCategory: "", frontendCategory: "",
    description: "",
    sellingPoints: "",
    origin: "", warranty: "", deliveryCycle: "", certifications: "",
    material: "", dimensions: "",
  });

  const [skuRows, setSkuRows] = useState<SkuRow[]>([]);
  const [skuAttrDefs, setSkuAttrDefs] = useState<SkuAttrDef[]>([
    { id: "attr-color", name: "颜色", isModelAttr: true },
    { id: "attr-size", name: "尺寸", isModelAttr: true },
    { id: "attr-material", name: "材质", isModelAttr: true },
  ]);

  /* ── Media state ── */
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [displayImages, setDisplayImages] = useState<UploadedFile[]>([]);
  const [detailImages, setDetailImages] = useState<UploadedFile[]>([]);
  const [sceneImages, setSceneImages] = useState<UploadedFile[]>([]);
  const [videos, setVideos] = useState<UploadedFile[]>([]);

  /* ── Dialogs ── */
  const [showModelPicker, setShowModelPicker] = useState<string | null>(null); // skuId or null
  const [showAttrPicker, setShowAttrPicker] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  /* ── SKU ops ── */
  const addEmptySkuRow = () => setSkuRows((prev) => [...prev, createEmptySkuRow()]);
  const removeSku = (id: string) => setSkuRows((prev) => prev.filter((r) => r.id !== id));
  const updateSku = (id: string, field: string, value: string) =>
    setSkuRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const updateSkuAttr = (skuId: string, attrId: string, value: string) =>
    setSkuRows((prev) => prev.map((r) => (r.id === skuId ? { ...r, attrs: { ...r.attrs, [attrId]: value } } : r)));

  const assignModelToSku = (skuId: string, model: typeof MOCK_MODEL_SKUS[0]) => {
    setSkuRows((prev) => prev.map((r) =>
      r.id === skuId ? { ...r, modelSkuId: model.id, modelSkuName: model.name, modelSpuName: model.spuName, name: r.name || model.name } : r
    ));
    setShowModelPicker(null);
    setModelSearch("");
  };

  /* ── Attr ops ── */
  const addAttrDef = (attr: SkuAttrDef) => {
    if (skuAttrDefs.some((a) => a.id === attr.id)) return;
    setSkuAttrDefs((prev) => [...prev, attr]);
  };
  const removeAttrDef = (attrId: string) => setSkuAttrDefs((prev) => prev.filter((a) => a.id !== attrId));

  /* ── Mock upload ── */
  const mockUpload = (type: "image" | "video"): UploadedFile => ({
    id: crypto.randomUUID(),
    name: type === "image" ? `图片_${Date.now()}.jpg` : `视频_${Date.now()}.mp4`,
    url: "",
    type,
  });

  const filteredModels = MOCK_MODEL_SKUS.filter(
    (m) => m.name.includes(modelSearch) || m.spuName.includes(modelSearch)
  );

  const handleSubmit = () => {
    if (!form.name || !form.code || !form.brand) {
      toast.error("请填写必填字段");
      return;
    }
    toast.success("商品创建成功");
    navigate("/product");
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <button onClick={() => navigate("/product")} className="hover:text-primary transition-colors">商品管理</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">创建商品</span>
      </div>

      {/* ═══ Section 1: 基本信息 (compact multi-column) ═══ */}
      <SectionCard>
        <SectionTitle title="商品基本信息" />
        <div className="space-y-3.5 mt-5">
          <FormGrid>
            <FormRow label="商品名称" required span={2}>
              <input className="filter-input w-full" placeholder="例：北欧客厅三人沙发" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </FormRow>
          </FormGrid>
          <FormGrid>
            <FormRow label="商品编码" required>
              <input className="filter-input w-full" placeholder="例：PRD-013" value={form.code} onChange={(e) => update("code", e.target.value)} />
            </FormRow>
            <FormRow label="商品分类" required>
              <select className="filter-select w-full" value={form.category} onChange={(e) => update("category", e.target.value)}>
                <option value="SUPPLY_CHAIN">供应链商品</option>
                <option value="ENTERPRISE">企业商品</option>
                <option value="PRIVATE">私有商品</option>
              </select>
            </FormRow>
          </FormGrid>
          <FormGrid>
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
          </FormGrid>
          <FormGrid>
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
          </FormGrid>
          <FormGrid>
            <FormRow label="卖点" span={2}>
              <input className="filter-input w-full" placeholder="例：高弹力海绵坐垫、可拆洗面料（逗号分隔）" value={form.sellingPoints} onChange={(e) => update("sellingPoints", e.target.value)} />
            </FormRow>
          </FormGrid>
          <FormGrid>
            <FormRow label="商品描述" span={2}>
              <textarea className="filter-input w-full min-h-[72px] resize-none py-2.5" placeholder="输入商品描述..." value={form.description} onChange={(e) => update("description", e.target.value)} />
            </FormRow>
          </FormGrid>
        </div>
      </SectionCard>

      {/* ═══ Section 2: 商品展示素材 ═══ */}
      <SectionCard>
        <SectionTitle title="商品展示素材" description="商品缩略图、展示图、细节图、场景图及视频素材" />
        <div className="space-y-5 mt-5">
          {/* Thumbnail */}
          <FormGrid>
            <FormRow label="商品缩略图" required>
              <div className="flex items-center gap-3">
                <UploadCard label="主图" size="sm" />
                <span className="text-[11px] text-muted-foreground">建议 800×800px，JPG/PNG</span>
              </div>
            </FormRow>
          </FormGrid>
          {/* Display images */}
          <div className="ml-[calc(var(--form-label-width)+16px)]">
            <div className="text-[12px] font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Image className="h-3 w-3" /> 商品展示图 <span className="text-muted-foreground/50">（轮播主图，最多8张）</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {displayImages.map((f) => (
                <UploadedThumb key={f.id} file={f} onRemove={() => setDisplayImages((prev) => prev.filter((x) => x.id !== f.id))} />
              ))}
              {displayImages.length < 8 && (
                <UploadCard label="展示图" size="sm" onClick={() => setDisplayImages((prev) => [...prev, mockUpload("image")])} />
              )}
            </div>
          </div>
          {/* Detail images */}
          <div className="ml-[calc(var(--form-label-width)+16px)]">
            <div className="text-[12px] font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Image className="h-3 w-3" /> 细节特写图 <span className="text-muted-foreground/50">（工艺/材质细节，最多12张）</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {detailImages.map((f) => (
                <UploadedThumb key={f.id} file={f} onRemove={() => setDetailImages((prev) => prev.filter((x) => x.id !== f.id))} />
              ))}
              {detailImages.length < 12 && (
                <UploadCard label="细节图" size="sm" onClick={() => setDetailImages((prev) => [...prev, mockUpload("image")])} />
              )}
            </div>
          </div>
          {/* Scene images */}
          <div className="ml-[calc(var(--form-label-width)+16px)]">
            <div className="text-[12px] font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Image className="h-3 w-3" /> 场景效果图 <span className="text-muted-foreground/50">（空间搭配，最多6张）</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {sceneImages.map((f) => (
                <UploadedThumb key={f.id} file={f} onRemove={() => setSceneImages((prev) => prev.filter((x) => x.id !== f.id))} />
              ))}
              {sceneImages.length < 6 && (
                <UploadCard label="场景图" size="sm" onClick={() => setSceneImages((prev) => [...prev, mockUpload("image")])} />
              )}
            </div>
          </div>
          {/* Videos */}
          <div className="ml-[calc(var(--form-label-width)+16px)]">
            <div className="text-[12px] font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Play className="h-3 w-3" /> 视频素材 <span className="text-muted-foreground/50">（产品视频，最多3个）</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {videos.map((f) => (
                <UploadedThumb key={f.id} file={f} onRemove={() => setVideos((prev) => prev.filter((x) => x.id !== f.id))} />
              ))}
              {videos.length < 3 && (
                <UploadCard label="上传视频" size="sm" icon={Play} onClick={() => setVideos((prev) => [...prev, mockUpload("video")])} />
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ═══ Section 3: 商业属性 (compact) ═══ */}
      <SectionCard>
        <SectionTitle title="商业属性" description="用于商品信息展示和交易履约" />
        <div className="space-y-3.5 mt-5">
          <FormGrid>
            <FormRow label="产地">
              <input className="filter-input w-full" placeholder="例：广东佛山" value={form.origin} onChange={(e) => update("origin", e.target.value)} />
            </FormRow>
            <FormRow label="保修期">
              <input className="filter-input w-full" placeholder="例：3年" value={form.warranty} onChange={(e) => update("warranty", e.target.value)} />
            </FormRow>
          </FormGrid>
          <FormGrid>
            <FormRow label="交货周期">
              <input className="filter-input w-full" placeholder="例：7-15天" value={form.deliveryCycle} onChange={(e) => update("deliveryCycle", e.target.value)} />
            </FormRow>
            <FormRow label="认证信息">
              <input className="filter-input w-full" placeholder="ISO9001、绿色环保（逗号分隔）" value={form.certifications} onChange={(e) => update("certifications", e.target.value)} />
            </FormRow>
          </FormGrid>
          <FormGrid>
            <FormRow label="主要材质">
              <input className="filter-input w-full" placeholder="例：实木框架+布艺面料" value={form.material} onChange={(e) => update("material", e.target.value)} />
            </FormRow>
            <FormRow label="主要尺寸">
              <input className="filter-input w-full" placeholder="例：1800×900×850mm" value={form.dimensions} onChange={(e) => update("dimensions", e.target.value)} />
            </FormRow>
          </FormGrid>
        </div>
      </SectionCard>

      {/* ═══ Section 4: SKU 配置 ═══ */}
      <div className="rounded-2xl border border-border/70 overflow-hidden bg-card" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/25 px-5 py-4">
          <div>
            <div className="text-[14px] font-semibold text-foreground flex items-center gap-2">
              <div className="w-0.5 h-4 rounded-full bg-primary/60" />
              SKU 配置
            </div>
            <div className="text-[12px] text-muted-foreground mt-1 ml-[14px]">先添加SKU行，再配置关联模型、属性和价格</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAttrPicker(true)}
              className="btn-secondary text-[12px] h-8 px-3 flex items-center gap-1"
            >
              <Settings2 className="h-3 w-3" /> 属性设置
            </button>
            <button onClick={addEmptySkuRow} className="btn-primary text-[12px] h-8 px-3 flex items-center gap-1">
              <Plus className="h-3 w-3" /> 添加SKU
            </button>
            <span className="rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary ml-1">
              {skuRows.length} 个
            </span>
          </div>
        </div>

        <div className="p-5">
          {skuRows.length === 0 ? (
            <div
              onClick={addEmptySkuRow}
              className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed border-border rounded-xl text-muted-foreground cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <Box className="h-5 w-5 opacity-60" />
              <span className="text-[12px]">点击添加SKU行，再逐行配置参数</span>
              <span className="text-[10px] text-muted-foreground/60">可自定义属性列，支持从属性库选择</span>
            </div>
          ) : (
            <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
              {/* Table header */}
              <div className="flex bg-muted/35 border-b border-border/60 text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                <div className="w-[180px] shrink-0 px-3 py-3">SKU名称</div>
                <div className="w-[160px] shrink-0 px-3 py-3">关联模型</div>
                {skuAttrDefs.map((attr) => (
                  <div key={attr.id} className="w-[100px] shrink-0 px-2 py-3 flex items-center gap-1">
                    {attr.name}
                    {attr.isModelAttr && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60" title="模型属性" />
                    )}
                  </div>
                ))}
                <div className="w-[90px] shrink-0 px-2 py-3">售价(¥)</div>
                <div className="w-[90px] shrink-0 px-2 py-3">原价(¥)</div>
                <div className="w-[70px] shrink-0 px-2 py-3">库存</div>
                <div className="w-[36px] shrink-0" />
              </div>
              {/* Rows */}
              {skuRows.map((row) => (
                <div key={row.id} className="flex items-center border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors group">
                  <div className="w-[180px] shrink-0 px-3 py-2.5">
                    <input className="filter-input h-8 w-full px-2 text-[12px]" placeholder="SKU名称" value={row.name} onChange={(e) => updateSku(row.id, "name", e.target.value)} />
                  </div>
                  <div className="w-[160px] shrink-0 px-3 py-2.5">
                    {row.modelSkuId ? (
                      <button
                        onClick={() => setShowModelPicker(row.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium truncate max-w-full"
                        style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}
                      >
                        <Link2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{row.modelSkuName}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowModelPicker(row.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus className="h-3 w-3" /> 选择模型
                      </button>
                    )}
                  </div>
                  {skuAttrDefs.map((attr) => (
                    <div key={attr.id} className="w-[100px] shrink-0 px-2 py-2.5">
                      <input
                        className={cn("filter-input h-8 w-full px-2 text-[12px]", attr.isModelAttr && "border-primary/20")}
                        placeholder={attr.name}
                        value={row.attrs[attr.id] || ""}
                        onChange={(e) => updateSkuAttr(row.id, attr.id, e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="w-[90px] shrink-0 px-2 py-2.5">
                    <input className="filter-input h-8 w-full px-2 text-center text-[12px]" type="number" placeholder="0" value={row.price} onChange={(e) => updateSku(row.id, "price", e.target.value)} />
                  </div>
                  <div className="w-[90px] shrink-0 px-2 py-2.5">
                    <input className="filter-input h-8 w-full px-2 text-center text-[12px]" type="number" placeholder="0" value={row.originalPrice} onChange={(e) => updateSku(row.id, "originalPrice", e.target.value)} />
                  </div>
                  <div className="w-[70px] shrink-0 px-2 py-2.5">
                    <input className="filter-input h-8 w-full px-2 text-center text-[12px]" type="number" placeholder="0" value={row.stock} onChange={(e) => updateSku(row.id, "stock", e.target.value)} />
                  </div>
                  <div className="w-[36px] shrink-0 flex justify-center">
                    <button onClick={() => removeSku(row.id)} className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {/* Add row button */}
              <button
                onClick={addEmptySkuRow}
                className="w-full flex items-center justify-center gap-1 py-2.5 text-[12px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors border-t border-dashed border-border/40"
              >
                <Plus className="h-3 w-3" /> 添加一行
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Footer actions ═══ */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => navigate("/product")} className="btn-secondary">取消</button>
        <button onClick={handleSubmit} className="btn-primary flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" />提交创建
        </button>
      </div>

      {/* ═══ Model SKU Picker Dialog ═══ */}
      {showModelPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowModelPicker(null); setModelSearch(""); }}>
          <div className="bg-card rounded-2xl border border-border/70 w-[560px] max-h-[520px] flex flex-col overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/25">
              <div>
                <h4 className="text-[14px] font-semibold text-foreground">选择模型SKU</h4>
                <p className="text-[12px] text-muted-foreground mt-1">为当前SKU关联一个3D模型</p>
              </div>
              <button onClick={() => { setShowModelPicker(null); setModelSearch(""); }} className="text-muted-foreground hover:text-foreground transition-colors">
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
                filteredModels.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => assignModelToSku(showModelPicker, m)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer hover:border-primary/30 hover:bg-muted/20 transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.08)" }}>
                      <Package className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-foreground">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Link2 className="h-3 w-3" />{m.spuName}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Attribute Picker Dialog ═══ */}
      {showAttrPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAttrPicker(false)}>
          <div className="bg-card rounded-2xl border border-border/70 w-[480px] max-h-[520px] flex flex-col overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/25">
              <div>
                <h4 className="text-[14px] font-semibold text-foreground">属性设置</h4>
                <p className="text-[12px] text-muted-foreground mt-1">从属性库选择需要的SKU属性列</p>
              </div>
              <button onClick={() => setShowAttrPicker(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current attrs */}
            <div className="px-5 py-3 border-b border-border/40">
              <div className="text-[11px] font-medium text-muted-foreground mb-2">当前属性列</div>
              <div className="flex flex-wrap gap-2">
                {skuAttrDefs.map((attr) => (
                  <span key={attr.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] border border-border/40 bg-muted/20">
                    {attr.name}
                    {attr.isModelAttr && <span className="w-1.5 h-1.5 rounded-full bg-primary/60" title="模型属性" />}
                    <button onClick={() => removeAttrDef(attr.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Library */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-[11px] font-medium text-muted-foreground mb-2">属性库</div>
              {ATTR_LIBRARY.filter((a) => !skuAttrDefs.some((d) => d.id === a.id)).map((attr) => (
                <div
                  key={attr.id}
                  onClick={() => addAttrDef(attr)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer hover:border-primary/30 hover:bg-muted/20 transition-all"
                >
                  <div className="flex-1">
                    <span className="text-[13px] text-foreground">{attr.name}</span>
                    {attr.isModelAttr && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/8 text-primary">模型属性</span>
                    )}
                  </div>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground/40" />
                </div>
              ))}
              {ATTR_LIBRARY.filter((a) => !skuAttrDefs.some((d) => d.id === a.id)).length === 0 && (
                <div className="text-center py-6 text-[12px] text-muted-foreground">所有属性已添加</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Shared Layout Components
   ══════════════════════════════════════════════════ */

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
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

/** Two-column grid wrapper */
function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">{children}</div>;
}

function FormRow({ label, required, children, span }: { label: string; required?: boolean; children: React.ReactNode; span?: number }) {
  return (
    <div className={cn("flex items-start gap-3", span === 2 && "col-span-2")}>
      <label className="text-[13px] text-muted-foreground pt-2 text-right shrink-0" style={{ width: "var(--form-label-width)" }}>
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function UploadCard({ label, size = "md", icon: Icon = Upload, onClick }: { label: string; size?: "sm" | "md"; icon?: any; onClick?: () => void }) {
  const s = size === "sm" ? "w-20 h-20" : "w-24 h-24";
  return (
    <div onClick={onClick} className={`${s} rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors`}>
      <Icon className="h-4 w-4" />
      <span className="text-[10px]">{label}</span>
    </div>
  );
}

function UploadedThumb({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) {
  return (
    <div className="relative w-20 h-20 rounded-xl border border-border/40 bg-muted/20 overflow-hidden group">
      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
        {file.type === "video" ? <Play className="h-6 w-6" /> : <Image className="h-6 w-6" />}
      </div>
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3 text-white" />
      </button>
      <div className="absolute bottom-0 inset-x-0 bg-black/40 px-1 py-0.5 text-center">
        <span className="text-[9px] text-white truncate block">{file.name}</span>
      </div>
    </div>
  );
}
