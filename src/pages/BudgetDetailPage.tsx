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
import { CheckCircle, XCircle } from "lucide-react";
import { Server, Building2 } from "lucide-react";


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
  const [progress, setProgress] = useState(0);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);


  useEffect(() => {
    if (!loadingAFIP) return;

    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [loadingAFIP]);

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
      setFactura({
        ...b.factura,
        cae: b.factura.cae || b.cae,
        vencimiento: b.factura.vencimiento || b.vencimiento
      });
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
    budget.status === "cancelado" ||
    budget.status === "listo_para_facturar";


  const numeroBuscado = budget?.factura?.numero?.split?.("-")?.[1];

  const facturaReal = facturas.find(
    (f) => f.numero === Number(numeroBuscado)
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

    // 🔒 VALIDACIONES PRIMERO (SIN LOADING)
    if (loadingAFIP) return;

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

    setLoadingAFIP(true); // 🔥 ACTIVAR ANIMACIÓN


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

        setLoadingAFIP(false); // 🔥 APAGAR
        return;
      }

      const data = await response.json();

      console.log("RESPUESTA BACKEND NC:", data);

      console.log("DATA BACKEND FACTURA:", data);



      const dataConNumero = {
        numero: data.numero,
        cliente: data.cliente,
        total: Math.round(Number(data.total || 0)),
        subtotal,

        // 🔴 CAMBIO CLAVE
        currency: budget.facturaPreliminar?.currency || currency,
        exchangeRate: budget.facturaPreliminar?.exchangeRate || exchangeRate,

        totalUSD,
        formaPago: budget.facturaPreliminar?.formaPago || formaPago,

        cae: data.cae,
        vencimiento: data.vencimiento,
        fecha: new Date().toISOString(),
      };
      console.log("FACTURA FINAL:", dataConNumero);

      const numeroParts = data.numero ? data.numero.split("-") : ["00001", "0"];

      registrarFactura({
        id: crypto.randomUUID(),
        fecha: new Date().toISOString(),
        total: Math.round(Number(data.total || 0)),
        numero: Number(numeroParts[1]),
        puntoVenta: Number(numeroParts[0]),
        cae: data.cae,
        vencimientoCae: data.vencimiento,
        estado: "facturado",
        synced: true,
      });

      console.log("RESPUESTA BACKEND FACTURA:", data);
      console.log("NUMERO:", data.numero);
      console.log("FACTURA BACKEND RAW:", data);
      console.log("DATA COMPLETA:", data);
      console.log("FACTURA GUARDADA EN BUDGET:", dataConNumero);

      // 🔥 UN SOLO OBJETO (sin duplicados)
      const updatedBudgetFactura = {
        ...budget,
        status: "facturado",
        factura: dataConNumero,

        // 🔴 IMPORTANTE: conservar datos
        facturaPreliminar: {
          ...budget.facturaPreliminar
        }
      };

      await saveBudget(updatedBudgetFactura);
      setBudget(updatedBudgetFactura);

      // 🔥 estado local
      setFactura(dataConNumero);

      // 🔥 FINAL PROCESO AFIP
      setProgress(100);

      setTimeout(() => {
        setLoadingAFIP(false);
      }, 500);


      // 🔥 persistencia extra (opcional)
      localStorage.setItem(
        `factura-${budget.id}`,
        JSON.stringify(dataConNumero)
      );

      // scroll automático
      setTimeout(() => {
        facturaRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

    } catch (error) {
      console.error("Error al generar factura", error);
      setLoadingAFIP(false);
    }
  };

  const imprimirFactura = () => {
    const contenido = facturaRef.current;
    if (!contenido) return;

    // 🔥 CLONAR CONTENIDO (NO TOCAR ORIGINAL)
    const clon = contenido.cloneNode(true) as HTMLElement;

    // 🔥 APLICAR ESTILOS A4 CENTRALIZADOS
    const aplicarEstilosA4 = (root: HTMLElement) => {

      const reglas: { selector: string; estilos: Partial<CSSStyleDeclaration> }[] = [

        // CONTENEDOR GENERAL
        {
          selector: "div",
          estilos: {
            fontSize: "10px",
            lineHeight: "1.3",
          }
        },

        // TITULO PRINCIPAL
        {
          selector: "h1",
          estilos: {
            fontSize: "40px",
          }
        },

        // SUBTITULOS
        {
          selector: "h2",
          estilos: {
            fontSize: "12px",
          }
        },

        // TEXTO GENERAL
        {
          selector: "p, span",
          estilos: {
            fontSize: "10px",
          }
        },

        // TABLAS
        {
          selector: "table",
          estilos: {
            fontSize: "9px",
            width: "100%",
            borderCollapse: "collapse",
          }
        },

        // CELDAS
        {
          selector: "th, td",
          estilos: {
            padding: "4px",
          }
        },

        // EMPRESA (tu clase específica)
        {
          selector: ".empresa-nombre",
          estilos: {
            fontSize: "12px",
            fontWeight: "bold",
          }
        },

      ];

      reglas.forEach(({ selector, estilos }) => {
        root.querySelectorAll(selector).forEach(el => {
          Object.assign((el as HTMLElement).style, estilos);
        });
      });
    };

    // 🔥 aplicar estilos
    aplicarEstilosA4(clon);

    // 🔥 abrir ventana
    const ventana = window.open("", "_blank");
    if (!ventana) return;

    // 🔥 escribir HTML LIMPIO (sin copiar estilos rotos)
    ventana.document.write(`
    <html>
      <head>
        <title>Factura</title>
        <style>
          @page {
            size: A4;
            margin: 8mm;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        ${clon.outerHTML}
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

    // 🔧 ESCALA SOLO PARA PDF
    elemento.style.transform = "scale(0.88)";
    elemento.style.transformOrigin = "top left";

    // 🔧 AJUSTE SOLO PARA PDF
    const header = elemento.querySelector(".empresa-nombre");
    const titulo = elemento.querySelector(".titulo-factura");
    if (header) header.style.marginBottom = "-20px";
    if (titulo) titulo.style.marginTop = "-20px";

    const opt = {
      margin: [5, 63, 5, 55],
      filename: `Factura_${factura?.numero || "sin-numero"}_${budget?.clientName || "cliente"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(elemento).save().then(() => {

      // 🔄 Restaurar estilos
      if (header) header.style.marginBottom = "";
      if (titulo) titulo.style.marginTop = "";
      elemento.style.transform = "";
    });
  };

  const imprimirTicket80mm = () => {
    const contenido = facturaRef.current;
    if (!contenido) return;

    const ventana = window.open("", "_blank");

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
        <title>Ticket 80mm</title>
    <style>
  ${estilos}

  @page {
    size: 80mm auto;
    margin: 0;
  }

  body {
    margin: 0;
    padding: 0;
    width: 80mm;
    background: white;
  }

  .print-area {
    width: 80mm !important;
    padding: 4mm !important;
    box-sizing: border-box;
  }

  .empresa-nombre {
  font-size: 13px !important;
  }    

  /* 🔥 COMPACTO REAL */
  h1 { font-size: 26px !important; }
  h2 { font-size: 15px !important; }

  p, span, div {
    font-size: 11px !important;
    line-height: 1.2 !important;
  }

  table {
    font-size: 11px !important;
  }

  /* 🔥 OCULTAR BOTÓN AL IMPRIMIR */
  @media print {
    button {
      display: none !important;
    }
  }

</style>
      </head>
      
  <body>

  <!-- 🔹 CONTENIDO DEL TICKET -->
  <div class="print-area">
    ${contenido.outerHTML}
  </div>

  <!-- 🔹 BOTÓN IMPRIMIR -->
  <div style="text-align:center; margin-top:10px;">
    <button onclick="window.print()" style="
      padding:10px;
      font-size:14px;
      background:black;
      color:white;
      border:none;
      border-radius:5px;
      width:90%;
    ">
      Imprimir Ticket
    </button>
  </div>

</body>
    </html>
  `);

    ventana.document.close();
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
        total: Math.round(Number(data.total || 0)),
        CAE: data.CAE,
        vencimiento: data.vencimiento,
        fecha: new Date().toISOString()
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

      // 🔥 FINAL PROCESO
      setProgress(100);

      setTimeout(() => {
        setLoadingAFIP(false);
      }, 500);

    } catch (error) {
      console.error("Error al cancelar factura", error);

      // 🔴 IMPORTANTE
      setLoadingAFIP(false);
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

    const budgetLimpio = {
      ...updatedBudget,
      notaCredito: null // 🔥 clave
    };

    console.log("ANTES DE GUARDAR:", updatedBudget);

    await saveBudget(budgetLimpio);
    setBudget(budgetLimpio);

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
      <div className="card-elevated p-3 space-y-1 text-[15px]">
        <h3 className="font-semibold text-primary text-sm">Cliente</h3>
        <p className="text-foreground">{budget.clientName}</p>
      </div>

      {/* TIPO DE INSTALACIÓN */}
      <div className="card-elevated p-3 space-y-1 text-[15px]">
        <h3 className="font-semibold text-primary text-sm">Tipo de Instalación</h3>
        <p className="text-foreground">
          {CATEGORY_LABELS[budget.category]}
        </p>
      </div>

      {/* DETALLES POR CATEGORÍA */}
      {budget.category === "ac" && budget.acEquipment && (
        <div className="card-elevated p-3 space-y-1 text-[15px]">
          <h3 className="font-semibold text-primary text-sm">Datos del Equipo</h3>
          <p>Capacidad: {budget.acEquipment.capacity} frigorías</p>
          <p>Tecnología: {budget.acEquipment.technology}</p>
          <p>Estado: {budget.acEquipment.status}</p>
        </div>
      )}

      {budget.category === "solar" && budget.solarSystem && (
        <div className="card-elevated p-3 space-y-1 text-[15px] ">
          <h3 className="font-semibold text-primary text-sm">Datos del Sistema FV</h3>
          <p>Tipo de sistema: {budget.solarSystem.systemType}</p>
          <p>Panel: {budget.solarSystem.panelType} - {budget.solarSystem.panelPower} W</p>
          <p>Cantidad de paneles: {budget.solarSystem.quantity}</p>
          <p>Potencia total: {budget.solarSystem.totalPower} W</p>
        </div>
      )}

      {budget.category === "electric" && budget.electricWorkDescription && (
        <div className="card-elevated p-3 space-y-1 text-[15px]">
          <h3 className="font-semibold text-primary text-sm ">Descripción del Trabajo</h3>
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

        {budget.status === "facturado" ? (

          // 🟢 FACTURA GENERADA
          <div className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-md font-semibold">
            <CheckCircle className="w-5 h-5" />
            Factura generada
          </div>

        ) : budget.status === "cancelado" ? (

          // 🔴 FACTURA CANCELADA
          <div className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-md font-semibold">
            <XCircle className="w-5 h-5" />
            Factura cancelada
          </div>

        ) : (

          // 🔵 BOTÓN NORMAL
          <Button
            className="w-full btn-gradient"
            onClick={() => setShowFiscalModal(true)}
          >
            Introducir datos fiscales
          </Button>

        )}

      </div>

      {/* FACTURA preliminar */}
      {(factura || budget.facturaPreliminar) && profile && budget && (
        <>
          <div ref={facturaRef} className="mt-4 print-area pb-4">
            <FacturaView
              factura={factura || budget.facturaPreliminar}
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
              onClick={() => setShowDownloadOptions(true)}
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

      {showDownloadOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-[280px] space-y-4">

            <h2 className="text-center font-bold">Elegir formato</h2>

            {/* PDF A4 */}
            <Button
              className="w-full"
              onClick={() => {
                descargarPDF();
                setShowDownloadOptions(false);
              }}
            >
              📄 PDF A4
            </Button>

            {/* TICKET */}
            <Button
              className="w-full bg-gray-800 text-white"
              onClick={() => {
                imprimirTicket80mm();
                setShowDownloadOptions(false);
              }}
            >
              🧾 Ticket 80mm
            </Button>

            {/* CANCELAR */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDownloadOptions(false)}
            >
              Cancelar
            </Button>

          </div>

        </div>
      )}


      {/* ANIMACIÓN AFIP PRO */}
      {loadingAFIP && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">

          <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center gap-6 w-[300px]">

            {/* TÍTULO */}
            <p className="font-semibold text-sm">
              Comunicando con AFIP...
            </p>

            {/* CONTENIDO */}
            <div className="flex items-center gap-6">

              {/* SISTEMA */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center animate-pulse">
                  <Server className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-xs mt-2">System SICE</span>
              </div>

              {/* FLECHAS ANIMADAS (IDA Y VUELTA REAL) */}
              <div className="flex flex-col items-center gap-2">

                {/* IDA */}
                <div className="flex gap-1 text-blue-500">
                  <span className="animate-[pulse_1s_infinite]">→</span>
                  <span className="animate-[pulse_1s_infinite_0.2s]">→</span>
                  <span className="animate-[pulse_1s_infinite_0.4s]">→</span>
                </div>

                {/* VUELTA */}
                <div className="flex gap-1 text-green-500">
                  <span className="animate-[pulse_1s_infinite]">←</span>
                  <span className="animate-[pulse_1s_infinite_0.2s]">←</span>
                  <span className="animate-[pulse_1s_infinite_0.4s]">←</span>
                </div>

              </div>

              {/* AFIP */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center animate-pulse">
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
                <span className="text-xs mt-2">ARCA</span>
              </div>

            </div>

            {/* TEXTO */}
            <p className="text-xs text-muted-foreground text-center animate-pulse">
              Enviando datos fiscales y esperando validación...
            </p>

            {/* SPINNER EXTRA */}
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

            {/* BARRA DE PROGRESO */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* % opcional */}
            <span className="text-xs text-muted-foreground">
              {Math.floor(progress)}%
            </span>

          </div>
        </div>
      )}

    </PageLayout>
  );
};

export default BudgetDetailPage;

