import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import LoginPage from "./pages/auth/LoginPage";
import EnterpriseList from "./pages/enterprise/EnterpriseList";
import EnterpriseCreate from "./pages/enterprise/EnterpriseCreate";
import EnterpriseDetail from "./pages/enterprise/EnterpriseDetail";
import StaffList from "./pages/staff/StaffList";
import StaffDetail from "./pages/staff/StaffDetail";
import StaffCreate from "./pages/staff/StaffCreate";
import ApplicationList from "./pages/application/ApplicationList";
import ApplicationDetail from "./pages/application/ApplicationDetail";
import MenuList from "./pages/permission/MenuList";
import MenuCreate from "./pages/permission/MenuCreate";
import MenuDetail from "./pages/permission/MenuDetail";
import RoleList from "./pages/permission/RoleList";
import RoleCreate from "./pages/permission/RoleCreate";
import RoleDetail from "./pages/permission/RoleDetail";
import ResourceList from "./pages/permission/ResourceList";
import ResourceCreate from "./pages/permission/ResourceCreate";
import AppListPage from "./pages/entitlement/AppList";
import AppDetail from "./pages/entitlement/AppDetail";
import CapabilityList from "./pages/entitlement/CapabilityList";
import CapabilityDetail from "./pages/entitlement/CapabilityDetail";
import RuleList from "./pages/entitlement/RuleList";
import RuleDetail from "./pages/entitlement/RuleDetail";
import SkuList from "./pages/entitlement/SkuList";
import SkuDetail from "./pages/entitlement/SkuDetail";
import PackageList from "./pages/entitlement/PackageList";
import PackageDetail from "./pages/entitlement/PackageDetail";
import OrderList from "./pages/entitlement/OrderList";
import OrderDetail from "./pages/entitlement/OrderDetail";
import AccountList from "./pages/entitlement/AccountList";
import AccountDetail from "./pages/entitlement/AccountDetail";
import EntitlementDashboard from "./pages/entitlement/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/enterprise" replace />} />
        <Route path="/enterprise" element={<EnterpriseList />} />
        <Route path="/enterprise/create" element={<EnterpriseCreate />} />
        <Route path="/enterprise/detail/:id" element={<EnterpriseDetail />} />
        <Route path="/enterprise/staff" element={<StaffList />} />
        <Route path="/enterprise/staff/detail/:id" element={<StaffDetail />} />
        <Route path="/enterprise/staff/create" element={<StaffCreate />} />
        <Route path="/enterprise/apply" element={<ApplicationList />} />
        <Route path="/enterprise/apply/detail/:id" element={<ApplicationDetail />} />
        <Route path="/permission" element={<Navigate to="/permission/menu" replace />} />
        <Route path="/permission/menu" element={<MenuList />} />
        <Route path="/permission/menu/create" element={<MenuCreate />} />
        <Route path="/permission/menu/edit/:id" element={<MenuCreate />} />
        <Route path="/permission/menu/detail/:id" element={<MenuDetail />} />
        <Route path="/permission/role" element={<RoleList />} />
        <Route path="/permission/role/create" element={<RoleCreate />} />
        <Route path="/permission/role/edit/:id" element={<RoleCreate />} />
        <Route path="/permission/role/detail/:id" element={<RoleDetail />} />
        <Route path="/permission/resource" element={<ResourceList />} />
        <Route path="/permission/resource/create" element={<ResourceCreate />} />
        <Route path="/permission/resource/edit/:id" element={<ResourceCreate />} />
        <Route path="/entitlement/dashboard" element={<EntitlementDashboard />} />
        <Route path="/entitlement/app" element={<AppListPage />} />
        <Route path="/entitlement/app/detail/:id" element={<AppDetail />} />
        <Route path="/entitlement/capability" element={<CapabilityList />} />
        <Route path="/entitlement/capability/detail/:id" element={<CapabilityDetail />} />
        <Route path="/entitlement/rule" element={<RuleList />} />
        <Route path="/entitlement/rule/detail/:id" element={<RuleDetail />} />
        <Route path="/entitlement/sku" element={<SkuList />} />
        <Route path="/entitlement/sku/detail/:id" element={<SkuDetail />} />
        <Route path="/entitlement/package" element={<PackageList />} />
        <Route path="/entitlement/package/detail/:id" element={<PackageDetail />} />
        <Route path="/entitlement/order" element={<OrderList />} />
        <Route path="/entitlement/order/detail/:id" element={<OrderDetail />} />
        <Route path="/entitlement/account" element={<AccountList />} />
        <Route path="/entitlement/account/detail/:id" element={<AccountDetail />} />
        <Route path="/entitlement/usage" element={<PlaceholderPage title="权益消耗" />} />
        <Route path="/brand" element={<PlaceholderPage title="品牌管理" />} />
        <Route path="/customer" element={<PlaceholderPage title="客户管理" />} />
        <Route path="/attribute" element={<PlaceholderPage title="属性管理" />} />
        <Route path="/category" element={<PlaceholderPage title="类目管理" />} />
        <Route path="/material" element={<PlaceholderPage title="素材管理" />} />
        <Route path="/product" element={<PlaceholderPage title="商品管理" />} />
        <Route path="/authorization" element={<PlaceholderPage title="授权管理" />} />
        <Route path="/plan" element={<PlaceholderPage title="方案管理" />} />
        <Route path="/front-category" element={<PlaceholderPage title="前台类目管理" />} />
        <Route path="/content" element={<PlaceholderPage title="内容管理" />} />
        <Route path="/marketing" element={<PlaceholderPage title="营销管理" />} />
        <Route path="/dashboard" element={<PlaceholderPage title="数据看版" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AdminLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
