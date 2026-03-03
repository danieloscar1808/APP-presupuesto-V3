import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageLayout } from "@/components/PageLayout";
import { CategorySelector } from "@/components/CategorySelector";
import { ClientSelector } from "@/components/ClientSelector";
import { ItemsEditor } from "@/components/ItemsEditor";

import {
  ACEquipmentData,
  ACEquipmentValues,
} from "@/components/ACEquipmentData";

import {
  SolarSystemData,
  SolarSystemValues,
} from "@/components/SolarSystemData";

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

// -----------------------------------------------------------
// GENERADOR AAAAMM-XXX (IndexedDB + localStorage compatible)
// -----------------------------------------------------------
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

const NewBudgetPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("category");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clientList, setClientList] = useState<Client[]>([]);

  // Dialog para crear cliente
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // -------------------------------------------------------
  // PRESUPUESTO NUEVO
  // -------------------------------------------------------
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

    acEquipment: {
      capacity: "",
      technology: "",
      status: "",
    },

    solarSystem: {
      systemType: "",
      panelType: "",
      panelPower: "",
      quantity: 0,
      totalPower: 0,
    },
  });

  // -------------------------------------------------------
  // CARGAR PERFIL Y CLIENTES DESDE INDEXEDDB
  // -------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      const p = await getProfile();
      if (!p) {
        toast.error("Configura tu perfil primero");
        navigate("/profile");
        return;
      }
      setProfile(p);

      const c = await getClients();
      setClientList(c);
    };

    loadData();
  }, [navigate]);

  // -------------------------------------------------------
  // RECALCULAR TOTALES
  // -------------------------------------------------------
  useEffect(() => {
    const subtotal =
      budget.items?.reduce((sum, item) => sum + item.total, 0) || 0;

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

  // -------------------------------------------------------
  // LOGICA DE PASOS
  // -------------------------------------------------------
  const steps: Step[] = ["category", "client", "items", "summary"];
  const currentStepIndex = steps.indexOf(step);

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
    setStep(steps[currentStepIndex + 1]);
  };

  const handleBack = () => {
    setStep(steps[currentStepIndex - 1]);
  };

  // -------------------------------------------------------
  // GUARDAR PRESUPUESTO
  // -------------------------------------------------------
  const handleSave = async () => {
    if (!profile) return;

    await saveBudget(budget as Budget);
    toast.success("Presupuesto guardado");
    navigate(`/budgets/${budget.id}`);
  };

  // -------------------------------------------------------
  // CREAR CLIENTE NUEVO
  // -------------------------------------------------------
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

    const updatedList = await getClients();
    setClientList(updatedList);

    setBudget((prev) => ({
      ...prev,
      clientId: newClient.id,
      clientName: newClient.name,
    }));

    setClientForm({ name: "", phone: "", email: "", address: "" });
    setIsClientDialogOpen(false);
    toast.success("Cliente agregado");
  };

  // -------------------------------------------------------
  // PANTALLAS
  // -------------------------------------------------------
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
            onChange={(id, name) =>
              setBudget((prev) => ({
                ...prev,
                clientId: id,
                clientName: name,
              }))
            }
            onAddNew={() => setIsClientDialogOpen(true)}
          />
        );

      case "items":
        return (
          <div className="space-y-6">
            {budget.category === "ac" && (
              <ACEquipmentData
                value={budget.acEquipment as ACEquipmentValues}
                onChange={(val) =>
                  setBudget((prev) => ({ ...prev, acEquipment: val }))
                }
              />
            )}

            {budget.category === "solar" && (
              <SolarSystemData
                value={budget.solarSystem as SolarSystemValues}
                onChange={(val) =>
                  setBudget((prev) => ({ ...prev, solarSystem: val }))
                }
              />
            )}

            <ItemsEditor
              items={budget.items || []}
              onChange={(items) => setBudget((prev) => ({ ...prev, items }))}
              category={budget.category}
            />

            {/* COSTOS */}
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
                    value={budget.taxRate}
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
            <div className="card-elevated p-4 space-y-2">
              <h3 className="font-medium">Resumen</h3>

              <div className="flex justify-between">
                <span>Materiales</span>
                <span>${budget.subtotal?.toLocaleString("es-AR")}</span>
              </div>

              <div className="flex justify-between">
                <span>Mano de Obra</span>
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
                  <span>- ${budget.discount?.toLocaleString("es-AR")}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  $
                  {budget.total?.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="card-elevated p-4 space-y-4">
              <h3 className="font-medium">Condiciones</h3>

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
                />
              </div>

              <div>
                <Label>Notas</Label>
                <Textarea
                  value={budget.notes}
                  onChange={(e) =>
                    setBudget((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        );
    }
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <PageLayout title="Nuevo Presupuesto">
      {/* Barra de pasos */}
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

      <div className="mb-6">{renderStep()}</div>

      {/* BOTONES */}
      <div className="flex gap-3">
        {currentStepIndex > 0 && (
          <Button variant="outline" className="flex-1" onClick={handleBack}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Atrás
          </Button>
        )}

        {currentStepIndex < steps.length - 1 ? (
          <Button
            className="flex-1 btn-gradient"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button className="flex-1 btn-accent" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Guardar
          </Button>
        )}
      </div>

      {/* DIALOGO NUEVO CLIENTE */}
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
              />
            </div>

            <div>
              <Label>Teléfono *</Label>
              <Input
                value={clientForm.phone}
                onChange={(e) =>
                  setClientForm({ ...clientForm, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={clientForm.email}
                onChange={(e) =>
                  setClientForm({ ...clientForm, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                value={clientForm.address}
                onChange={(e) =>
                  setClientForm({ ...clientForm, address: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsClientDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 btn-gradient">
                Agregar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default NewBudgetPage;