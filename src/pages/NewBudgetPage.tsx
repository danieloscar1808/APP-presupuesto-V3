import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageLayout } from "@/components/PageLayout";
import { Client, Budget, BudgetCategory } from "@/types";

import { getClients, saveBudget } from "@/lib/storage";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { ItemsEditor } from "@/components/ItemsEditor";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

/* -------------------------------- */
/* LISTAS                           */
/* -------------------------------- */

const CAPACITIES = ["2300","2600","3000","3500","4000","4500","6000"];

const TECHNOLOGIES = ["Inverter","On/Off"];

const STATUS_OPTIONS = [
  "Instalación Nueva",
  "Desinstalación",
  "Reinstalación",
  "Desinstalación/Reinstalación"
];

const SOLAR_TYPES = ["On Grid","Off Grid","Híbrido"];

const PANEL_TYPES = ["Policristalino","Monocristalino"];


/* -------------------------------- */
/* GENERADOR DE NÚMERO              */
/* -------------------------------- */

const generarNumeroPresupuesto = () => {

  const ahora = new Date();

  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2,"0");

  const key = `${year}${month}`;

  const ultimo = Number(localStorage.getItem(`presupuesto_${key}`) || 0);

  const nuevo = ultimo + 1;

  localStorage.setItem(`presupuesto_${key}`,String(nuevo));

  return `${key}-${String(nuevo).padStart(3,"0")}`;

};


/* -------------------------------- */
/* COMPONENTE                       */
/* -------------------------------- */

