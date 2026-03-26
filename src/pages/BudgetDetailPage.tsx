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

  // ----------------------------------------------------
  // STATUS LABELS
  // ----------------------------------------------------
  const statusLabels: Record<Budget["status"], string> = {
    draft: "Borrador",
    sent: "Enviado",
    accepted: "Aceptado",
    rejected: "Rechazado",
    facturado: "Facturado",
  };

  const statusStyles: Record<Budget["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "status-sent",
  accepted: "status-accepted",
  rejected: "bg-destructive/10 text-destructive",
};

// ----------------------------------------------------
// ABRIR APP DE FACTURACIÓN
// ----------------------------------------------------

const generarFactura = async () => {
  if (!budget) return;

  // 🔥 BLOQUEO COMPLETO (FACTURADO + CANCELADO)
  if (budget.status === "facturado" || budget.status === "cancelado") {
    alert("Este presupuesto ya tiene una factura asociada");
    return;
  }

  try {
    const response = await fetch("https://facturacion-server-backend.onrender.com/api/factura", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cliente: budget.clientName,
        total: budget.total,
        descripcion: "Trabajo de instalación"
      })
    });

    const data = await response.json();

    const dataConNumero = {
    numero: data.numero, // 🔥 ESTE ES EL FIX
    cliente: data.cliente,
    total: Math.round(data.total),
    CAE: data.CAE,
    vencimiento: data.vencimiento
    };

    console.log("RESPUESTA BACKEND FACTURA:", data);
    console.log("NUMERO:", data.numero);
    console.log("FACTURA BACKEND RAW:", data.numeroFactura);
    console.log("FACTURA GUARDADA EN BUDGET:", dataConNumero);

    // 🔥 UN SOLO OBJETO (sin duplicados)
    const updatedBudgetFactura = {
      ...budget,
      status: "facturado",
      factura: dataConNumero
    };

    await saveBudget(updatedBudgetFactura);
    
    setBudget({
  ...updatedBudgetFactura,
    factura: { ...dataConNumero } // 🔥 CLAVE
    });

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
    filename:     `Factura-${budget?.number}.pdf`,
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
💲 Total: $${budget.total.toLocaleString("es-AR")}
Gracias por tu confianza.`;
  const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
};

const cancelarFactura = async () => {
  if (!factura || !budget) return;

  const confirmar = confirm("¿Deseás cancelar esta factura?");
  if (!confirmar) return;

  try {
    const response = await fetch("https://facturacion-server-backend.onrender.com/api/nota-credito", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
      facturaNumero: factura.numero,
      total: factura.total
      })
    });

    const data = await response.json();
    console.log("RESPUESTA NC:", data);

    // 🔥 NUMERO AFIP NC
   const dataConNumero = {
  numero: data.numero, // 🔥 FORZAMOS
  cliente: data.cliente,
  total: Math.round(data.total),
  CAE: data.CAE,
  vencimiento: data.vencimiento
};

console.log("NC GENERADA:", dataConNumero);

    // ✅ LOG CORRECTO (después de declarar)
    console.log("NC FINAL:", dataConNumero);

    // 🔥 ACTUALIZAR PRESUPUESTO
    const updatedBudgetCancelado = {
      ...budget,
      status: "cancelado",
      factura: budget.factura,
      notaCredito: {
        ...dataConNumero,
        facturaAsociada: data.facturaAsociada
      }
    };

    await saveBudget(updatedBudgetCancelado);
    setBudget(updatedBudgetCancelado);

    alert("Factura cancelada correctamente");

  } catch (error) {
    console.error("Error al cancelar factura", error);
  }
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

          {budget.taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA ({budget.taxRate}%)</span>
              <span>${budget.taxAmount.toLocaleString("es-AR")}</span>
            </div>
          )}

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
        />
      </div>

      {/* FACTURAR */}
      <div className="mt-4">
      <Button
      className="w-full btn-gradient"
      onClick={generarFactura}
      disabled={budget.status === "facturado" || budget.status === "cancelado"}
      >
      {budget.status === "facturado"
        ? "Factura generada"
         : budget.status === "cancelado"
         ? "Factura cancelada"
         : "Generar Factura"}
      </Button>
      </div>

      {/* FACTURA */}
      {factura && profile && budget &&(
      <>
      <div ref={facturaRef} className="mt-4 print-area pb-4">
      <FacturaView factura={factura} profile={profile} budget={budget}/>
      </div>

      

      {budget.status === "cancelado" && (
      <div className="text-center text-red-600 font-bold mt-2">
        ⚠️ Factura anulada mediante Nota de Crédito
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

      <Button
        className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
        onClick={cancelarFactura}
        >
          Cancelar Factura
      </Button>
      </div>

     {/* NOTA DE CRÉDITO */}
{budget.notaCredito && (
  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
    <h2 className="font-bold text-red-600 text-lg mb-2">
      Nota de Crédito C
    </h2>

    <p>
      <strong>Número:</strong> {budget.notaCredito.numero}
    </p>

    <p>
      <strong>Factura asociada:</strong>{" "}
      {budget.notaCredito.facturaAsociada || "No disponible"}
    </p>

    <p>
      <strong>Total:</strong>{" "}
      {"$" + budget.notaCredito.total.toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}
    </p>
  </div>
)}
 </> 
)}          
    </PageLayout>
  );
};

export default BudgetDetailPage;