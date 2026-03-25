/**
 * 分页组件规范：
 * 1. 显示总条数
 * 2. 每页条数选择
 * 3. 页码导航（首/末/省略号）
 * 4. 跳转输入
 */

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  current,
  total,
  pageSize,
  pageSizeOptions = [20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t text-xs">
      <span className="text-muted-foreground">
        共 <span className="text-foreground font-medium">{total}</span> 条
      </span>
      <div className="flex items-center gap-1.5">
        <select
          className="filter-select text-xs h-7"
          style={{ width: 88 }}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>
              {s}条/页
            </option>
          ))}
        </select>

        <button
          className="pagination-btn"
          disabled={current === 1}
          onClick={() => onPageChange(current - 1)}
        >
          ‹
        </button>

        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={`d${i}`} className="text-muted-foreground px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`pagination-btn ${
                current === p ? "bg-primary text-primary-foreground border-primary" : ""
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          className="pagination-btn"
          disabled={current === totalPages}
          onClick={() => onPageChange(current + 1)}
        >
          ›
        </button>

        <span className="text-muted-foreground ml-2">前往</span>
        <input
          type="text"
          className="filter-input w-12 h-7 text-xs text-center"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = parseInt((e.target as HTMLInputElement).value);
              if (val >= 1 && val <= totalPages) {
                onPageChange(val);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
        />
        <span className="text-muted-foreground">页</span>
      </div>
    </div>
  );
}
