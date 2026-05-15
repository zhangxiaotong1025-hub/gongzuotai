import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck, Plus, X, Search, Trash2, KeyRound, Lock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAuth, isSuperAdmin } from "@/hooks/useAuth";

interface PlatformAdmin {
  id: string;
  name: string;
  phone: string;
  level: "super" | "admin";
  createdAt: string;
  createdBy: string;
}

const INITIAL_ADMINS: PlatformAdmin[] = [
  { id: "PA001", name: "程女士", phone: "13800138000", level: "super", createdAt: "2024-01-12", createdBy: "系统初始化" },
  { id: "PA002", name: "运维-周凯", phone: "13811112222", level: "admin", createdAt: "2024-09-08", createdBy: "程女士" },
];

export default function PlatformAdminList() {
  const { user } = useAuth();
  const allowed = isSuperAdmin(user);

  const [list, setList] = useState<PlatformAdmin[]>(INITIAL_ADMINS);
  const [keyword, setKeyword] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", level: "admin" as "super" | "admin" });

  const filtered = useMemo(
    () => list.filter((a) => !keyword || a.name.includes(keyword) || a.phone.includes(keyword)),
    [list, keyword]
  );

  if (!allowed) {
    // 入口仅对指定账号开放，非授权账号直接重定向，避免直接访问 URL 进入
    return <Navigate to="/permission/role" replace />;
  }

  const submit = () => {
    if (!form.name.trim()) return toast.error("请输入姓名");
    if (!/^1[3-9]\d{9}$/.test(form.phone)) return toast.error("请输入正确的手机号");
    if (list.some((a) => a.phone === form.phone)) return toast.error("该手机号已是平台管理员");
    setList((prev) => [
      {
        id: `PA${String(prev.length + 1).padStart(3, "0")}`,
        name: form.name.trim(),
        phone: form.phone,
        level: form.level,
        createdAt: new Date().toISOString().slice(0, 10),
        createdBy: user?.name || "—",
      },
      ...prev,
    ]);
    toast.success("平台管理员创建成功");
    setShowCreate(false);
    setForm({ name: "", phone: "", level: "admin" });
  };

  const remove = (a: PlatformAdmin) => {
    if (a.level === "super") return toast.error("超级管理员不可移除");
    if (!confirm(`确定移除平台管理员 ${a.name}（${a.phone}）？`)) return;
    setList((prev) => prev.filter((x) => x.id !== a.id));
    toast.success("已移除");
  };

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="平台管理员"
        subtitle="独立于人员管理的高敏感配置，入口仅对指定超级管理员开放，普通角色不可设置。"
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            创建平台管理员
          </button>
        }
      />

      {/* 安全提示横幅 */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <Lock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <div className="text-[12.5px] text-foreground/85 leading-relaxed">
          平台管理员拥有跨企业、跨业务的最高级权限。
          <span className="text-amber-600 font-medium">本页操作不会出现在「人员管理」中</span>，
          也不可通过角色管理页配置；仅当前登录账号为白名单超级管理员时可见。
        </div>
      </div>

      {/* 搜索 */}
      <div className="bg-card rounded-2xl border border-border/70 p-4" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索姓名 / 手机号"
            className="h-9 w-full pl-8 pr-3 rounded-lg border border-input bg-card text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <AdminTable
        columns={[
          { key: "name", title: "姓名", render: (r: PlatformAdmin) => (
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${r.level === "super" ? "text-amber-500" : "text-primary"}`} />
              <span className="text-[13px] text-foreground">{r.name}</span>
            </div>
          )},
          { key: "phone", title: "手机号", render: (r: PlatformAdmin) => <span className="text-[13px] font-mono text-foreground">{r.phone}</span> },
          { key: "level", title: "级别", render: (r: PlatformAdmin) => (
            <span className={`inline-flex items-center gap-1 px-2 h-[22px] rounded-full text-[12px] ${
              r.level === "super"
                ? "bg-amber-500/10 text-amber-600"
                : "bg-primary/10 text-primary"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${r.level === "super" ? "bg-amber-500" : "bg-primary"}`} />
              {r.level === "super" ? "超级管理员" : "平台管理员"}
            </span>
          )},
          { key: "createdAt", title: "创建时间", render: (r: PlatformAdmin) => <span className="text-[13px] text-muted-foreground">{r.createdAt}</span> },
          { key: "createdBy", title: "创建人", render: (r: PlatformAdmin) => <span className="text-[13px] text-muted-foreground">{r.createdBy}</span> },
          { key: "_actions", title: "操作", width: 180, render: (r: PlatformAdmin) => (
            <div className="flex items-center gap-3">
              <button onClick={() => toast.success("已发送重置密码短信")} className="text-[13px] text-primary hover:underline inline-flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                重置密码
              </button>
              {r.level !== "super" && (
                <button onClick={() => remove(r)} className="text-[13px] text-destructive hover:underline inline-flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />
                  移除
                </button>
              )}
            </div>
          )},
        ] as any}
        data={filtered}
        rowKey="id"
      />

      {/* 创建弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-[480px] rounded-xl border bg-card p-6" style={{ boxShadow: "var(--shadow-md)" }}>
            <button onClick={() => setShowCreate(false)} className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-[15px] font-semibold text-foreground">创建平台管理员</h2>
            <p className="text-[12.5px] text-muted-foreground mt-1 mb-5">该操作不会同步至任何企业人员列表，请谨慎授予。</p>
            <div className="space-y-4">
              <Field label="姓名" required>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="请输入姓名" maxLength={50}
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="手机号" required>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                  placeholder="将作为唯一登录账号" maxLength={11}
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="级别" required>
                <div className="flex gap-2">
                  {([
                    { v: "admin", label: "平台管理员", desc: "可管理跨企业配置" },
                    { v: "super", label: "超级管理员", desc: "可管理本页其他平台管理员" },
                  ] as const).map((opt) => (
                    <button key={opt.v} type="button" onClick={() => setForm({ ...form, level: opt.v })}
                      className={`flex-1 text-left p-3 rounded-lg border-2 transition ${
                        form.level === opt.v ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                      }`}>
                      <div className="text-[13px] font-medium text-foreground">{opt.label}</div>
                      <div className="text-[11.5px] text-muted-foreground mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreate(false)} className="h-9 px-4 rounded-lg border border-input text-[13px] hover:bg-muted">取消</button>
              <button onClick={submit} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90">确定创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <label className="w-[72px] shrink-0 text-right text-[13px] text-muted-foreground pt-2">
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
}
