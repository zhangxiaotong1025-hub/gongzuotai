import { useState, ReactNode } from "react";
import { Search, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

/**
 * 筛选器规范：
 * 1. 默认显示一行筛选项（最多4个）
 * 2. 超出的筛选项折叠在「展开」中
 * 3. 查询/重置按钮始终在右侧
 * 4. 圆角卡片容器，统一间距
 */

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
    switch (field.type) {
      case "select":
        return (
          <select
            className="filter-select"
            style={{ width: field.width || 140 }}
            value={values[field.key] || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          >
            <option value="">{field.placeholder || "请选择"}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "date":
        return (
          <input
            type="date"
            className="filter-input"
            style={{ width: field.width || 160 }}
            value={values[field.key] || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
      default:
        return (
          <input
            type="text"
            className="filter-input"
            style={{ width: field.width || 160 }}
            placeholder={field.placeholder || "请输入"}
            value={values[field.key] || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="bg-card rounded-lg border p-4 mb-4">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        {visibleFields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">{field.label}</label>
            {renderField(field)}
          </div>
        ))}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="h-8 px-3 text-xs text-primary hover:bg-primary/5 rounded-md transition-colors flex items-center gap-1"
            >
              {expanded ? "收起" : "展开"}
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
          <button
            onClick={onSearch}
            className="h-8 px-5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            查询
          </button>
          <button
            onClick={onReset}
            className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重置
          </button>
          {extra}
        </div>
      </div>
    </div>
  );
}
