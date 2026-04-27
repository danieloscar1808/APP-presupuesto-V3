import { useEffect, useState } from "react";
import { Filter, Minus, Plus, Search, Wrench } from "lucide-react";
import { getLaborItems } from "@/lib/storage";
import { BudgetCategory, CatalogItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LaborCalculatorProps {
  onClose: () => void;
  onUseTotal: (total: number, selectedItems: CatalogItem[]) => void;
}

export const LaborCalculator = ({
  onClose,
  onUseTotal,
}: LaborCalculatorProps) => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selected, setSelected] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "general" | "ac" | "electric" | "solar"
  >("all");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getLaborItems();
    setItems(data);
  };

  const addItem = (item: CatalogItem) => {
    setSelected((prev) => [...prev, item]);
  };

  const removeItem = (index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  const total = selected.reduce((acc, item) => acc + item.price, 0);

  const filtered = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const itemCategory = (item.category || "general") as
      | "general"
      | BudgetCategory;
    const matchesCategory =
      categoryFilter === "all" || itemCategory === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full min-w-0 space-y-4 text-foreground">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-primary">
          Calculadora de mano de obra
        </h2>
        <p className="text-sm text-muted-foreground">
          Suma trabajos del catalogo y aplicalos al presupuesto actual.
        </p>
      </div>

      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar trabajo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="relative w-full">
        <Filter className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Select
          value={categoryFilter}
          onValueChange={(value) =>
            setCategoryFilter(
              value as "all" | "general" | "ac" | "electric" | "solar"
            )
          }
        >
          <SelectTrigger className="pl-10 text-left">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorias</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="ac">Aire Acond.</SelectItem>
            <SelectItem value="electric">Electrico</SelectItem>
            <SelectItem value="solar">Solar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.9fr)]">
        <div className="w-full min-w-0 space-y-2">
          <div className="flex w-full min-w-0 items-center justify-between gap-2">
            <p className="text-sm font-medium text-primary">Catalogo</p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {filtered.length} opciones
            </span>
          </div>

          <div className="w-full min-w-0 max-h-72 space-y-2 overflow-x-hidden overflow-y-auto rounded-2xl border border-border/70 bg-card/70 p-2 sm:max-h-80">
            {filtered.length === 0 ? (
              <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-3 text-center">
                <Wrench className="mb-2 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  No se encontraron trabajos
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-border/70 bg-secondary/55 px-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <Button
                    size="icon"

                    className="bg-primary text-primary-foreground btn-accent"
                    onClick={() => addItem(item)}
                    aria-label={`Agregar ${item.name}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-full min-w-0 space-y-2">
          <div className="flex w-full min-w-0 items-center justify-between gap-2">
            <p className="text-sm font-medium text-primary">Seleccionados</p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {selected.length} agregados
            </span>
          </div>

          <div className="w-full min-w-0 max-h-72 space-y-2 overflow-x-hidden overflow-y-auto rounded-2xl border border-border/70 bg-card/70 p-2 sm:max-h-80">
            {selected.length === 0 ? (
              <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border/70 px-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Todavia no agregaste trabajos
                </p>
              </div>
            ) : (
              selected.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-border/70 bg-secondary/55 px-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <Button
                    size="icon"

                    className="
                    bg-red-500 
                    text-white 
                    border border-red-500
                    transition-all duration-200
                    hover:bg-white hover:text-red-500
                    active:bg-white active:text-red-500 active:scale-95"
                    onClick={() => removeItem(index)}
                    aria-label={`Quitar ${item.name}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="w-full min-w-0 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
            <p className="text-sm text-muted-foreground">Total calculado</p>
            <p className="text-2xl font-semibold text-primary">
              ${total.toLocaleString("es-AR")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 pt-2 sm:flex-row">
        <Button
          className="btn-accent flex-1"
          onClick={() => onUseTotal(total, selected)}
          disabled={selected.length === 0}
        >
          Usar total
        </Button>

        <Button variant="outline"
          className="flex-1 bg-blue-700 text-white border border-blue-700 transition-all duration-200
                    hover:bg-white hover:text-blue-700 active:bg-white active:text-blue-700 active:scale-95"
          onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};
