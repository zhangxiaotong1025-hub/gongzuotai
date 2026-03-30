import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Box, Star, Settings, Layers, Puzzle, ShoppingBag, History, ChevronRight } from "lucide-react";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { modelSpuData, type ModelSpu, type ShelfStatus, type AuditStatus } from "@/data/model";

const shelfLabel: Record<ShelfStatus, string> = { PENDING: "待上架", ON_SHELF: "已上架", OFF_SHELF: "已下架" };
const shelfBadge: Record<ShelfStatus, string> = { PENDING: "badge-warning", ON_SHELF: "badge-active", OFF_SHELF: "badge-inactive" };
const auditLabel: Record<AuditStatus, string> = { PENDING: "待审核", APPROVED: "已通过", REJECTED: "已拒绝", NONE: "—" };
const auditBadge: Record<AuditStatus, string> = { PENDING: "badge-warning", APPROVED: "badge-active", REJECTED: "badge-danger", NONE: "badge-muted" };
const libraryLabel = { PUBLIC: "公有库", BRAND: "品牌库", PRIVATE: "私有库" };

const tabs = [
  { key: "basic", label: "基本信息", icon: Box },
  { key: "component", label: "部件结构", icon: Puzzle },
  { key: "param", label: "参数配置", icon: Settings },
  { key: "sku", label: "模型属性", icon: Layers },
  { key: "product", label: "关联商品", icon: ShoppingBag },
];

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-border/20 last:border-0">
      <span className="text-muted-foreground text-[13px] shrink-0 w-24 text-right">{label}</span>
      <span className={`text-foreground text-[13px] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  return `${(bytes / 1048576).toFixed(0)} MB`;
}

export default function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "basic";
  const [activeTab, setActiveTab] = useState(initialTab);

  const spu = modelSpuData.find((s) => s.id === id);
  if (!spu) return <div className="p-8 text-center text-muted-foreground">模型不存在</div>;

  const allIds = modelSpuData.map((s) => s.id);
  const curIdx = allIds.indexOf(id!);

  const paramTypeLabel: Record<string, string> = { MATERIAL: "材质", COLOR: "颜色", DIMENSION: "尺寸", VISIBILITY: "可见性" };
  const valueTypeLabel: Record<string, string> = { ENUM: "枚举", RANGE: "范围", BOOLEAN: "布尔" };

  return (
    <div>
      <DetailActionBar
        backLabel="模型管理"
        backPath="/model"
        currentName={spu.spuName}
        prevPath={curIdx > 0 ? `/model/detail/${allIds[curIdx - 1]}` : null}
        nextPath={curIdx < allIds.length - 1 ? `/model/detail/${allIds[curIdx + 1]}` : null}
        statusToggle={{
          currentActive: spu.status === "ON_SHELF",
          activeLabel: "已上架",
          inactiveLabel: spu.status === "OFF_SHELF" ? "已下架" : "待上架",
          onToggle: () => {},
        }}
        onEdit={() => navigate(`/model/create?edit=${id}`)}
      />

      {/* Tab nav */}
      <div className="mt-4 mb-6 border-b border-border/60">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] border-b-2 transition-all ${
                activeTab === tab.key
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.key === "sku" && <span className="ml-1 text-[11px] text-muted-foreground">({spu.skuCount})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "basic" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
            <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-primary/8 flex items-center justify-center"><Box className="h-3 w-3 text-primary" /></div>
              基础信息
            </h3>
            <InfoRow label="模型名称" value={spu.spuName} />
            <InfoRow label="模型编码" value={spu.spuCode} mono />
            <InfoRow label="库类型" value={libraryLabel[spu.usageScope]} />
            <InfoRow label="品牌" value={spu.brandName} />
            <InfoRow label="后台分类" value={spu.backendCategoryName} />
            <InfoRow label="标签" value={spu.tags.join("、") || "—"} />
            <InfoRow label="描述" value={spu.description || "—"} />
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary/8 flex items-center justify-center"><Settings className="h-3 w-3 text-primary" /></div>
                文件信息
              </h3>
              <InfoRow label="文件格式" value={spu.sourceFileFormat} mono />
              <InfoRow label="文件大小" value={formatFileSize(spu.sourceFileSize)} />
              <InfoRow label="面数" value={spu.polygonCount.toLocaleString()} />
              <InfoRow label="部件数量" value={`${spu.componentCount} 个`} />
              <InfoRow label="基础尺寸" value={`${spu.baseWidth} × ${spu.baseDepth} × ${spu.baseHeight} mm`} />
            </div>
            <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary/8 flex items-center justify-center"><History className="h-3 w-3 text-primary" /></div>
                状态 & 版本
              </h3>
              <div className="flex items-start gap-2 py-2.5 border-b border-border/20">
                <span className="text-muted-foreground text-[13px] shrink-0 w-24 text-right">上架状态</span>
                <span className={shelfBadge[spu.status]}>{shelfLabel[spu.status]}</span>
              </div>
              {spu.publicStatus !== "NONE" && (
                <div className="flex items-start gap-2 py-2.5 border-b border-border/20">
                  <span className="text-muted-foreground text-[13px] shrink-0 w-24 text-right">审核状态</span>
                  <span className={auditBadge[spu.publicStatus]}>{auditLabel[spu.publicStatus]}</span>
                </div>
              )}
              <InfoRow label="当前版本" value={spu.currentVersion} mono />
              <InfoRow label="创建时间" value={spu.createdAt} />
              <InfoRow label="更新时间" value={spu.updatedAt} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "component" && (
        <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>部件编码</th>
                <th>部件名称</th>
                <th>部件类型</th>
                <th>排序</th>
              </tr>
            </thead>
            <tbody>
              {spu.components.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 border-b font-mono text-[13px]">{c.componentCode}</td>
                  <td className="px-4 py-3 border-b">{c.componentName}</td>
                  <td className="px-4 py-3 border-b"><span className="badge-product">{c.componentType}</span></td>
                  <td className="px-4 py-3 border-b text-muted-foreground">{c.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "param" && (
        <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>参数编码</th>
                <th>参数名称</th>
                <th>所属部件</th>
                <th>参数类型</th>
                <th>值类型</th>
                <th>SKU定义</th>
                <th>选项/范围</th>
              </tr>
            </thead>
            <tbody>
              {spu.params.map((p) => {
                const comp = spu.components.find((c) => c.id === p.componentId);
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 border-b font-mono text-[13px]">{p.paramCode}</td>
                    <td className="px-4 py-3 border-b font-medium">{p.paramName}</td>
                    <td className="px-4 py-3 border-b text-muted-foreground">{comp?.componentName || "—"}</td>
                    <td className="px-4 py-3 border-b"><span className="badge-product">{paramTypeLabel[p.paramType]}</span></td>
                    <td className="px-4 py-3 border-b"><span className="badge-muted">{valueTypeLabel[p.valueType]}</span></td>
                    <td className="px-4 py-3 border-b">{p.isSkuDefining ? <span className="badge-active">是</span> : <span className="badge-inactive">否</span>}</td>
                    <td className="px-4 py-3 border-b">
                      {p.options ? (
                        <div className="flex flex-wrap gap-1">
                          {p.options.map((o) => (
                            <span key={o.id} className="inline-flex items-center gap-1 badge-product">
                              {o.colorHex && <span className="w-2.5 h-2.5 rounded-full border border-border/40" style={{ background: o.colorHex }} />}
                              {o.optionName}
                            </span>
                          ))}
                        </div>
                      ) : p.rangeConfig ? (
                        <span className="text-[12px] text-muted-foreground">
                          {p.rangeConfig.minValue}~{p.rangeConfig.maxValue} {p.rangeConfig.unit}（步长 {p.rangeConfig.step}）
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">布尔值</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "sku" && (
        <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">共 {spu.skus.length} 个SKU</span>
            <div className="flex gap-2">
              <button className="btn-secondary text-[12px] h-8 px-3">批量生成</button>
              <button className="btn-primary text-[12px] h-8 px-3">手动创建</button>
            </div>
          </div>
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>SKU信息</th>
                <th>参数快照</th>
                <th>默认</th>
                <th>上架状态</th>
                <th>创建时间</th>
                <th className="sticky right-0 action-header" style={{ width: 160 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {spu.skus.map((sku) => (
                <tr key={sku.id}>
                  <td className="px-4 py-3 border-b">
                    <div>
                      <div className="font-medium">{sku.skuName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{sku.skuCode}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(sku.paramSnapshot).map(([k, v]) => (
                        <span key={k} className="badge-product">{k}: {v}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b">
                    {sku.isDefault && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "hsl(var(--warning) / 0.1)", color: "hsl(var(--warning))" }}>
                        <Star className="h-2.5 w-2.5" />默认
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b"><span className={shelfBadge[sku.status]}>{shelfLabel[sku.status]}</span></td>
                  <td className="px-4 py-3 border-b text-muted-foreground">{sku.createdAt}</td>
                  <td className="px-4 py-3 border-b sticky right-0 action-cell" style={{ width: 160 }}>
                    <div className="flex items-center gap-1">
                      <button className="btn-text text-primary-action">编辑</button>
                      <button className="btn-text text-primary-action">{sku.status === "ON_SHELF" ? "下架" : "上架"}</button>
                      {!sku.isDefault && <button className="btn-text text-primary-action">设为默认</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "product" && (
        <div className="bg-card rounded-xl border p-8 text-center" style={{ boxShadow: "var(--shadow-sm)" }}>
          <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[13px] text-muted-foreground mb-1">展示引用该模型SKU的商品列表</p>
          <p className="text-[12px] text-muted-foreground/60">暂无商品引用（Mock数据）</p>
        </div>
      )}
    </div>
  );
}
