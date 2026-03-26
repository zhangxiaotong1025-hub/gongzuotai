import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

export interface TableColumn<T> {
  key: string;
  title: string;
  width?: number;
  minWidth?: number;
  align?: "left" | "center" | "right";
  render?: (value: any, record: T, index: number) => ReactNode;
}

export interface ActionItem<T> {
  label: string;
  onClick: (record: T) => void;
  visible?: (record: T) => boolean;
  danger?: boolean;
}

interface AdminTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (record: T) => string;
  actions?: ActionItem<T>[];
  maxVisibleActions?: number;
  actionColumnWidth?: number;
  expandable?: {
    childrenKey: string;
    expandedKeys: Set<string>;
    onToggle: (key: string) => void;
    indent?: number;
  };
  getLevel?: (record: T) => number;
}

function ActionCell<T>({
  record,
  actions,
  maxVisible,
}: {
  record: T;
  actions: ActionItem<T>[];
  maxVisible: number;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const visibleActions = actions.filter((a) => !a.visible || a.visible(record));
  const shown = visibleActions.slice(0, maxVisible);
  const overflow = visibleActions.slice(maxVisible);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.right,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", () => setOpen(false), true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", () => setOpen(false), true);
    };
  }, [open, updatePosition]);

  return (
    <div className="flex items-center gap-0.5">
      {shown.map((action) => (
        <button
          key={action.label}
          onClick={() => action.onClick(record)}
          className={`btn-text ${action.danger ? "text-danger-action" : "text-primary-action"}`}
        >
          {action.label}
        </button>
      ))}
      {overflow.length > 0 && (
        <>
          <button
            ref={triggerRef}
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {open && createPortal(
            <div
              ref={menuRef}
              className="fixed bg-card border rounded-lg py-1 z-[9999] min-w-[140px] animate-in fade-in-0 zoom-in-95 duration-100"
              style={{
                top: menuPos.top,
                left: menuPos.left,
                transform: "translateX(-100%)",
                boxShadow: "0 8px 24px -4px hsl(220 20% 10% / 0.12), 0 2px 8px -2px hsl(220 20% 10% / 0.08)",
              }}
            >
              {overflow.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    action.onClick(record);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                    action.danger
                      ? "text-destructive hover:bg-destructive/5"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}

export function AdminTable<T>({
  columns,
  data,
  rowKey,
  actions,
  maxVisibleActions = 2,
  actionColumnWidth = 180,
  expandable,
  getLevel,
}: AdminTableProps<T>) {
  const renderRows = (items: T[], level = 0): ReactNode[] => {
    const rows: ReactNode[] = [];
    for (const item of items) {
      const key = rowKey(item);
      const currentLevel = getLevel ? getLevel(item) : level;
      const hasChildren =
        expandable && (item as any)[expandable.childrenKey]?.length > 0;
      const isExpanded = expandable?.expandedKeys.has(key);

      rows.push(
        <tr key={key}>
          {columns.map((col, ci) => (
            <td
              key={col.key}
              className="px-4 py-3 border-b"
              style={{
                minWidth: col.minWidth,
                width: col.width,
                textAlign: col.align || "left",
              }}
            >
              {ci === 0 ? (
                <div
                  className="flex items-center"
                  style={{ paddingLeft: currentLevel * (expandable?.indent ?? 24) }}
                >
                  {expandable &&
                    (hasChildren ? (
                      <button
                        onClick={() => expandable.onToggle(key)}
                        className="mr-2 p-0.5 rounded hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <svg
                          className={`h-3.5 w-3.5 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    ) : (
                      <span className="w-[22px] mr-2" />
                    ))}
                  {col.render
                    ? col.render((item as any)[col.key], item, 0)
                    : (item as any)[col.key]}
                </div>
              ) : col.render ? (
                col.render((item as any)[col.key], item, 0)
              ) : (
                (item as any)[col.key]
              )}
            </td>
          ))}
          {actions && (
            <td
              className="px-4 py-3 border-b sticky right-0 action-cell"
              style={{ width: actionColumnWidth, minWidth: actionColumnWidth }}
            >
              <ActionCell
                record={item}
                actions={actions}
                maxVisible={maxVisibleActions}
              />
            </td>
          )}
        </tr>
      );

      if (isExpanded && hasChildren) {
        const children = (item as any)[expandable!.childrenKey] as T[];
        rows.push(
          ...renderRows(
            children.map((c: any) => ({ ...c, _level: currentLevel + 1 })),
            currentLevel + 1
          )
        );
      }
    }
    return rows;
  };

  return (
    <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="overflow-x-auto admin-table-scroll">
        <table className="admin-table w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    minWidth: col.minWidth,
                    width: col.width,
                    textAlign: col.align || "left",
                  }}
                >
                  {col.title}
                </th>
              ))}
              {actions && (
                <th
                  className="sticky right-0 action-header"
                  style={{ width: actionColumnWidth, minWidth: actionColumnWidth }}
                >
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody>{renderRows(data)}</tbody>
        </table>
      </div>
    </div>
  );
}