const NewBudgetPage = () => {

  const navigate = useNavigate();

  const [clients,setClients] = useState<Client[]>([]);
  const [clientId,setClientId] = useState("");
  const [clientName,setClientName] = useState("");

  const [category,setCategory] = useState<BudgetCategory>("ac");

  const [items,setItems] = useState<any[]>([]);
  const [laborCost,setLaborCost] = useState(0);
  const [taxRate,setTaxRate] = useState(0);
  const [discount,setDiscount] = useState(0);
  const [notes,setNotes] = useState("");

  const [validityDays,setValidityDays] = useState(7);
  const [warranty,setWarranty] = useState("6 meses");
  const [paymentTerms,setPaymentTerms] = useState("Efectivo / Transferencia");

  /* AC */

  const [acCapacity,setAcCapacity] = useState("");
  const [acTechnology,setAcTechnology] = useState("");
  const [acStatus,setAcStatus] = useState("");

  /* ELECTRIC */

  const [electricWorkDescription,setElectricWorkDescription] = useState("");

  /* SOLAR */

  const [solarType,setSolarType] = useState("");
  const [solarPanelType,setSolarPanelType] = useState("");
  const [solarPanelPower,setSolarPanelPower] = useState("");
  const [solarQty,setSolarQty] = useState<number>(0);


  /* CARGAR CLIENTES */

  useEffect(()=>{

    getClients().then(setClients);

  },[]);


  /* AUTO NOMBRE CLIENTE */

  useEffect(()=>{

    if(clientId){

      const cli = clients.find(c=>c.id === clientId);
      setClientName(cli ? cli.name : "");

    }

  },[clientId,clients]);


  /* GUARDAR */

  const handleSubmit = async () => {

    if(!clientId){

      toast.error("Debe seleccionar un cliente");
      return;

    }

    const numeroPresupuesto = generarNumeroPresupuesto();

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice,0);
    const taxAmount = (subtotal + laborCost) * (taxRate / 100);
    const total =Number(subtotal || 0) +Number(laborCost || 0) +Number(taxAmount || 0) -Number(discount || 0);
    const budget: Budget = {

      id: uuid(),
      number: numeroPresupuesto,

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

      status:"draft",

      createdAt:new Date().toISOString(),

      acEquipment:
        category === "ac"
          ? {
              capacity: acCapacity,
              technology: acTechnology,
              status: acStatus
            }
          : undefined,

      electricWorkDescription:
        category === "electric"
          ? electricWorkDescription
          : "",

      solarSystem:
        category === "solar"
          ? {
              systemType: solarType,
              panelType: solarPanelType,
              panelPower: solarPanelPower,
              quantity: solarQty,
              totalPower: Number(solarPanelPower) * Number(solarQty)
            }
          : undefined

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
              <SelectValue placeholder="Seleccionar cliente"/>
            </SelectTrigger>

            <SelectContent>

              {clients.map(c=>(
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}

            </SelectContent>

          </Select>

        </div>


        {/* CATEGORIA */}

        <div className="card-elevated p-4 space-y-3">

          <Label>Tipo de instalación</Label>

          <Select value={category} onValueChange={setCategory}>

            <SelectTrigger>
              <SelectValue/>
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="ac">Aire acondicionado</SelectItem>
              <SelectItem value="electric">Instalación eléctrica</SelectItem>
              <SelectItem value="solar">Sistema fotovoltaico</SelectItem>

            </SelectContent>

          </Select>

        </div>


        {/* AC */}

        {category === "ac" && (

          <div className="card-elevated p-4 space-y-4">

            <Label>Datos del equipo</Label>

            <Select value={acCapacity} onValueChange={setAcCapacity}>
              <SelectTrigger>
                <SelectValue placeholder="Capacidad"/>
              </SelectTrigger>
              <SelectContent>
                {CAPACITIES.map(c=>(
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={acTechnology} onValueChange={setAcTechnology}>
              <SelectTrigger>
                <SelectValue placeholder="Tecnología"/>
              </SelectTrigger>
              <SelectContent>
                {TECHNOLOGIES.map(t=>(
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={acStatus} onValueChange={setAcStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado"/>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s=>(
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

        )}


        {/* ELECTRIC */}

        {category === "electric" && (

          <div className="card-elevated p-4 space-y-3">

            <Label>Descripción del trabajo</Label>

            <Textarea
              value={electricWorkDescription}
              onChange={(e)=>setElectricWorkDescription(e.target.value)}
              className="min-h-[120px]"
            />

          </div>

        )}


        {/* SOLAR */}

        {category === "solar" && (

          <div className="card-elevated p-4 space-y-3">

            <Label>Datos del sistema</Label>

            <Select value={solarType} onValueChange={setSolarType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de sistema"/>
              </SelectTrigger>
              <SelectContent>
                {SOLAR_TYPES.map(t=>(
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={solarPanelType} onValueChange={setSolarPanelType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de panel"/>
              </SelectTrigger>
              <SelectContent>
                {PANEL_TYPES.map(p=>(
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Potencia panel (W)"
              value={solarPanelPower}
              onChange={(e)=>setSolarPanelPower(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Cantidad paneles"
              value={solarQty}
              onChange={(e)=>setSolarQty(Number(e.target.value))}
            />

          </div>

        )}


        {/* ITEMS */}

        <ItemsEditor
          items={items}
          category={category}
          onChange={setItems}
        />


        {/* COSTOS */}

        <div className="card-elevated p-4 space-y-3">

          <Label>Mano de obra</Label>
          <Input type="number" value={laborCost} onChange={(e)=>setLaborCost(Number(e.target.value))}/>

          <Label>IVA %</Label>
          <Input type="number" value={taxRate} onChange={(e)=>setTaxRate(Number(e.target.value))}/>

          <Label>Descuento</Label>
          <Input type="number" value={discount} onChange={(e)=>setDiscount(Number(e.target.value))}/>

          <Label>Notas</Label>
          <Textarea value={notes} onChange={(e)=>setNotes(e.target.value)}/>

          <Label>Validez</Label>
          <Input type="number" value={validityDays} onChange={(e)=>setValidityDays(Number(e.target.value))}/>

          <Label>Garantía</Label>
          <Input value={warranty} onChange={(e)=>setWarranty(e.target.value)}/>

          <Label>Forma de pago</Label>
          <Input value={paymentTerms} onChange={(e)=>setPaymentTerms(e.target.value)}/>

        </div>


        <Button className="btn-accent w-full" onClick={handleSubmit}>
          Guardar Presupuesto
        </Button>

      </div>

    </PageLayout>

  );

};

export default NewBudgetPage;