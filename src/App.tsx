import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminLayout } from "@/components/AdminLayout";
import EnterpriseList from "./pages/enterprise/EnterpriseList";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/enterprise" replace />} />
            <Route path="/enterprise" element={<EnterpriseList />} />
            <Route path="/enterprise/staff" element={<PlaceholderPage title="人员管理" />} />
            <Route path="/enterprise/apply" element={<PlaceholderPage title="企业入驻申请" />} />
            <Route path="/permission" element={<PlaceholderPage title="权限管理" />} />
            <Route path="/entitlement" element={<PlaceholderPage title="权益管理" />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
