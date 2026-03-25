import { ReactNode } from "react";

/**
 * 页头规范：
 * 1. 左侧：页面标题 + 副标题/统计
 * 2. 右侧：操作按钮区域
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
