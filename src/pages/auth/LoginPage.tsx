import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, Enterprise } from "@/hooks/useAuth";
import { Phone, Lock, MessageSquare, KeyRound, ChevronRight, Building2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type LoginMethod = "sms" | "password";

export default function LoginPage() {
  const { login, selectEnterprise, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [method, setMethod] = useState<LoginMethod>("sms");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Enterprise selection state
  const [showEnterpriseSelect, setShowEnterpriseSelect] = useState(false);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendSms = () => {
    if (!phone || phone.length !== 11) {
      toast({ title: "请输入正确的手机号", variant: "destructive" });
      return;
    }
    setCountdown(60);
    toast({ title: "验证码已发送", description: "Mock 验证码为 1234" });
  };

  const handleSubmit = async () => {
    if (!phone || phone.length !== 11) {
      toast({ title: "请输入正确的手机号", variant: "destructive" });
      return;
    }
    const credential = method === "sms" ? smsCode : password;
    if (!credential) {
      toast({ title: method === "sms" ? "请输入验证码" : "请输入密码", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(phone, method, credential);
      if (result.needSelectEnterprise) {
        setEnterprises(result.enterprises);
        setShowEnterpriseSelect(true);
      } else {
        navigate("/", { replace: true });
      }
    } catch (e: any) {
      toast({ title: "登录失败", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectEnterprise = (ent: Enterprise) => {
    selectEnterprise(ent);
    navigate("/", { replace: true });
  };

  // Enterprise selection screen
  if (showEnterpriseSelect) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
        <div className="w-full max-w-md mx-4">
          <div className="rounded-2xl border border-border/60 p-8" style={{ background: "hsl(var(--card))", boxShadow: "var(--shadow-card)" }}>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))" }}>
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">选择企业</h2>
              <p className="text-sm text-muted-foreground mt-1">您的账号归属于多个企业，请选择要进入的企业</p>
            </div>
            <div className="space-y-3">
              {enterprises.map((ent) => (
                <button
                  key={ent.id}
                  onClick={() => handleSelectEnterprise(ent)}
                  className="w-full flex items-center gap-4 rounded-xl border border-border/60 p-4 hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--muted))" }}>
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{ent.name}</div>
                    <div className="text-xs text-muted-foreground">{ent.type}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
      <div className="w-full max-w-md mx-4">
        <div className="rounded-2xl border border-border/60 p-8" style={{ background: "hsl(var(--card))", boxShadow: "var(--shadow-card)" }}>
          {/* Logo & title */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))" }}
            >
              <span className="text-primary-foreground font-bold text-xl">G</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">管理后台</h1>
            <p className="text-sm text-muted-foreground mt-1">欢迎回来，请登录您的账号</p>
          </div>

          {/* Method tabs */}
          <div className="flex rounded-lg p-1 mb-6" style={{ background: "hsl(var(--muted))" }}>
            {([
              { key: "sms" as LoginMethod, label: "验证码登录", icon: MessageSquare },
              { key: "password" as LoginMethod, label: "密码登录", icon: KeyRound },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setMethod(key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[13px] font-medium transition-all",
                  method === key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Phone input */}
          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className="pl-10 h-11"
                maxLength={11}
              />
            </div>

            {method === "sms" ? (
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="请输入验证码"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="pl-10 pr-24 h-11"
                  maxLength={6}
                />
                <button
                  onClick={sendSms}
                  disabled={countdown > 0}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[13px] font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                >
                  {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
                </button>
              </div>
            ) : (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-11 text-sm font-medium"
            >
              {submitting ? "登录中..." : "登 录"}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Mock 提示：验证码 <code className="text-foreground bg-muted px-1 rounded">1234</code>，密码 <code className="text-foreground bg-muted px-1 rounded">admin123</code>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              手机号 <code className="text-foreground bg-muted px-1 rounded">13800138000</code> 触发多企业选择
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
