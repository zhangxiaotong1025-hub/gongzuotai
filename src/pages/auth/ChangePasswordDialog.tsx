import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Admin mode: reset password for another user */
  targetUserId?: string;
  targetUserName?: string;
}

export default function ChangePasswordDialog({ open, onOpenChange, targetUserId, targetUserName }: Props) {
  const { changePassword, resetPasswordForUser } = useAuth();
  const { toast } = useToast();
  const isAdminReset = !!targetUserId;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
  };

  const handleSubmit = async () => {
    if (!isAdminReset && !oldPassword) {
      toast({ title: "请输入原密码", variant: "destructive" });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "新密码至少6位", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "两次密码输入不一致", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (isAdminReset) {
        await resetPasswordForUser(targetUserId!, newPassword);
        toast({ title: `已为 ${targetUserName} 重置密码`, description: "新密码已生效，请告知该员工使用新密码登录" });
      } else {
        await changePassword(oldPassword, newPassword);
        toast({ title: "密码修改成功", description: "已自动保持当前登录状态，无需重新登录" });
      }
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "操作失败", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isAdminReset ? `重置密码 - ${targetUserName}` : "修改密码"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {!isAdminReset && (
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">原密码</label>
              <div className="relative">
                <Input
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="请输入原密码"
                  className="pr-10"
                />
                <button onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">新密码</label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="至少6位"
                className="pr-10"
              />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">确认新密码</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入新密码"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { reset(); onOpenChange(false); }}>取消</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "提交中..." : "确认"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
