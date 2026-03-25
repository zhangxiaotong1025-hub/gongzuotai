import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Architecture from "./pages/Architecture";
import Modules from "./pages/Modules";
import Principles from "./pages/Principles";
import DataModels from "./pages/DataModels";
import Timeline from "./pages/Timeline";
import Risks from "./pages/Risks";
import Acceptance from "./pages/Acceptance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/principles" element={<Principles />} />
            <Route path="/data-models" element={<DataModels />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/risks" element={<Risks />} />
            <Route path="/acceptance" element={<Acceptance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
