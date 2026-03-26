import { useState, useEffect } from "react";
import { Building2, Store, Landmark, Briefcase, ShoppingBag, HardHat, X } from "lucide-react";

const ALL_ENTERPRISE_TYPES = [
  { key: "mall", label: "卖场", icon: ShoppingBag, desc: "大型零售卖场，可拥有或代理品牌" },
  { key: "brand", label: "品牌商", icon: Building2, desc: "品牌拥有者，可创建或代理品牌" },
  { key: "dealer", label: "经销商", icon: Store, desc: "品牌代理商，代理品牌销售" },
  { key: "decoration", label: "装修公司", icon: HardHat, desc: "提供装修设计服务" },
  { key: "studio", label: "工作室", icon: Briefcase, desc: "独立设计工作室" },
  { key: "store", label: "门店", icon: Landmark, desc: "零售门店" },
];

interface CreateEnterpriseDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  title?: string;
  subtitle?: string;
  allowedTypes?: string[];
  defaultType?: string;
}

export function CreateEnterpriseDialog({ open, onClose, onSelect, title, subtitle, allowedTypes, defaultType }: CreateEnterpriseDialogProps) {
  const [selected, setSelected] = useState<string | null>(defaultType || null);

  useEffect(() => {
    if (open) setSelected(defaultType || null);
  }, [open, defaultType]);

  if (!open) return null;

  const types = allowedTypes
    ? ALL_ENTERPRISE_TYPES.filter((t) => allowedTypes.includes(t.key))
    : ALL_ENTERPRISE_TYPES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Dialog */}
      <div
        className="relative w-full max-w-[560px] rounded-xl border bg-card p-6 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <h2 className="text-lg font-semibold text-foreground">{title || "新建企业"}</h2>
        <p className="text-[13px] text-muted-foreground mt-1 mb-6">{subtitle || "请选择所创建企业类型"}</p>

        {/* Type cards */}
        <div className={`grid gap-3 ${types.length <= 3 ? "grid-cols-3" : types.length <= 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {types.map((type) => {
            const isSelected = selected === type.key;
            return (
              <button
                key={type.key}
                onClick={() => setSelected(type.key)}
                className={`flex flex-col items-center gap-2 p-5 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
                }`}
              >
                <type.icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[13px] font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary">取消</button>
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
