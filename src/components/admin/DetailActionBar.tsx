import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil, Copy, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

interface DetailActionBarProps {
  /** 面包屑返回文字 */
  backLabel: string;
  /** 返回路由 */
  backPath: string;
  /** 当前条目名称 */
  currentName: string;
  /** 上一条路径，null 表示已是第一条 */
  prevPath: string | null;
  /** 下一条路径，null 表示已是最后一条 */
  nextPath: string | null;
  /** 编辑回调 */
  onEdit?: () => void;
  /** 复制回调 */
  onCopy?: () => void;
  /** 状态切换相关 */
  statusToggle?: {
    currentActive: boolean;
    activeLabel?: string;   // 默认 "启用" / "上架"
    inactiveLabel?: string; // 默认 "停用" / "下架"
    onToggle: () => void;
  };
}

export function DetailActionBar({
  backLabel, backPath, currentName,
  prevPath, nextPath,
  onEdit, onCopy, statusToggle,
}: DetailActionBarProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate(backPath)} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
        </button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{currentName}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Prev / Next */}
        <div className="flex items-center border rounded-lg overflow-hidden mr-1">
          <button
            disabled={!prevPath}
            onClick={() => prevPath && navigate(prevPath)}
            className="px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="上一条"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-5 bg-border" />
          <button
            disabled={!nextPath}
            onClick={() => nextPath && navigate(nextPath)}
            className="px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="下一条"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {onEdit && (
          <button onClick={onEdit} className="btn-secondary text-[12px] py-1.5 px-3 gap-1.5">
            <Pencil className="h-3 w-3" /> 编辑
          </button>
        )}

        {onCopy && (
          <button onClick={onCopy} className="btn-secondary text-[12px] py-1.5 px-3 gap-1.5">
            <Copy className="h-3 w-3" /> 复制
          </button>
        )}

        {statusToggle && (
          <button
            onClick={statusToggle.onToggle}
            className={`text-[12px] py-1.5 px-3 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
              statusToggle.currentActive
                ? "text-destructive border-destructive/30 hover:bg-destructive/10"
                : "text-primary border-primary/30 hover:bg-primary/10"
            }`}
          >
            {statusToggle.currentActive
              ? <><ToggleRight className="h-3 w-3" /> {statusToggle.inactiveLabel || "停用"}</>
              : <><ToggleLeft className="h-3 w-3" /> {statusToggle.activeLabel || "启用"}</>
            }
          </button>
        )}
      </div>
    </div>
  );
}
