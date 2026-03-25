import { useState, ReactNode } from "react";
import { Search, RotateCcw, ChevronDown } from "lucide-react";

export interface FilterField {
  key: string;
  label: string;
  type: "input" | "select" | "date";
  placeholder?: string;
  options?: { label: string; value: string }[];
  width?: number;
}

interface FilterBarProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  maxVisible?: number;
  extra?: ReactNode;
}

export function FilterBar({
  fields,
  values,
  onChange,
  onSearch,
  onReset,
  maxVisible = 4,
  extra,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleFields = expanded ? fields : fields.slice(0, maxVisible);
  const hasMore = fields.length > maxVisible;

  const renderField = (field: FilterField) => {
    const w = field.width || 160;
    switch (field.type) {
      case "select":
        return (
          <select
            className="filter-select"
            style={{ width: w }}
            value={values[field.key] || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          >
            <option value="">{field.placeholder || "全部"}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case "date":
        return (
          <input
            type="date"
            className="filter-input"
            style={{ width: w }}
            value={values[field.key] || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
      default:
        return (
          <input
            type="text"
            className="filter-input"
            style={{ width: w }}
            placeholder={field.placeholder || "请输入"}
            value={values[field.key] || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="bg-card rounded-xl border p-4 mb-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        {visibleFields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">{field.label}</label>
            {renderField(field)}
          </div>
        ))}

        <div className="flex items-center gap-2 ml-auto">
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn-ghost text-primary text-[13px]"
            >
              {expanded ? "收起" : "展开"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
          <button onClick={onSearch} className="btn-primary">
            <Search className="h-3.5 w-3.5" />
            查询
          </button>
          <button onClick={onReset} className="btn-ghost">
            <RotateCcw className="h-3.5 w-3.5" />
            重置
          </button>
          {extra}
        </div>
      </div>
    </div>
  );
}
