import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { PageLayout } from "@/components/PageLayout";
import { ShareOptions } from "@/components/ShareOptions";

import { Budget, Profile, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";
import { getBudgetById, getProfile, deleteBudget } from "@/lib/storage";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import FacturaView from "@/components/FacturaView";
import { useRef } from "react";
import html2pdf from "html2pdf.js";
import { getClients } from "@/lib/storage";
import { saveBudget } from "@/lib/storage";
import { useFacturasStore } from "../store/facturasStore";


  const BudgetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [factura, setFactura] = useState(null);
  const [clientAddress, setClientAddress] = useState("");
  const [client, setClient] = useState<any>(null);
  const facturaRef = useRef(null);
  const [showFiscalModal, setShowFiscalModal] = useState(false);
  const [ivaCondition, setIvaCondition] = useState("Consumidor Final");
  const [currency, setCurrency] = useState("ARS");
  const [exchangeRate, setExchangeRate] = useState("");
  const [formaPago, setFormaPago] = useState("Transferencia");
  const registrarFactura = useFacturasStore((s) => s.registrarFactura);
  const facturas = useFacturasStore((s) => s.facturas);
  const cancelarFacturaStore = useFacturasStore((s) => s.cancelarFactura);
  const [loadingAFIP, setLoadingAFIP] = useState(false);

  // ----------------------------------------------------
  // LOAD DATA
  // ----------------------------------------------------
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    setLoading(true);

    const b = await getBudgetById(id);
    const p = await getProfile();

    const clients = await getClients();
    const clienteEncontrado = clients.find(c => c.id === b.clientId);

    setClient(clienteEncontrado);

    if (!b) {
      toast.error("Presupuesto no encontrado");
      navigate("/budgets");
      return;
    }

    setBudget(b);
    if (b.factura) {
    setFactura(b.factura);
    }

    setProfile(p);
    setLoading(false);

    const facturaGuardada = localStorage.getItem(`factura-${id}`);
      if (facturaGuardada) {
      setFactura(JSON.parse(facturaGuardada));
      }
        setLoading(false);
  };

  // ----------------------------------------------------
  // DELETE BUDGET
  // ----------------------------------------------------
  const handleDelete = async () => {
    if (!id) return;

    // 🔒 BLOQUEO de boton si el presupuesto ya esta facturado
    if (budget.factura || budget.status === "cancelado") {
    alert("No se puede eliminar un presupuesto con factura o cancelado");
    return;
    }

    if (confirm("¿Eliminar este presupuesto?")) {
      await deleteBudget(id);
      toast.success("Presupuesto eliminado");
      navigate("/budgets");
    }
  };

  // ----------------------------------------------------
  // RENDER STATES
  // ----------------------------------------------------
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </PageLayout>
    );
  }

  if (!budget || !profile) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Error al cargar el presupuesto.
          </p>
        </div>
      </PageLayout>
    );
  }

      console.log("BUDGET COMPLETO:", budget);
      console.log("PROFILE:", profile);

      const isLocked = 
      budget.status === "facturado" || 
      budget.status === "cancelado"||
      budget.status === "listo_para_facturar";

      const facturaReal = facturas.find(
  (f) =>
    f.numero === Number(budget?.factura?.numero?.split("-")[1])
);

  // ----------------------------------------------------
  // STATUS LABELS
  // ----------------------------------------------------
  const statusLabels: Record<Budget["status"], string> = {
    draft: "Borrador",
    sent: "Enviado",
    accepted: "Aceptado",
    rejected: "Rechazado",
    listo_para_facturar: "Listo para facturar",
    facturado: "Facturado",
    cancelado: "Cancelado",
  };

  const statusStyles: Record<Budget["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "status-sent",
  accepted: "status-accepted",
  rejected: "bg-destructive/10 text-destructive",
  listo_para_facturar: "bg-blue-100 text-blue-600",
  facturado: "bg-green-600 text-white",
  cancelado: "bg-red-600 text-white",
};



// ----------------------------------------------------
// ABRIR APP DE FACTURACIÓN
// ----------------------------------------------------

