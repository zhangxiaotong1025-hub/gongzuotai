import { useState, useRef, useEffect, ReactNode } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleActions = actions.filter((a) => !a.visible || a.visible(record));
  const shown = visibleActions.slice(0, maxVisible);
  const overflow = visibleActions.slice(maxVisible);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

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
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {open && (
            <div
              className="absolute right-0 top-full mt-1 bg-card border rounded-lg py-1 z-50 min-w-[140px]"
              style={{ boxShadow: 'var(--shadow-md)' }}
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
            </div>
          )}
        </div>
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
