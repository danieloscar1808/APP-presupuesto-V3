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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type FilterCategory = "all" | "ac" | "electric" | "solar";

const BudgetsListPage = () => {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "facturado" | "cancelado">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // -------------------------------------------------------
  // CARGAR PRESUPUESTOS DESDE INDEXEDDB
  // -------------------------------------------------------
  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);

    const data = await getBudgets();

    const sorted = [...data].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    setBudgets(sorted);
    setLoading(false);
  };

  const descargarReportePDF = () => {
    const doc = new jsPDF({
      orientation: "landscape"
    });

    doc.setFontSize(14);
    doc.text("Reporte de Historial", 14, 15);

    const rows = filteredBudgets.map((b) => [
      b.clientName,

      // FACTURA
      b.factura?.numero || "-",
      b.factura?.fecha
        ? new Date(b.factura.fecha).toLocaleDateString()
        : "-",
      b.factura?.cae || "-",
      b.factura?.vencimiento || "-",

      // NOTA DE CRÉDITO
      b.notaCredito?.numero || "-",
      b.notaCredito?.fecha
        ? new Date(b.notaCredito.fecha).toLocaleDateString()
        : "-",
      b.notaCredito?.CAE || "-",
      b.notaCredito?.vencimiento || "-",

      // TOTAL
      `$${(b.total || 0).toLocaleString("es-AR")}`
    ]);

    autoTable(doc, {
      startY: 25,
      head: [[
        "Cliente",
        "Factura",
        "Fecha Fact.",
        "CAE Fact.",
        "Vto CAE Fact.",
        "Nota de Crédito",
        "Fecha NC",
        "CAE NC",
        "Vto CAE NC",
        "Total"
      ]],
      body: rows,
    });

    doc.save("reporte_presupuestos.pdf");
  };


  //  FILTRO HISTORIAL
  const filteredBudgets = budgets.filter((b) => {

    // HISTORIAL
    const isHistorial =
      b.status === "facturado" ||
      b.status === "cancelado";

    // ESTADO
    const matchStatus =
      statusFilter === "all" || b.status === statusFilter;

    // CLIENTE
    const matchSearch = (b.clientName || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    // 🔹 CATEGORÍA
    const matchFilter =
      filter === "all" || b.category === filter;

    // 🔹 FECHA
    const d = new Date(b.createdAt);

    const budgetDateStr =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");

    // 🔹 FROM
    const matchFrom =
      !dateFrom || budgetDateStr >= dateFrom;

    // 🔹 TO
    const matchTo =
      !dateTo || budgetDateStr <= dateTo;


    return (
      isHistorial &&
      matchStatus &&
      matchSearch &&
      matchFilter &&
      matchFrom &&
      matchTo
    );
  });


  const hayFiltrosActivos =
    search !== "" ||
    filter !== "all" ||
    statusFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

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

      {/* FILTRO ESTADO */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
        >
          Todos
        </Button>

        <Button
          size="sm"
          variant={statusFilter === "facturado" ? "default" : "outline"}
          onClick={() => setStatusFilter("facturado")}
        >
          Facturados
        </Button>

        <Button
          size="sm"
          variant={statusFilter === "cancelado" ? "default" : "outline"}
          onClick={() => setStatusFilter("cancelado")}
        >
          Cancelados
        </Button>
      </div>

      {/* FILTRO FECHA */}
      <div className="flex gap-2 mb-4 items-center">

        {/* BOTÓN TODOS */}
        <Button
          size="sm"
          variant={!dateFrom && !dateTo ? "default" : "outline"}
          onClick={() => {
            setDateFrom("");
            setDateTo("");
          }}
        >
          Todos
        </Button>

        {/* DESDE */}
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />

        {/* HASTA */}
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />

      </div>

      {hayFiltrosActivos && (// hay algún filtro activo (excepto búsqueda)
        <Button
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={descargarReportePDF}
        >
          Descargar datos
        </Button>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="card-elevated p-8 text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            {budgets.length === 0
              ? "No hay presupuestos"
              : "No hay resultados con los filtros aplicados"}
          </p>


          {budgets.length === 0 && (
            <Button
              variant="link"
              onClick={() => navigate("/budgets/new")}
              className="mt-2 text-primary"
            >
              Crear primer presupuesto
            </Button>
          )}
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