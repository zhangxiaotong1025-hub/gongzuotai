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
import BrandList from "./pages/brand/BrandList";
import BrandDetail from "./pages/brand/BrandDetail";
import BrandCreate from "./pages/brand/BrandCreate";
import CustomerList from "./pages/customer/CustomerList";
import CustomerDetail from "./pages/customer/CustomerDetail";
import CustomerCreate from "./pages/customer/CustomerCreate";
import CustomerOverview from "./pages/customer/CustomerOverview";
import MarketingStrategy from "./pages/customer/MarketingStrategy";
import ModelList from "./pages/model/ModelList";
import ModelDetail from "./pages/model/ModelDetail";
import ModelCreate from "./pages/model/ModelCreate";
import ProductList from "./pages/product/ProductList";
import ProductDetail from "./pages/product/ProductDetail";
import ProductCreate from "./pages/product/ProductCreate";
import AgentCommandCenter from "./pages/agent/AgentCommandCenter";
import LeadsOperation from "./pages/agent/LeadsOperation";
import MarketingDashboard from "./pages/marketing/MarketingDashboard";
import ChannelList from "./pages/marketing/ChannelList";
import CampaignList from "./pages/marketing/CampaignList";
import LeadPool from "./pages/marketing/LeadPool";
import CallCenter from "./pages/marketing/CallCenter";
import Distribution from "./pages/marketing/Distribution";
import Tracking from "./pages/marketing/Tracking";
import Settlement from "./pages/marketing/Settlement";
import MarketingSettings from "./pages/marketing/MarketingSettings";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import MerchantLeads from "./pages/merchant/MerchantLeads";
import MerchantDeals from "./pages/merchant/MerchantDeals";
import MerchantProjects from "./pages/merchant/MerchantProjects";
import MerchantReviews from "./pages/merchant/MerchantReviews";
import MerchantRetention from "./pages/merchant/MerchantRetention";
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
        <Route path="/brand" element={<BrandList />} />
        <Route path="/brand/detail/:id" element={<BrandDetail />} />
        <Route path="/brand/create" element={<BrandCreate />} />
        <Route path="/customer" element={<Navigate to="/customer/overview" replace />} />
        <Route path="/customer/overview" element={<CustomerOverview />} />
        <Route path="/customer/list" element={<CustomerList />} />
        <Route path="/customer/detail/:id" element={<CustomerDetail />} />
        <Route path="/customer/create" element={<CustomerCreate />} />
        <Route path="/customer/marketing" element={<MarketingStrategy />} />
        <Route path="/attribute" element={<PlaceholderPage title="属性管理" />} />
        <Route path="/category" element={<PlaceholderPage title="类目管理" />} />
        <Route path="/model" element={<ModelList />} />
        <Route path="/model/detail/:id" element={<ModelDetail />} />
        <Route path="/model/create" element={<ModelCreate />} />
        <Route path="/product" element={<ProductList />} />
        <Route path="/product/detail/:id" element={<ProductDetail />} />
        <Route path="/product/create" element={<ProductCreate />} />
        <Route path="/authorization" element={<PlaceholderPage title="授权管理" />} />
        <Route path="/plan" element={<PlaceholderPage title="方案管理" />} />
        <Route path="/front-category" element={<PlaceholderPage title="前台类目管理" />} />
        <Route path="/content" element={<PlaceholderPage title="内容管理" />} />
        <Route path="/marketing" element={<MarketingDashboard />} />
        <Route path="/marketing/channels" element={<ChannelList />} />
        <Route path="/marketing/campaigns" element={<CampaignList />} />
        <Route path="/marketing/leads" element={<LeadPool />} />
        <Route path="/marketing/call-center" element={<CallCenter />} />
        <Route path="/marketing/distribution" element={<Distribution />} />
        <Route path="/marketing/tracking" element={<Tracking />} />
        <Route path="/marketing/settlement" element={<Settlement />} />
        <Route path="/marketing/settings" element={<MarketingSettings />} />
        <Route path="/merchant" element={<MerchantDashboard />} />
        <Route path="/merchant/leads" element={<MerchantLeads />} />
        <Route path="/merchant/deals" element={<MerchantDeals />} />
        <Route path="/merchant/projects" element={<MerchantProjects />} />
        <Route path="/merchant/reviews" element={<MerchantReviews />} />
        <Route path="/merchant/retention" element={<MerchantRetention />} />
        <Route path="/dashboard" element={<PlaceholderPage title="数据看版" />} />
        <Route path="/agent" element={<AgentCommandCenter />} />
        <Route path="/agent/leads" element={<LeadsOperation />} />
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
