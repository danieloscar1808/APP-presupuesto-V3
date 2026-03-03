import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Budget } from "@/types";
import { getBudgets } from "@/lib/storage";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetCard } from "@/components/BudgetCard";

type FilterCategory = "all" | "ac" | "electric" | "solar";

const BudgetsListPage = () => {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  // CARGAR PRESUPUESTOS DESDE INDEXEDDB
  // -------------------------------------------------------
  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);

    const data = await getBudgets(); // AHORA ES ASYNC

    // Ordenar por fecha descendente
    const sorted = [...data].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    setBudgets(sorted);
    setLoading(false);
  };

  // -------------------------------------------------------
  // APLICAR FILTROS
  // -------------------------------------------------------
  const filteredBudgets = budgets.filter((b) => {
    const matchSearch = b.clientName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchFilter = filter === "all" || b.category === filter;

    return matchSearch && matchFilter;
  });

  const filterButtons: { id: FilterCategory; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "ac", label: "AC" },
    { id: "electric", label: "Eléctrica" },
    { id: "solar", label: "Solar" },
  ];

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <PageLayout title="Historial">
      {/* Buscador */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {filterButtons.map((btn) => (
          <Button
            key={btn.id}
            variant={filter === btn.id ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(btn.id)}
            className={cn(
              "shrink-0",
              filter === btn.id && "btn-gradient"
            )}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="card-elevated p-8 text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No hay presupuestos</p>

          <Button
            variant="link"
            onClick={() => navigate("/budgets/new")}
            className="mt-2 text-primary"
          >
            Crear primer presupuesto
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBudgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onClick={() => navigate(`/budgets/${budget.id}`)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default BudgetsListPage;