const generarFactura = async () => {
  
  // 🔒 EVITA DOBLE CLICK
  if (loadingAFIP) return;

  setLoadingAFIP(true); // 🔥 ACTIVAR ANIMACIÓN
  
  if (budget.factura) {
    alert("Esta factura ya fue emitida");
    return;
  }

  if (budget.status !== "listo_para_facturar") {
    alert("Primero debes generar la factura preliminar");
    return;
  }

  if (!budget.total || budget.total <= 0) {
    alert("El total no puede ser cero");
    return;
  }

  
  if (!budget) return;
  // 🔥 BLOQUEO COMPLETO (FACTURADO + CANCELADO)
  if (budget.factura) {
    alert("Este presupuesto ya tiene una factura generada");
    return;
  }

  if (budget.status === "facturado" || budget.status === "cancelado") {
    alert("Este presupuesto ya tiene una factura asociada");
    return;
  }

  try {
      const totalFinal = Number(budget.total || 0);
      const subtotal = totalFinal;
      const ivaAmount = 0;

// 👉 USD DESPUÉS DEL IVA
let totalUSD = "";

if (currency === "USD") {
  const rate = Number(exchangeRate || 0);

  if (rate > 0) {
    totalUSD = String(Math.floor(totalFinal / rate));
  }
}

    // -----------------------------------------
    // 🔗 BACKEND
    // -----------------------------------------
    const response = await fetch("https://facturacion-server-backend.onrender.com/api/factura", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
      cliente: budget.clientName,
      total: totalFinal,
      subtotal: totalFinal,
      iva: 0,
      invoiceType: "C",
      ivaCondition,
      currency,
      exchangeRate,
      totalUSD,
      formaPago,
      descripcion: "Trabajo de instalación"
      })
    });

    if (!response.ok) {
    const errorText = await response.text();
    console.error("ERROR BACKEND:", errorText);
    return;
    }

    const data = await response.json();

    console.log("DATA BACKEND FACTURA:", data);



    const dataConNumero = {
    numero: data.numero, 
    cliente: data.cliente,
    total: Math.round(Number(data.total || 0)),
    subtotal,
    currency,
    exchangeRate,
    totalUSD,
    formaPago,
    CAE: data.CAE,
    vencimiento: data.vencimiento
    };

    registrarFactura({
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    total: Math.round(Number(data.total || 0)),
    numero: Number(data.numero?.split("-")[1]),
    puntoVenta: Number(data.numero?.split("-")[0]),
    cae: data.CAE,
    vencimientoCae: data.vencimiento,
    estado: "facturado",
    synced: true,
    });

    console.log("RESPUESTA BACKEND FACTURA:", data);
    console.log("NUMERO:", data.numero);
    console.log("FACTURA BACKEND RAW:", data.numeroFactura);
    console.log("FACTURA GUARDADA EN BUDGET:", dataConNumero);

    // 🔥 UN SOLO OBJETO (sin duplicados)
    const updatedBudgetFactura = {
      ...budget,
      status: "facturado",
      factura: dataConNumero,
      facturaPreliminar: undefined,
      };

      await saveBudget(updatedBudgetFactura);
      setBudget(updatedBudgetFactura);

    // 🔥 estado local
    setFactura(dataConNumero);

    // 🔥 persistencia extra (opcional)
    localStorage.setItem(
      `factura-${budget.id}`,
      JSON.stringify(dataConNumero)
    );

    // scroll automático
    setTimeout(() => {
    facturaRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start" 
    });
    }, 100);
    } catch (error) {
  console.error("Error al generar factura", error);

   } finally {
    setLoadingAFIP(false); // 🔥 APAGA ANIMACIÓN SIEMPRE
}
};

const imprimirFactura = () => {
  const contenido = facturaRef.current;

  if (!contenido) return;

  const ventana = window.open("", "_blank");

  // 🔥 CLONAMOS LOS ESTILOS DEL DOCUMENTO ORIGINAL
  const estilos = Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join("");
      } catch (e) {
        return "";
      }
    })
    .join("\n");

  ventana.document.write(`
    <html>
      <head>
        <title>Factura</title>
        <style>${estilos}</style>
      </head>
      <body>
        ${contenido.outerHTML}
      </body>
    </html>
  `);

  ventana.document.close();

  ventana.onload = () => {
    ventana.focus();
    ventana.print();
    ventana.close();
  };
};

