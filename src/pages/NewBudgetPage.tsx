import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageLayout } from "@/components/PageLayout";
import { Client, Budget, BudgetCategory } from "@/types";

import { getClients, saveBudget, getProfile } from "@/lib/storage";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

import { ItemsEditor } from "@/components/ItemsEditor";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

const NewBudgetPage = () => {
  const navigate = useNavigate();

  // ------------------------------
  // Estados principales
  // ------------------------------
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");

  const [category, setCategory] = useState<BudgetCategory>("ac");

  const [items, setItems] = useState([]);
  const [laborCost, setLaborCost] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [validityDays, setValidityDays] = useState(7);
  const [warranty, setWarranty] = useState("6 meses");
  const [paymentTerms, setPaymentTerms] = useState("Efectivo / Transferencia");

  // ------------------------------
  // Campos "AC"
  // ------------------------------
  const [acCapacity, setAcCapacity] = useState("");
  const [acTechnology, setAcTechnology] = useState("");
  const [acStatus, setAcStatus] = useState("");

  // ------------------------------
  // Campos "Electric"
  // ------------------------------
  const [electricWorkDescription, setElectricWorkDescription] = useState("");

  // ------------------------------
  // Campos "Solar"
  // ------------------------------
  const [solarType, setSolarType] = useState("");
  const [solarPanelType, setSolarPanelType] = useState("");
  const [solarPanelPower, setSolarPanelPower] = useState("");
  const [solarQty, setSolarQty] = useState<number>(0);

  // ------------------------------
  // Cargar clientes
  // ------------------------------
  useEffect(() => {
    getClients().then(setClients);
  }, []);

  // ------------------------------
  // Selección automática de nombre
  // ------------------------------
  useEffect(() => {
    if (clientId) {
      const cli = clients.find((c) => c.id === clientId);
      setClientName(cli ? cli.name : "");
    }
  }, [clientId, clients]);

  // ------------------------------
  // Guardar presupuesto
  // ------------------------------
  const handleSubmit = async () => {
    if (!clientId) {
      toast.error("Debe seleccionar un cliente.");
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal + laborCost) * (taxRate / 100);
    const total = subtotal + laborCost + taxAmount - discount;

    const budget: Budget = {
      id: uuid(),
      number: "",
      clientId,
      clientName,
      category,
      items,
      laborCost,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      notes,
      validityDays,
      warranty,
      paymentTerms,
      status: "draft",
      createdAt: new Date().toISOString(),

      // AC
      acEquipment:
        category === "ac"
          ? { capacity: acCapacity, technology: acTechnology, status: acStatus }
          : undefined,

      // Electric
      electricWorkDescription:
        category === "electric" ? electricWorkDescription : "",

      // Solar
      solarSystem:
        category === "solar"
          ? {
              systemType: solarType,
              panelType: solarPanelType,
              panelPower: solarPanelPower,
              quantity: solarQty,
              totalPower: Number(solarPanelPower) * Number(solarQty),
            }
          : undefined,
    };

    await saveBudget(budget);
    toast.success("Presupuesto creado correctamente");
    navigate("/budgets");
  };

  return (
    <PageLayout title="Nuevo Presupuesto">
      <div className="space-y-6">
        {/* CLIENTE */}
        <div className="card-elevated p-4 space-y-3">
          <Label>Cliente</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CATEGORÍA */}
        <div className="card-elevated p-4 space-y-3">
          <Label>Tipo de Instalación</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ac">Aire Acondicionado</SelectItem>
              <SelectItem value="electric">Instalación Eléctrica</SelectItem>
              <SelectItem value="solar">Sistema Fotovoltaico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* CAMPOS DINÁMICOS SEGÚN CATEGORÍA */}

        {/* AC */}
        {category === "ac" && (
          <div className="card-elevated p-4 space-y-3">
            <Label>Datos del Equipo</Label>

            <Input
              placeholder="Capacidad (frigorías)"
              value={acCapacity}
              onChange={(e) => setAcCapacity(e.target.value)}
            />
            <Input
              placeholder="Tecnología (Inverter, On/Off, etc.)"
              value={acTechnology}
              onChange={(e) => setAcTechnology(e.target.value)}
            />
            <Input
              placeholder="Estado del equipo"
              value={acStatus}
              onChange={(e) => setAcStatus(e.target.value)}
            />
          </div>
        )}

        {/* ELECTRIC */}
        {category === "electric" && (
          <div className="card-elevated p-4 space-y-3">
            <Label>Descripción del trabajo eléctrico</Label>

            <Textarea
              value={electricWorkDescription}
              onChange={(e) => setElectricWorkDescription(e.target.value)}
              placeholder="Ejemplo: recableado, circuito independiente, colocación de llaves térmicas, tableros, puesta a tierra, canalizaciones..."
              className="min-h-[100px]"
            />

            <p className="text-xs text-muted-foreground">
              Esto aparecerá en el PDF del presupuesto.
            </p>
          </div>
        )}

        {/* SOLAR */}
        {category === "solar" && (
          <div className="card-elevated p-4 space-y-3">
            <Label>Datos del Sistema Solar</Label>

            <Input
              placeholder="Tipo de sistema (On Grid / Off Grid / Híbrido)"
              value={solarType}
              onChange={(e) => setSolarType(e.target.value)}
            />

            <Input
              placeholder="Tipo de panel"
              value={solarPanelType}
              onChange={(e) => setSolarPanelType(e.target.value)}
            />

            <Input
              placeholder="Potencia del panel (W)"
              value={solarPanelPower}
              onChange={(e) => setSolarPanelPower(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Cantidad de paneles"
              value={solarQty}
              onChange={(e) => setSolarQty(Number(e.target.value))}
            />
          </div>
        )}

        {/* ITEMS DEL PRESUPUESTO */}
        <ItemsEditor
          items={items}
          category={category}
          onChange={setItems}
        />

        {/* COSTOS Y DETALLES */}
        <div className="card-elevated p-4 space-y-3">
          <Label>Mano de Obra</Label>
          <Input
            type="number"
            value={laborCost}
            onChange={(e) => setLaborCost(Number(e.target.value))}
          />

          <Label>IVA (%)</Label>
          <Input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />

          <Label>Descuento</Label>
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />

          <Label>Notas</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Comentarios adicionales..."
          />

          <Label>Validez (días)</Label>
          <Input
            type="number"
            value={validityDays}
            onChange={(e) => setValidityDays(Number(e.target.value))}
          />

          <Label>Garantía</Label>
          <Input value={warranty} onChange={(e) => setWarranty(e.target.value)} />

          <Label>Forma de pago</Label>
          <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
        </div>

        <Button className="btn-accent w-full" onClick={handleSubmit}>
          Guardar Presupuesto
        </Button>
      </div>
    </PageLayout>
  );
};

export default NewBudgetPage;