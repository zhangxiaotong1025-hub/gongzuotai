import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface TableColumn<T> {
  key: string;
  title: ReactNode;
  width?: number;
  minWidth?: number;
  align?: "left" | "center" | "right";
  render?: (value: any, record: T, index: number) => ReactNode;
}

export interface ActionItem<T> {
  label: string | ((record: T) => string);
  onClick: (record: T) => void;
  visible?: (record: T) => boolean;
  danger?: boolean;
  confirm?: {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
}

function resolveLabel<T>(label: string | ((record: T) => string), record: T): string {
  return typeof label === "function" ? label(record) : label;
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
  const [pendingAction, setPendingAction] = useState<ActionItem<T> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const visibleActions = actions.filter((a) => !a.visible || a.visible(record));
  const shown = visibleActions.slice(0, maxVisible);
  const overflow = visibleActions.slice(maxVisible);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [open, closeMenu]);

  const handleActionClick = (action: ActionItem<T>) => {
    closeMenu();
    if (action.confirm) {
      setPendingAction(action);
      return;
    }
    action.onClick(record);
  };

  const handleConfirm = () => {
    if (!pendingAction) return;
    pendingAction.onClick(record);
    setPendingAction(null);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {shown.map((action, i) => {
          const lbl = resolveLabel(action.label, record);
          return (
            <button
              key={lbl + i}
              type="button"
              onClick={() => handleActionClick(action)}
              className={`btn-text ${action.danger ? "text-danger-action" : "text-primary-action"}`}
            >
              {lbl}
            </button>
          );
        })}
        {overflow.length > 0 && (
          <>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => {
                if (open) {
                  closeMenu();
                  return;
                }
                if (triggerRef.current) {
                  const rect = triggerRef.current.getBoundingClientRect();
                  setMenuPos({ top: rect.bottom + 6, left: rect.right });
                }
                setOpen(true);
              }}
              className="admin-action-trigger"
              data-state={open ? "open" : "closed"}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {open &&
              createPortal(
                <div
                  ref={menuRef}
                  className="admin-action-menu"
                  data-state="open"
                  style={{
                    top: menuPos.top,
                    left: menuPos.left,
                    transform: "translateX(calc(-100% + 2px))",
                  }}
                >
                  {overflow.map((action, i) => {
                    const lbl = resolveLabel(action.label, record);
                    return (
                      <button
                        key={lbl + i}
                        type="button"
                        onClick={() => handleActionClick(action)}
                        className={`admin-action-menu-item ${action.danger ? "admin-action-menu-item-danger" : ""}`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>,
                document.body,
              )}
          </>
        )}
      </div>

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setPendingAction(null);
        }}
      >
        <AlertDialogContent
          className="max-w-[420px] overflow-hidden rounded-xl border bg-card p-0"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="border-b bg-muted/40 px-5 py-4">
            <AlertDialogTitle className="text-[15px] font-semibold text-foreground">
              {pendingAction?.confirm?.title || `确认${resolveLabel(pendingAction?.label || "", record)}该企业？`}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-1 text-[13px] leading-6 text-muted-foreground">
              {pendingAction?.confirm?.description || "该操作执行后将立即生效，请确认是否继续。"}
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="gap-2 px-5 py-4">
            <AlertDialogCancel className="mt-0 h-9 rounded-lg px-4 text-[13px]">
              {pendingAction?.confirm?.cancelLabel || "取消"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={`h-9 rounded-lg px-4 text-[13px] ${pendingAction?.danger ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
            >
              {pendingAction?.confirm?.confirmLabel || `确认${resolveLabel(pendingAction?.label || "", record)}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