const descargarPDF = () => {
  const elemento = facturaRef.current;
  if (!elemento) return;
  const opt = {
    margin:       10,
    filename:     `Factura_${factura?.numero || "sin-numero"}_${budget?.clientName || "cliente"}.pdf`,
    image:        { type: "jpeg", quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
  };
  html2pdf().set(opt).from(elemento).save();
};


const formatearTelefono = (telefono: string) => {
  if (!telefono) return "";

  // sacar todo lo que no sea número
  let limpio = telefono.replace(/\D/g, "");

  // si empieza con 0 → lo sacamos
  if (limpio.startsWith("0")) {
    limpio = limpio.substring(1);
  }

  // si no tiene código país → lo agregamos
  if (!limpio.startsWith("54")) {
    limpio = "54" + limpio;
  }

  // agregar 9 para celulares (Argentina)
  if (!limpio.startsWith("549")) {
    limpio = limpio.replace(/^54/, "549");
  }

  return limpio;
};

const enviarWhatsApp = () => {
  if (!budget || !client) return;
  const telefono = formatearTelefono(client.phone || "");
  if (!telefono) {
    alert("El cliente no tiene teléfono cargado");
    return;
  }
  const mensaje = `Hola ${budget.clientName},
Te envío la factura correspondiente:
🧾 Factura N° ${budget.number}
💲 Total ( impuestos incluidos): $${budget.total.toLocaleString("es-AR")}
Gracias por tu confianza.`;
  const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
};

const cancelarFactura = async () => {
  
   // 🔒 EVITA DOBLE CLICK
  if (loadingAFIP) return;
    
  if (budget.notaCredito) {
    alert("Esta factura ya fue cancelada");
    return;
  }

  if (!budget.factura) {
    alert("No hay factura para cancelar");
    return;
  }

  const confirmar = confirm("¿Deseás cancelar esta factura?");
  if (!confirmar) return;

setLoadingAFIP(true); // 🔥 ACTIVA ANIMACIÓN

  try {
    const response = await fetch(
      "https://facturacion-server-backend.onrender.com/api/nota-credito",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          facturaNumero: budget.factura.numero,
          total: budget.factura.total
        })
      }
    );

    const data = await response.json();

    const dataConNumero = {
      numero: data.numero,
      facturaAsociada: data.facturaAsociada,
      total: Math.round(Number(data.total || 0))
    };

    cancelarFacturaStore(
    Number(budget.factura.numero.split("-")[1]),
    dataConNumero
    );

    const updatedBudgetCancelado = {
      ...budget,
      notaCredito: dataConNumero,
      status: "cancelado"
    };

    // ✅ TODO ADENTRO DEL TRY
    await saveBudget(updatedBudgetCancelado);
    setBudget(updatedBudgetCancelado);

    alert("Factura cancelada correctamente");

  } catch (error) {
    console.error("Error al cancelar factura", error);

     } finally {
    setLoadingAFIP(false); // 🔥 APAGA ANIMACIÓN SIEMPRE
  }
};

