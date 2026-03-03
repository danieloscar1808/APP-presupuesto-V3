import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { CategorySelector } from "@/components/CategorySelector";
import { ClientSelector } from "@/components/ClientSelector";
import { ItemsEditor } from "@/components/ItemsEditor";
import { ACEquipmentData, ACEquipmentValues } from "@/components/ACEquipmentData";
import { SolarSystemData, SolarSystemValues } from "@/components/SolarSystemData";

import { Budget, BudgetItem, BudgetCategory, Profile, Client } from "@/types";

import {
  saveBudget,
  getProfile,
  saveClient,
  getClients,
} from "@/lib/storage";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { ChevronRight, ChevronLeft, Save } from "lucide-react";

// ────────────────────────────────────────────
// GENERADOR AAAAMM-XXX
// ────────────────────────────────────────────
const generarNumeroPresupuesto = () => {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");

  const key = `${year}${month}`;
  const ultimo = Number(localStorage.getItem(`presupuesto_${key}`) || 0);
  const nuevo = ultimo + 1;

  localStorage.setItem(`presupuesto_${key}`, String(nuevo));

  return `${key}-${String(nuevo).padStart(3, "0")}`;
};

type Step = "category" | "client" | "items" | "summary";

// ────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ────────────────────────────────────────────
const NewBudgetPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("category");
  const [profile, setProfile] = useState<Profile | null>(null);

  // FORMULARIO PARA AGREGAR CLIENTE DESDE EL MODAL
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // NUEVO: Descripción del trabajo eléctrico
  const [electricWorkDescription, setElectricWorkDescription] = useState("");

  // PRESUPUESTO
  const [budget, setBudget] = useState<Partial<Budget>>({
    id: uuid(),
    number: generarNumeroPresupuesto(),
    category: undefined,
    clientId: "",
    clientName: "",
    items: [],
    laborCost: 0,
    subtotal: 0,
    taxRate: 21,
    taxAmount: 0,
    discount: 0,
    total: 0,
    notes: "",
    validityDays: 5,
    warranty: "6 meses en mano de obra",
    paymentTerms: "50% anticipo, 50% al finalizar",
    status: "draft",
    createdAt: new Date().toISOString(),

    // AC
    acEquipment: {
      capacity: "",
      technology: "",
      status: "",
    },

    // Solar
    solarSystem: {
      systemType: "",
      panelType: "",
      panelPower: "",
      quantity: 0,
      totalPower: 0,
    },
  });

  // ────────────────────────────────────────────
  // CARGA PERFIL
  // ────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const p = await getProfile();
      if (!p) {
        toast.error("Configura tu perfil primero");
        navigate("/profile");
        return;
      }
      setProfile(p);
    };
    load();
  }, [navigate]);

  // ────────────────────────────────────────────
  // RECÁLCULO AUTOMÁTICO
  // ────────────────────────────────────────────
  useEffect(() => {
    const subtotal = budget.items?.reduce((sum, item) => sum + item.total, 0) || 0;
    const baseAmount = subtotal + (budget.laborCost || 0);
    const taxAmount = (baseAmount * (budget.taxRate || 0)) / 100;
    const total = baseAmount + taxAmount - (budget.discount || 0);

    setBudget((prev) => ({
      ...prev,
      subtotal,
      taxAmount,
      total: Math.max(0, total),
    }));
  }, [budget.items, budget.laborCost, budget.taxRate, budget.discount]);

  const steps: Step[] = ["category", "client", "items", "summary"];
  const currentStepIndex = steps.indexOf(step);

  // VALIDACIÓN PASO A PASO
  const canProceed = () => {
    switch (step) {
      case "category":
        return !!budget.category;
      case "client":
        return !!budget.clientId;
      case "items":
        return (budget.items?.length || 0) > 0 || (budget.laborCost || 0) > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error("Completa los campos requeridos");
      return;
    }
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  // ────────────────────────────────────────────
  // AGREGAR CLIENTE DESDE EL MODAL
  // ────────────────────────────────────────────
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone) {
      toast.error("Nombre y teléfono requeridos");
      return;
    }

    const newClient: Client = {
      id: uuid(),
      name: clientForm.name,
      phone: clientForm.phone,
      email: clientForm.email,
      address: clientForm.address,
      createdAt: new Date().toISOString(),
    };

    await saveClient(newClient);

    setBudget((prev) => ({
      ...prev,
      clientId: newClient.id,
      clientName: newClient.name,
    }));

    setClientForm({ name: "", phone: "", email: "", address: "" });
    setIsClientDialogOpen(false);
    toast.success("Cliente agregado");
  };

  // ────────────────────────────────────────────
  // GUARDAR PRESUPUESTO FINAL
  // ────────────────────────────────────────────
  const handleSave = async () => {
    if (!profile) return;

    const finalBudget: Budget = {
      ...(budget as Budget),
      electricWorkDescription, // NUEVO CAMPO
    };

    await saveBudget(finalBudget);

    toast.success("Presupuesto guardado");
    navigate(`/budgets/${finalBudget.id}`);
  };

  // ────────────────────────────────────────────
  // RENDER PASOS
  // ────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case "category":
        return (
          <CategorySelector
            value={budget.category}
            onChange={(category) => setBudget((prev) => ({ ...prev, category }))}
          />
        );

      case "client":
        return (
          <ClientSelector
            value={budget.clientId}
            onChange={(clientId, clientName) =>
              setBudget((prev) => ({ ...prev, clientId, clientName }))
            }
            onAddNew={() => setIsClientDialogOpen(true)}
          />
        );

      case "items":
        return (
          <div className="space-y-6">

            {/* Datos AC */}
            {budget.category === "ac" && (
              <ACEquipmentData
                value={budget.acEquipment as ACEquipmentValues}
                onChange={(acEquipment) =>
                  setBudget((prev) => ({ ...prev, acEquipment }))
                }
              />
            )}

            {/* Datos Solar */}
            {budget.category === "solar" && (
              <SolarSystemData
                value={budget.solarSystem as SolarSystemValues}
                onChange={(solarSystem) =>
                  setBudget((prev) => ({ ...prev, solarSystem }))
                }
              />
            )}

            {/* NUEVO: Descripción de trabajo eléctrico */}
            {budget.category === "electric" && (
              <div className="card-elevated p-4 space-y-2">
                <Label>Descripción del trabajo a realizar</Label>
                <Textarea
                  placeholder="Detalle claramente el trabajo eléctrico a realizar..."
                  className="min-h-[90px]"
                  value={electricWorkDescription}
                  onChange={(e) =>
                    setElectricWorkDescription(e.target.value)
                  }
                />
              </div>
            )}

            {/* Items */}
            <ItemsEditor
              items={budget.items || []}
              onChange={(items) => setBudget((prev) => ({ ...prev, items }))}
              category={budget.category}
            />

            {/* Costos extras */}
            <div className="card-elevated p-4 space-y-4">
              <div>
                <Label>Mano de Obra</Label>
                <Input
                  type="number"
                  value={budget.laborCost || ""}
                  onChange={(e) =>
                    setBudget((prev) => ({
                      ...prev,
                      laborCost: Number(e.target.value),
                    }))
                  }
                  className="mt-1 text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>IVA (%)</Label>
                  <Input
                    type="number"
                    value={budget.taxRate || ""}
                    onChange={(e) =>
                      setBudget((prev) => ({
                        ...prev,
                        taxRate: Number(e.target.value),
                      }))
                    }
                    className="mt-1 text-center"
                  />
                </div>
                <div>
                  <Label>Descuento ($)</Label>
                  <Input
                    type="number"
                    value={budget.discount || ""}
                    onChange={(e) =>
                      setBudget((prev) => ({
                        ...prev,
                        discount: Number(e.target.value),
                      }))
                    }
                    className="mt-1 text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "summary":
        return (
          <div className="space-y-4">
            {/* Totales */}
            <div className="card-elevated p-4 space-y-3">
              <h3 className="font-medium">Resumen</h3>

              <div className="flex justify-between">
                <span>Materiales</span>
                <span>${budget.subtotal?.toLocaleString("es-AR")}</span>
              </div>

              <div className="flex justify-between">
                <span>Mano de obra</span>
                <span>${budget.laborCost?.toLocaleString("es-AR")}</span>
              </div>

              {budget.taxRate > 0 && (
                <div className="flex justify-between">
                  <span>IVA ({budget.taxRate}%)</span>
                  <span>${budget.taxAmount?.toLocaleString("es-AR")}</span>
                </div>
              )}

              {budget.discount > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Descuento</span>
                  <span>-${budget.discount?.toLocaleString("es-AR")}</span>
                </div>
              )}

              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  ${budget.total?.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Condiciones */}
            <div className="card-elevated p-4 space-y-4">
              <div>
                <Label>Validez (días)</Label>
                <Input
                  type="number"
                  value={budget.validityDays}
                  onChange={(e) =>
                    setBudget((prev) => ({
                      ...prev,
                      validityDays: Number(e.target.value),
                    }))
                  }
                  className="mt-1 text-center"
                />
              </div>

              <div>
                <Label>Garantía</Label>
                <Input
                  value={budget.warranty}
                  onChange={(e) =>
                    setBudget((prev) => ({
                      ...prev,
                      warranty: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Forma de pago</Label>
                <Input
                  value={budget.paymentTerms}
                  onChange={(e) =>
                    setBudget((prev) => ({
                      ...prev,
                      paymentTerms: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Observaciones</Label>
                <Textarea
                  value={budget.notes}
                  onChange={(e) =>
                    setBudget((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  const stepLabels: Record<Step, string> = {
    category: "Tipo",
    client: "Cliente",
    items: "Items",
    summary: "Resumen",
  };

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────
  return (
    <PageLayout title="Nuevo Presupuesto">

      {/* Progreso */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>

            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  i < currentStepIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Paso {currentStepIndex + 1}: {stepLabels[step]}
      </p>

      <div className="mb-6">{renderStep()}</div>

      {/* Botones navegación */}
      <div className="flex gap-3 mb-6">
        {currentStepIndex > 0 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Atrás
          </Button>
        )}

        {currentStepIndex < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            className="flex-1 btn-gradient"
            disabled={!canProceed()}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSave} className="flex-1 btn-accent">
            <Save className="w-4 h-4 mr-1" />
            Guardar
          </Button>
        )}
      </div>

      {/* Modal nuevo cliente */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddClient} className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={clientForm.name}
                onChange={(e) =>
                  setClientForm({ ...clientForm, name: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label>Teléfono *</Label>
              <Input
                type="tel"
                value={clientForm.phone}
                onChange={(e) =>
                  setClientForm({ ...clientForm, phone: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={clientForm.email}
                onChange={(e) =>
                  setClientForm({ ...clientForm, email: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                value={clientForm.address}
                onChange={(e) =>
                  setClientForm({ ...clientForm, address: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsClientDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>

              <Button type="submit" className="flex-1 btn-gradient">
                Agregar Cliente
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </PageLayout>
  );
};

export default NewBudgetPage;