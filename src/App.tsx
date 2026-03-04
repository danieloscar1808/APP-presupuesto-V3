import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import ClientsPage from "./pages/ClientsPage";
import NewBudgetPage from "./pages/NewBudgetPage";
import BudgetsListPage from "./pages/BudgetsListPage";
import BudgetDetailPage from "./pages/BudgetDetailPage";
import CatalogPage from "./pages/CatalogPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/budgets/new" element={<NewBudgetPage />} />
          <Route path="/budgets" element={<BudgetsListPage />} />
          <Route path="/budgets/:id" element={<BudgetDetailPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

