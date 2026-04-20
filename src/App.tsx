import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import CierreIIBBPage from "./pages/CierreIIBBPage";

import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import ClientsPage from "./pages/ClientsPage";
import NewBudgetPage from "./pages/NewBudgetPage";
import BudgetsListPage from "./pages/BudgetsListPage";
import BudgetDetailPage from "./pages/BudgetDetailPage";
import CatalogPage from "./pages/CatalogPage";
import ResumenImpositivo from "./pages/CierreIIBBPage";
import NotFound from "./pages/NotFound";
import CatalogoManoDeObraPage from "@/pages/CatalogoManoDeObraPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/cierre-iibb" element={<CierreIIBBPage />} />
        <Route path="/budgets/new" element={<NewBudgetPage />} />
        <Route path="/budgets" element={<BudgetsListPage />} />
        <Route path="/budgets/:id" element={<BudgetDetailPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/resumen-impositivo" element={<ResumenImpositivo />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/catalogo-mano-obra" element={<CatalogoManoDeObraPage />} />
        <Route path="/budgets/edit/:id" element={<NewBudgetPage />} />
      </Routes>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
