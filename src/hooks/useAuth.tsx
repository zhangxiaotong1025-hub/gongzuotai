import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Enterprise {
  id: string;
  name: string;
  type: string;
  logo?: string;
}

export type Perspective = "platform" | "enterprise";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  role: string;
  perspective: Perspective; // 由登录账号决定：平台后台 / 企业后台
  enterprises: Enterprise[];
  currentEnterprise: Enterprise | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, method: "sms" | "password", credential: string) => Promise<{ needSelectEnterprise: boolean; enterprises: Enterprise[] }>;
  logout: () => void;
  selectEnterprise: (enterprise: Enterprise) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  resetPasswordForUser: (userId: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock data
const PLATFORM_ENTERPRISE: Enterprise = { id: "ent-platform", name: "居然设计家平台", type: "平台" };
const MOCK_ENTERPRISES: Enterprise[] = [
  { id: "ent-1", name: "居然设计家总部", type: "品牌商" },
  { id: "ent-2", name: "居然之家北四环店", type: "卖场" },
  { id: "ent-3", name: "居然之家丽泽店", type: "门店" },
];

/** Mock 演示账号：
 *  - 平台管理员：13800138000 / 密码 admin123 / 验证码 1234
 *  - 企业管理员：13900139000 / 密码 admin123 / 验证码 1234
 */
const PLATFORM_ADMIN_PHONE = "13800138000";
const ENTERPRISE_ADMIN_PHONE = "13900139000";

const MOCK_USER_BASE = {
  id: "user-1",
  name: "程女士",
  avatar: undefined as string | undefined,
};

// Phones that trigger multi-enterprise selection（企业管理员可能归属多家企业）
const MULTI_ENTERPRISE_PHONES = [ENTERPRISE_ADMIN_PHONE];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (phone: string, method: "sms" | "password", credential: string) => {
    setLoading(true);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));

    if (method === "sms" && credential !== "1234") {
      setLoading(false);
      throw new Error("验证码错误");
    }
    if (method === "password" && credential !== "admin123") {
      setLoading(false);
      throw new Error("密码错误");
    }

    const needSelect = MULTI_ENTERPRISE_PHONES.includes(phone);
    const enterprises = needSelect ? MOCK_ENTERPRISES : [MOCK_ENTERPRISES[0]];

    if (!needSelect) {
      const u: AuthUser = { ...MOCK_USER, phone, enterprises, currentEnterprise: enterprises[0] };
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u));
    }

    setLoading(false);
    return { needSelectEnterprise: needSelect, enterprises };
  }, []);

  const selectEnterprise = useCallback((enterprise: Enterprise) => {
    const u: AuthUser = { ...MOCK_USER, currentEnterprise: enterprise, enterprises: MOCK_ENTERPRISES };
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("auth_user");
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (oldPassword !== "admin123") throw new Error("原密码错误");
    // Mock success
  }, []);

  const resetPasswordForUser = useCallback(async (_userId: string, _newPassword: string) => {
    await new Promise((r) => setTimeout(r, 600));
    // Mock success
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        selectEnterprise,
        changePassword,
        resetPasswordForUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
