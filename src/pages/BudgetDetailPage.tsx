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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
import { FacturaTicket80mm } from "@/components/FacturaTicket80mm";
import { NotaCreditoTicket80mm } from "@/components/NotaCreditoTicket80mm";
import ReactDOMServer from "react-dom/server";
import { FacturaA4 } from "@/components/FacturaA4";
import { NotaCreditoA4 } from "@/components/NotaCreditoA4";
import supabase from "../database/supabaseClient.js";
import { ReciboA4 } from "@/components/ReciboA4";
import { ReciboTicket80mm } from "@/components/ReciboTicket80mm";


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
  const [showNotaCreditoDownloadOptions, setShowNotaCreditoDownloadOptions] = useState(false);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>("Anulación total de la operación");
  const [cancelReasonOther, setCancelReasonOther] = useState("");
  const cancelReasonOptions = [
    "Anulación total de la operación",
    "Error en datos del cliente",
    "Error en importe",
    "Bonificación / descuento",
    "Devolución de productos",
    "Rescisión de servicio",
    "Ajuste administrativo",
    "Otro (especificar)",
  ];
  const [confirmandoPago, setConfirmandoPago] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [recibo, setRecibo] = useState(null);
  const [showReciboOptions, setShowReciboOptions] = useState(false);


  useEffect(() => {
    const obtenerRecibo = async () => {
      try {
        const res = await fetch(
          `https://facturacion-server-backend.onrender.com/api/recibo/${factura?.numero}`
        );

        if (!res.ok) return;

        const data = await res.json();

        if (data) {
          setRecibo(data);
        }

      } catch (err) {
        console.error("Error cargando recibo:", err);
      }
    };

    if (factura?.numero) {
      obtenerRecibo();
    }
  }, [factura]);


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
      const totalARS = Math.round(Number(budget.total || 0));

      let totalUSD = null;

      if (currency === "USD") {
        const rate = Number(exchangeRate || 0);

        if (rate > 0) {
          totalUSD = Math.round(totalARS / rate);
        }
      }

      // -----------------------------------------
      // 🔗 BACKEND
      // -----------------------------------------
      const esUSD = currency === "USD";

      const response = await fetch("https://facturacion-server-backend.onrender.com/api/factura", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cliente: budget.clientName,

          // 🔥 CLAVE
          total: totalARS,        // 🔥 SIEMPRE ARS
          subtotal: totalARS,

          moneda: esUSD ? "USD" : "ARS",
          tipoCambio: esUSD ? Number(exchangeRate) : 1,

          totalUSD: totalUSD,     // 🔥 NUEVO

          iva: 0,
          invoiceType: "C",
          ivaCondition: "Monotributista",
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

        total_usd: totalUSD,
        moneda: currency,
        tipo_cambio: Number(exchangeRate) || null,
        formaPago: budget.facturaPreliminar?.formaPago || formaPago,

        cae: data.cae,
        vencimiento: data.vencimiento,
        fecha: new Date().toISOString(),
        qr: data.qr,
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


  const descargarPDFA4 = () => {
    const contenido = document.getElementById("factura-a4");
    if (!contenido) return;

    // Generar nombre del archivo
    const clientNameSanitized = budget.clientName.replace(/[^a-zA-Z0-9]/g, '_').replace(/\s+/g, '_');
    const filename = `Factura_${clientNameSanitized}_${factura.numero}.pdf`;

    const options = {
      filename: filename
    };

    // Mostrar temporalmente el contenido para capturarlo
    contenido.style.display = "block";
    contenido.style.top = "0";
    contenido.style.left = "0";

    // Usar setTimeout para asegurar que se renderice completamente
    setTimeout(() => {
      html2canvas(contenido, { scale: 2, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        // Solo agregar más páginas si realmente se necesitan
        if (imgHeight <= pageHeight) {
          // El contenido cabe en una página
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        } else {
          // Dividir en múltiples páginas si es necesario
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft > pageHeight) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
        }

        pdf.save(filename);
        contenido.style.display = "none";
        contenido.style.top = "-9999px";
        contenido.style.left = "-9999px";
      });
    }, 1000);
  };

  const descargarNotaCreditoPDFA4 = () => {
    if (!budget?.notaCredito) return;

    const contenido = document.getElementById("nota-credito-a4");
    if (!contenido) return;

    const clientNameSanitized = budget.clientName.replace(/[^a-zA-Z0-9]/g, '_').replace(/\s+/g, '_');
    const filename = `NotaCredito_${clientNameSanitized}_${budget.notaCredito.numero}.pdf`;

    contenido.style.display = "block";
    contenido.style.top = "0";
    contenido.style.left = "0";

    setTimeout(() => {
      html2canvas(contenido, { scale: 2, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        if (imgHeight <= pageHeight) {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        } else {
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft > pageHeight) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
        }

        pdf.save(filename);
        contenido.style.display = "none";
        contenido.style.top = "-9999px";
        contenido.style.left = "-9999px";
      });
    }, 1000);
  };


  const imprimirTicket80mm = () => {
    const clientNameSanitized = budget.clientName.replace(/[^a-zA-Z0-9]/g, '_').replace(/\s+/g, '_');
    const title = `Factura_${clientNameSanitized}_${factura.numero}`;

    const ventana = window.open("", "_blank");

    const html = ReactDOMServer.renderToString(
      <FacturaTicket80mm
        profile={profile}
        factura={factura}
        budget={budget}
      />
    );

    ventana.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            width: 80mm;
          }
        </style>
      </head>

      <body>
        ${html}

        <div style="text-align:center; margin-top:10px;">
          <button onclick="window.print()"
            style="padding:10px; background:black; color:white; border:none; width:90%;">
            Imprimir
          </button>
        </div>
      </body>
    </html>
  `);

    ventana.document.close();
  };

  const imprimirNotaCreditoTicket80mm = () => {
    if (!budget?.notaCredito) return;

    const notaFactura = {
      ...budget.factura,
      ...budget.notaCredito,
      numero: budget.notaCredito?.numero,
    };

    const clientNameSanitized = budget.clientName.replace(/[^a-zA-Z0-9]/g, '_').replace(/\s+/g, '_');
    const title = `NotaCredito_${clientNameSanitized}_${budget.notaCredito.numero}`;

    const ventana = window.open("", "_blank");

    const html = ReactDOMServer.renderToString(
      <NotaCreditoTicket80mm
        profile={profile}
        factura={notaFactura}
        budget={budget}
      />
    );

    ventana.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            width: 80mm;
          }
        </style>
      </head>

      <body>
        ${html}

        <div style="text-align:center; margin-top:10px;">
          <button onclick="window.print()"
            style="padding:10px; background:black; color:white; border:none; width:90%;">
            Imprimir
          </button>
        </div>
      </body>
    </html>
  `);

    ventana.document.close();
  };

  const imprimirReciboA4 = () => {
    const clientNameSanitized = budget.clientName.replace(/[^a-zA-Z0-9]/g, '_').replace(/\s+/g, '_');
    const title = `Recibo_${clientNameSanitized}_${factura.numero}_recibo ${recibo.numero}`;

    const contenido = document.getElementById("recibo-a4");

    const ventana = window.open("", "", "width=800,height=600");

    ventana.document.write(`
    <html>
      <head>
        <title>${title}</title>
      </head>
      <body>
        ${contenido.innerHTML}
      </body>
    </html>
  `);

    ventana.document.close();
    ventana.print();
  };


  const imprimirReciboTicket80mm = () => {
    const clientNameSanitized = budget.clientName.replace(/[^a-zA-Z0-9]/g, '_').replace(/\s+/g, '_');
    const title = `Recibo_${clientNameSanitized}_${factura.numero}_recibo ${recibo.numero}`;

    const ventana = window.open("", "_blank");

    const html = ReactDOMServer.renderToString(
      <ReciboTicket80mm recibo={recibo} />
    );

    ventana.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            width: 80mm;
            font-family: monospace;
          }
        </style>
      </head>

      <body>
        ${html}

        <div style="text-align:center; margin-top:10px;">
          <button onclick="window.print()"
            style="padding:10px; background:black; color:white; border:none; width:90%;">
            Imprimir
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

  const handleStartCancelFactura = () => {
    if (budget?.notaCredito) {
      alert("Esta factura ya fue cancelada");
      return;
    }

    if (!budget?.factura) {
      alert("No hay factura para cancelar");
      return;
    }

    setCancelReason("Anulación total de la operación");
    setCancelReasonOther("");
    setShowCancelReasonModal(true);
  };

  const cancelarFactura = async (motivo: string) => {
    if (loadingAFIP) return;

    setLoadingAFIP(true);
    setShowCancelReasonModal(false);

    try {

      if (!factura || !factura.numero) {
        console.error("❌ FACTURA INVALIDA:", factura);
        setLoadingAFIP(false);
        return;
      }

      const tipoCambio =
        factura.tipo_cambio ?? factura.tipoCambio ?? 1;

      const response = await fetch(
        "https://facturacion-server-backend.onrender.com/api/nota-credito",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            facturaNumero: factura.numero,
            total: factura.total,
            moneda: factura.moneda || "ARS",
            tipoCambio: tipoCambio,
            totalUSD:
              factura.moneda === "USD"
                ? Math.round(Number(factura.total) / Number(tipoCambio))
                : null,
            motivo,
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ ERROR BACKEND NC:", errorText);
        setLoadingAFIP(false);
        return;
      }

      const data = await response.json();

      const dataConNumero = {
        numero: data.numero,

        // 🔥 CLAVE
        facturaAsociada: factura.numero,

        total: Math.round(Number(data.total || 0)),

        // 🔥 AGREGAR ESTO (IMPORTANTE PARA USD)
        moneda: factura.moneda,
        tipo_cambio: tipoCambio,
        total_usd:
          factura.moneda === "USD"
            ? Math.round(Number(factura.total) / Number(tipoCambio))
            : null,

        CAE: data.CAE,
        vencimiento: data.vencimiento,
        fecha: new Date().toISOString(),
        qr: data.qr,
        motivo,
      };

      console.log("✅ NOTA CREDITO GENERADA:", dataConNumero);

      cancelarFacturaStore(
        Number(budget.factura.numero.split("-")[1]),
        dataConNumero
      );

      const updatedBudgetCancelado = {
        ...budget,
        notaCredito: dataConNumero,
        status: "cancelado"
      };

      await saveBudget(updatedBudgetCancelado);
      setBudget(updatedBudgetCancelado);

      toast.success("Factura cancelada correctamente");

      setProgress(100);

      setTimeout(() => {
        setLoadingAFIP(false);
      }, 500);
    } catch (error) {
      console.error("Error al cancelar factura", error);
      setLoadingAFIP(false);
    }
  };

  const handleConfirmCancelFactura = async () => {
    const reason = cancelReason === "Otro (especificar)" ? cancelReasonOther.trim() : cancelReason;
    if (!reason) {
      alert("Por favor ingresa una razón para la cancelación.");
      return;
    }
    await cancelarFactura(reason);
  };

  const generarPreliminar = async () => {
    if (!budget) return;

    const totalARS = Math.round(Number(budget.total || 0));

    let totalUSD = null;

    if (currency === "USD") {
      const rate = Number(exchangeRate || 0);
      if (rate > 0) {
        totalUSD = Math.round(totalARS / rate);
      }
    }

    const updatedBudget = {
      ...budget,
      facturaPreliminar: {
        ivaCondition,
        moneda: currency,
        tipo_cambio: Number(exchangeRate) || null,
        formaPago,
        total: totalARS,
        total_usd: totalUSD,
      },
      status: "listo_para_facturar",
    };

    await saveBudget(updatedBudget);
    setBudget(updatedBudget);
  };


  const registrarPago = async () => {
    try {
      setProcesandoPago(true); // 🔥 inicia animación

      const response = await fetch(
        "https://facturacion-server-backend.onrender.com/api/recibo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            factura_id: factura?.numero,
            cliente: factura?.cliente,
            monto: factura?.total,
            forma_pago: factura?.formaPago,
            moneda: factura?.moneda,
            tipoCambio: factura?.tipo_cambio,
            totalUSD: factura?.total_usd
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert("Error al registrar pago");
        setProcesandoPago(false);
        return;
      }

      setRecibo(data[0]);

      setProcesandoPago(false); // 🔥 termina animación

    } catch (error) {
      console.error(error);
      alert("Error de conexión");
      setProcesandoPago(false);
    }
  };



  const imprimirRecibo = () => {
    const clientNameSanitized = budget.clientName.replace(/[^a-zA-Z0-9]/g, '_').replace(/\s+/g, '_');
    const title = `Recibo_${clientNameSanitized}_${factura.numero}_recibo ${recibo.numero}`;

    const contenido = document.getElementById("recibo-a4");
    if (!contenido) return;

    const ventana = window.open("", "_blank");

    ventana.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { margin: 0; }
        </style>
      </head>
      <body>
        ${contenido.innerHTML}
      </body>
    </html>
  `);

    ventana.document.close();
    ventana.print();
  };


  return (
    <>
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
        <div className="card-elevated p-2 mb-2">
          <h3 className="font-semibold text-primary text-sm mb-3">Detalle de Materiales</h3>
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

          {/* TOTAL MATERIALES */}
          <div>
            <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold">
              <span>Total de Materiales</span>
              <span className="text-primary">
                ${budget.subtotal.toLocaleString("es-AR", {

                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* DETALLE DE MANO DE OBRA (SI EXISTE)*/}
        {budget.laborItems && budget.laborItems.length > 0 && (
          <div className="card-elevated p-2 mb-2">
            <h3 className="font-semibold text-primary text-sm mb-3">
              Detalle de Mano de Obra
            </h3>
            <div className="space-y-2">
              {budget.laborItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {item.name}
                  </span>

                  <span className="text-muted-foreground">
                    ${item.price.toLocaleString("es-AR")}
                  </span>
                </div>
              ))}
            </div>
            {/* TOTAL */}
            <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold">
              <span>Total Mano de Obra</span>
              <span>
                ${budget.laborCost.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        )}

        {/* TOTAL FINAL - MANO DE OBRA + MATERIALES */}
        <div className="card-elevated p-2 mb-2">
          <h3 className="font-semibold text-primary text-sm mb-0">Detalle de Materiales + Mano de Obra</h3>
          {/* SUBTOTALS */}
          <div className="border-border mt-2 pt-2 space-y-2">
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
              <span>Total Final</span>
              <span className="text-primary">
                ${budget.total.toLocaleString("es-AR", {
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        </div>


        {/* TERMS */}
        <div className="card-elevated p-2 mb-2">
          <h3 className="font-semibold text-primary text-sm mb-3">Condiciones</h3>

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
        <div className="card-elevated p-4 space-y-3">

          {/* BOTÓN MODIFICAR */}
          {!isLocked && budget && (
            <Button
              className="btn-orange"
              onClick={() => navigate(`/budgets/edit/${budget.id}`)}
            >
              Modificar Presupuesto
            </Button>
          )}

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
              className="btn-blue-dark"
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
                  className="btn-blue-dark"
                  onClick={generarFactura}
                >
                  Emitir Factura
                </Button>


              </div>
            )}

            {/* SOLO cuando factura está emitida */}
            {/* 🔥 FLUJO AUTOMÁTICO */}

            {factura?.cae && !recibo && !procesandoPago && (
              <Button
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white mt-2"
                onClick={registrarPago}
              >
                Registrar pago
              </Button>
            )}

            {procesandoPago && (
              <div
                className="w-full mt-2 flex items-center justify-center rounded-md border"
                style={{
                  height: "42px",
                  background: "#e3f2fd",
                  color: "#0d47a1",
                  fontWeight: "500"
                }}
              >
                Procesando pago...
              </div>
            )}

            {factura?.cae && recibo && !procesandoPago && (
              <Button
                className="btn-gray mt-2"
                onClick={() => setShowReciboOptions(true)}
              >
                Imprimir Recibo
              </Button>
            )}


            {showReciboOptions && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                <div className="bg-gray-600 p-6 rounded-xl w-[280px] space-y-4">

                  <h2 className="text-center font-bold">Elegir formato</h2>

                  {/* PDF A4 */}
                  <Button
                    className="btn-emerald"
                    onClick={() => {
                      imprimirReciboA4();
                      setShowReciboOptions(false);
                    }}
                  >
                    Recibo A4
                  </Button>

                  {/* TICKET */}
                  <Button
                    className="btn-blue"
                    onClick={() => {
                      imprimirReciboTicket80mm();
                      setShowReciboOptions(false);
                    }}
                  >
                    Recibo 80mm
                  </Button>

                  {/* CANCELAR */}
                  <Button
                    variant="outline"
                    className="btn-red"
                    onClick={() => setShowReciboOptions(false)}
                  >
                    Cancelar
                  </Button>

                </div>

              </div>
            )}

            {/* BOTÓN PDF */}
            <div className="mt-2">
              <Button
                className="btn-blue"
                onClick={() => setShowDownloadOptions(true)}
              >
                Descargar Factura
              </Button>

              {budget?.notaCredito && (
                <Button
                  className="btn-amber mt-2"
                  onClick={() => setShowNotaCreditoDownloadOptions(true)}
                >
                  Descargar Nota de Crédito
                </Button>
              )}

              <Button
                className="btn-green mt-2"
                onClick={enviarWhatsApp}
              >
                Enviar por WhatsApp
              </Button>

              {budget.status !== "cancelado" && (
                <Button
                  className="mt-2 btn-red"
                  onClick={handleStartCancelFactura}
                >
                  Cancelar Factura
                </Button>
              )}
            </div>
          </>
        )}

        {showFiscalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4">

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
                  className="btn-red"
                  variant="outline"
                  onClick={() => setShowFiscalModal(false)}
                >
                  Cancelar
                </Button>

                <Button
                  className="btn-emerald"
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

            <div className="bg-gray-600 p-6 rounded-xl w-[280px] space-y-4">

              <h2 className="text-center font-bold">Elegir formato</h2>

              {/* PDF A4 */}
              <Button
                className="btn-emerald"
                onClick={() => {
                  descargarPDFA4();
                  setShowDownloadOptions(false);
                }}
              >
                Factura A4
              </Button>

              {/* TICKET */}
              <Button
                className="btn-blue"
                onClick={() => {
                  imprimirTicket80mm();
                  setShowDownloadOptions(false);
                }}
              >
                Factura 80mm
              </Button>

              {/* CANCELAR */}
              <Button
                variant="outline"
                className="btn-red"
                onClick={() => setShowDownloadOptions(false)}
              >
                Cancelar
              </Button>

            </div>

          </div>
        )}

        {showNotaCreditoDownloadOptions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-600 p-6 rounded-xl w-[280px] space-y-4">
              <h2 className="text-center font-bold">Elegir formato</h2>

              <Button
                className="btn-emerald"
                onClick={() => {
                  descargarNotaCreditoPDFA4();
                  setShowNotaCreditoDownloadOptions(false);
                }}
              >
                Nota de Crédito A4
              </Button>

              <Button
                className="btn-blue"
                onClick={() => {
                  imprimirNotaCreditoTicket80mm();
                  setShowNotaCreditoDownloadOptions(false);
                }}
              >
                Nota de Crédito 80mm
              </Button>

              <Button
                variant="outline"
                className="btn-red"
                onClick={() => setShowNotaCreditoDownloadOptions(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {showCancelReasonModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-600 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-center">Motivo de la cancelación</h2>
              <p className="text-sm text-muted-foreground text-center">
                Selecciona una razón para justificar la anulación de la factura.
              </p>

              <div className="space-y-2 max-h-64 overflow-auto">
                {cancelReasonOptions.map((option) => (
                  <label key={option} className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-slate-500">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={option}
                      checked={cancelReason === option}
                      onChange={() => setCancelReason(option)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>

              {cancelReason === "Otro (especificar)" && (
                <textarea
                  value={cancelReasonOther}
                  onChange={(event) => setCancelReasonOther(event.target.value)}
                  placeholder="Describe el motivo"
                  className="w-full rounded-xl border p-3 text-sm resize-none h-24"
                />
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="btn-blue"
                  onClick={() => setShowCancelReasonModal(false)}
                >
                  Volver
                </Button>
                <Button
                  className="btn-green-ok"
                  onClick={handleConfirmCancelFactura}
                >
                  Aceptar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ANIMACIÓN AFIP PRO */}
        {loadingAFIP && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">

            <div className="bg-gray-600 text-white rounded-xl p-6 shadow-xl flex flex-col items-center gap-6 w-[300px]">

              {/* TÍTULO */}
              <p className="font-semibold text-base">
                Comunicando con ARCA...
              </p>

              {/* CONTENIDO */}
              <div className="flex items-center gap-6">

                {/* SISTEMA */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center animate-pulse">
                    <Server className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="text-base mt-2 text-blue-300 bg-slate-500  font-medium">
                    SICE
                  </span>
                </div>

                {/* FLECHAS ANIMADAS */}
                <div className="flex flex-col items-center gap-2">

                  {/* IDA */}
                  <div className="flex gap-1 text-blue-300 text-lg">
                    <span className="animate-[pulse_1s_infinite]">→</span>
                    <span className="animate-[pulse_1s_infinite_0.2s]">→</span>
                    <span className="animate-[pulse_1s_infinite_0.4s]">→</span>
                  </div>

                  {/* VUELTA */}
                  <div className="flex gap-1 text-green-400 text-lg">
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
                  <span className="text-base mt-2 bg-slate-500 text-green-400 font-medium">
                    ARCA
                  </span>
                </div>

              </div>

              {/* TEXTO */}
              <p className="text-sm text-gray-300 text-center animate-pulse">
                Enviando datos fiscales y esperando validación...
              </p>

              {/* SPINNER */}
              <div className="w-6 h-6 border-2 border-gray-400 border-t-green-400 rounded-full animate-spin"></div>

              {/* BARRA DE PROGRESO */}
              <div className="w-full bg-gray-500 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-2 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* % */}
              <span className="text-xs text-muted-foreground">
                {Math.floor(progress)}%
              </span>

            </div>
          </div>
        )}
      </PageLayout>

      {/* 🔴 FACTURA A4 OCULTA */}
      <div style={{ display: "none", position: "absolute", top: "-9999px", left: "-9999px" }} id="factura-a4">
        <FacturaA4
          profile={profile}
          factura={factura}
          budget={budget}
        />
      </div>

      {budget?.notaCredito && (
        <div style={{ display: "none", position: "absolute", top: "-9999px", left: "-9999px" }} id="nota-credito-a4">
          <NotaCreditoA4
            profile={profile}
            factura={budget.notaCredito}
            budget={budget}
          />
        </div>
      )}

      {recibo && (
        <div style={{ position: "absolute", left: "-9999px", top: "0" }} id="recibo-a4">
          <ReciboA4 recibo={recibo} />
        </div>
      )}

      {recibo && (
        <div style={{ position: "absolute", left: "-9999px", top: "0" }}>
          <ReciboTicket80mm recibo={recibo} />
        </div>
      )}

    </>
  );
};

export default BudgetDetailPage;