const generarPreliminar = async () => {
  if (!budget) return;

  const updatedBudget = {
    ...budget,
    facturaPreliminar: {
      ivaCondition,
      currency,
      exchangeRate,
      formaPago,
    },
    status: "listo_para_facturar",
  };

  await saveBudget(updatedBudget);
  setBudget(updatedBudget);

  setTimeout(() => {
    facturaRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
};



  return (
    <PageLayout>
      {/* HEADER */}
      <div className="sticky top-0 z-50 flex items-center gap-3 bg-background py-3 px-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/budgets")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1">
        <h1 className="font-bold text-lg text-foreground whitespace-nowrap">Presupuesto #{budget.number}</h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-destructive"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      {/* STATUS + CATEGORY */}
      <div className="flex gap-2 mb-4">
        <span
          className={cn(
            "text-xs px-3 py-1 rounded-full",
            CATEGORY_COLORS[budget.category]
          )}
        >
          {CATEGORY_LABELS[budget.category]}
        </span>

        <span
          className={cn(
            "text-xs px-3 py-1 rounded-full",
            statusStyles[budget.status]
          )}
        >
          {statusLabels[budget.status]}
        </span>
      </div>
      
{/* CLIENTE */}
<div className="card-elevated p-4 space-y-2">
  <h3 className="font-semibold text-primary">Cliente</h3>
  <p className="text-foreground">{budget.clientName}</p>
</div>

{/* TIPO DE INSTALACIÓN */}
<div className="card-elevated p-4 space-y-2">
  <h3 className="font-semibold text-primary">Tipo de Instalación</h3>
  <p className="text-foreground">
    {CATEGORY_LABELS[budget.category]}
  </p>
</div>

{/* DETALLES POR CATEGORÍA */}
{budget.category === "ac" && budget.acEquipment && (
  <div className="card-elevated p-4 space-y-2">
    <h3 className="font-semibold text-primary">Datos del Equipo</h3>
    <p>Capacidad: {budget.acEquipment.capacity} frigorías</p>
    <p>Tecnología: {budget.acEquipment.technology}</p>
    <p>Estado: {budget.acEquipment.status}</p>
  </div>
)}

{budget.category === "solar" && budget.solarSystem && (
  <div className="card-elevated p-4 space-y-2">
    <h3 className="font-semibold text-primary">Datos del Sistema FV</h3>
    <p>Tipo de sistema: {budget.solarSystem.systemType}</p>
    <p>Panel: {budget.solarSystem.panelType} - {budget.solarSystem.panelPower} W</p>
    <p>Cantidad de paneles: {budget.solarSystem.quantity}</p>
    <p>Potencia total: {budget.solarSystem.totalPower} W</p>
  </div>
)}

{budget.category === "electric" && budget.electricWorkDescription && (
  <div className="card-elevated p-4 space-y-2">
    <h3 className="font-semibold text-primary">Descripción del Trabajo</h3>
    <p className="whitespace-pre-line text-foreground">
      {budget.electricWorkDescription}
    </p>
  </div>
)}

      {/* ITEMS */}
      <div className="card-elevated p-4 mb-4">
        <h3 className="text-sm text-muted-foreground mb-3">Detalle</h3>

        <div className="space-y-2">
          {budget.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-foreground">
                {item.quantity}x {item.description}
              </span>

              <span className="text-muted-foreground">
                ${(item.quantity * item.unitPrice).toLocaleString("es-AR")}
              </span>
            </div>
          ))}
        </div>

        {/* SUBTOTALS */}
        <div className="border-t border-border mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Materiales</span>
            <span>${budget.subtotal.toLocaleString("es-AR")}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mano de Obra</span>
            <span>${budget.laborCost.toLocaleString("es-AR")}</span>
          </div>
         
          {budget.discount > 0 && (
            <div className="flex justify-between text-sm text-accent">
              <span>Descuento</span>
              <span>-${budget.discount.toLocaleString("es-AR")}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">
              ${budget.total.toLocaleString("es-AR", {
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* TERMS */}
      <div className="card-elevated p-4 mb-4">
        <h3 className="text-sm text-muted-foreground mb-3">Condiciones</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Validez</span>
            <span>{budget.validityDays} días</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Garantía</span>
            <span>{budget.warranty}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Forma de Pago</span>
            <span>{budget.paymentTerms}</span>
          </div>
        </div>

        {budget.notes && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">Observaciones:</p>
            <p className="text-sm mt-1">{budget.notes}</p>
          </div>
        )}
      </div>

      {/* SHARE / ACTIONS */}
      <div className="card-elevated p-4">
        <ShareOptions
          budget={budget}
          profile={profile}
          onStatusChange={loadData}
          disabled={isLocked}
        />
      </div>

      {/* FACTURAR */}
      <div className="mt-4">
      <Button
      className="w-full btn-gradient"
            onClick={() => setShowFiscalModal(true)}
      disabled={budget.status === "facturado" || budget.status === "cancelado"}
      >
      {budget.status === "facturado"
        ? "Factura generada"
         : budget.status === "cancelado"
         ? "Factura cancelada"
         : "Introducir datos fiscales"}
      </Button>
      </div>

      {/* FACTURA preliminar */}
      {(factura || budget.facturaPreliminar) && profile && budget && (
      <>
      <div ref={facturaRef} className="mt-4 print-area pb-4">
      <FacturaView
        factura={facturaReal || factura || budget.facturaPreliminar}
        profile={profile}
        budget={budget}
        preliminar={budget.status === "listo_para_facturar"}
        />
      </div>

      
     

      {budget.status === "listo_para_facturar" && (
  <div className="mt-2">
    <Button
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      onClick={generarFactura}
      >
      Emitir Factura
    </Button>
  </div>
)}


      {/* BOTÓN PDF */}
            <div className="mt-2">
      <Button
        className="w-full"
        onClick={descargarPDF}
        >
           Descargar Factura
      </Button>

      <Button
        className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
        onClick={enviarWhatsApp}
        >
          Enviar por WhatsApp
      </Button>

      {budget.notaCredito ? (
  
  <div className="w-full mt-2">
  <div className="w-full h-10 bg-red-600 text-white rounded-md flex items-center justify-center font-medium">
    Factura cancelada correctamente
  </div>
</div>

) : (
  <Button
    className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
    onClick={cancelarFactura}
  >
    Cancelar Factura
  </Button>
)}
      </div>
     </> 
)}          
    
 {showFiscalModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">

      <h2 className="text-lg font-bold">Datos Fiscales</h2>

      <div>
  <label className="text-sm">Condición frente al IVA</label>
  <select
    className="w-full border p-2 rounded"
    value={ivaCondition}
    onChange={(e) => setIvaCondition(e.target.value)}
  >
    <option>Consumidor Final</option>
    <option>Responsable Inscripto</option>
    <option>Monotributista</option>
    <option>Exento</option>
  </select>
  </div>
      
      {/* MONEDA */}
<div>
      <label className="text-sm">Moneda</label>
      <select
      className="w-full border p-2 rounded"
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      >
      <option value="ARS">Pesos</option>
      <option value="USD">USD</option>
      </select>
</div>

      {/* FORMA DE PAGO */}
<div>
  <label className="text-sm">Forma de pago</label>
  <select
    className="w-full border p-2 rounded"
    value={formaPago}
    onChange={(e) => setFormaPago(e.target.value)}
    >
    <option>Efectivo / Contado</option>
    <option>Transferencia</option>
    <option>Mercado Pago</option>
    <option>Tarjeta de Débito</option>
    <option>Tarjeta de Crédito</option>
    <option>Cuenta Corriente</option>
    <option>Otro</option>
  </select>
</div>

{/* TIPO DE CAMBIO */}
{currency === "USD" && (
  <div>
    <label className="text-sm">Tipo de cambio</label>
    <input
      className="w-full border p-2 rounded"
      value={exchangeRate}
      onChange={(e) => setExchangeRate(e.target.value)}
      placeholder="Ej: 1000"
    />
  </div>
)}

      {/* BOTONES */}
      <div className="flex gap-2">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setShowFiscalModal(false)}
        >
          Cancelar
        </Button>

        <Button
          className="w-full"
          onClick={() => {
            generarPreliminar(); // usamos tu función actual por ahora
            setShowFiscalModal(false);
          }}
          >
          Generar Factura Preliminar
        </Button>
      </div>
    </div>
  </div>
)}  

{/* 🔥 ANIMACIÓN AFIP */}
{loadingAFIP && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
    
    <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center gap-6">

      <p className="font-semibold text-sm">
        Comunicando con AFIP...
      </p>

      <div className="flex items-center gap-6">

        {/* SISTEMA */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
            🧾
          </div>
          <span className="text-xs mt-2">Sistema</span>
        </div>

        {/* FLECHAS ANIMADAS */}
        <div className="flex flex-col items-center gap-2">

          <div className="flex gap-1 text-blue-500 animate-pulse">
            <span>→</span>
            <span>→</span>
            <span>→</span>
          </div>

          <div className="flex gap-1 text-green-500 animate-pulse">
            <span>←</span>
            <span>←</span>
            <span>←</span>
          </div>

        </div>

        {/* AFIP */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center text-xl">
            🏛️
          </div>
          <span className="text-xs mt-2">AFIP</span>
        </div>

      </div>

      <p className="text-xs text-muted-foreground text-center">
        Enviando datos fiscales y esperando respuesta...
      </p>

    </div>
  </div>
)}
    
    </PageLayout>
  );
};

export default BudgetDetailPage;