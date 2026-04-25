import logoTickettt from "@/assets/Logo-Tickettt.png";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export const NotaCreditoA4 = ({ profile, factura, budget }) => {
  const [qrDataURL, setQrDataURL] = useState("");

  useEffect(() => {
    if (factura?.qr) {
      QRCode.toDataURL(factura.qr, { width: 120, margin: 0 }, (err, url) => {
        if (!err) setQrDataURL(url);
      });
    }
  }, [factura?.qr]);

  const formatMoney = (n) => Number(n || 0).toLocaleString("es-AR");

  const notaNumero =
    budget?.notaCredito?.numero ||
    factura?.numero ||
    "";

  const notaNumeroParts = notaNumero?.includes("-") ? notaNumero.split("-") : [notaNumero, ""];
  const puntoVenta = notaNumeroParts[0] || "-";
  const numeroComp = notaNumeroParts[1] || notaNumeroParts[0] || "-";

  const moneda =
    factura?.moneda ||
    budget?.notaCredito?.moneda ||
    budget?.factura?.moneda ||
    budget?.facturaPreliminar?.moneda ||
    "ARS";

  const formaPago =
    factura?.formaPago ||
    budget?.factura?.formaPago ||
    budget?.facturaPreliminar?.formaPago ||
    "No informado";

  const tipoCambio =
    factura?.tipo_cambio ||
    factura?.exchangeRate ||
    budget?.notaCredito?.tipo_cambio ||
    budget?.notaCredito?.exchangeRate ||
    budget?.factura?.tipo_cambio ||
    budget?.factura?.exchangeRate ||
    1;

  const subtotal = Number(budget?.subtotal || 0) + Number(budget?.laborCost || 0);
  const descuento = Number(budget?.discount || 0);
  const totalARS = Math.round(subtotal - descuento);
  const totalUSD = moneda === "USD" ? Math.round(totalARS / Number(tipoCambio)) : null;
  const cae = factura?.cae || factura?.CAE;

  return (
    <div
      style={{
        width: "210mm",
        height: "auto",
        padding: "40mm",
        background: "white",
        color: "black",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          border: "1px solid black",
          padding: "5mm",
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <img src={logoTickettt} crossOrigin="anonymous" style={{ width: "50%" }} />

          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: 0 }}>NOTA DE CRÉDITO C</h1>
            <div>Punto de Venta: {puntoVenta}</div>
            <div>Comprobante Nº: {numeroComp}</div>
            <div>Fecha: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <hr style={{ margin: "10px 0" }} />

        <div style={{ marginBottom: "10px" }}>
          <div>Cond. IVA: Monotributista</div>
          <div>IIBB: {profile?.iibb || "-"}</div>
          <div>Inicio Actividades: {profile?.startDate || "-"}</div>
          <div>Ref. Presupuesto: {budget?.number}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <div style={{ width: "48%" }}>
            <h3>EMISOR</h3>
            <div>{profile?.ownerName || profile?.name}</div>
            <div>CUIT: {profile?.taxId}</div>
            <div>{profile?.address}</div>
          </div>

          <div style={{ width: "48%" }}>
            <h3>CLIENTE</h3>
            <div>{factura?.cliente || budget?.clientName}</div>
            <div>{budget?.clientDocType}: {budget?.clientDocNumber}</div>
            <div>{budget?.clientAddress}</div>
            <div>
              Cond. IVA: {factura?.ivaCondition || budget?.facturaPreliminar?.ivaCondition || budget?.clientIvaCondition || "Consumidor Final"}
            </div>
          </div>
        </div>

        <hr style={{ margin: "10px 0" }} />

        <div style={{ marginTop: "10px" }}>
          <h3>DATOS DE PAGO</h3>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Moneda</span>
            <span>{moneda === "USD" ? "Dólares Estadounidenses (USD)" : "Pesos Argentinos (ARS)"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Forma de pago</span>
            <span>{formaPago}</span>
          </div>
          {moneda === "USD" && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tipo de cambio</span>
              <span>{formatMoney(tipoCambio)}</span>
            </div>
          )}
        </div>

        <hr style={{ margin: "10px 0" }} />

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "18px", paddingTop: "10px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid black", paddingBottom: "8px" }}>
              <th style={{ textAlign: "left", paddingBottom: "8px" }}>Descripción</th>
              <th style={{ textAlign: "right", paddingBottom: "8px" }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ paddingTop: "10px" }}>
              <td style={{ paddingTop: "10px" }}>Materiales</td>
              <td style={{ textAlign: "right", paddingTop: "10px" }}>${formatMoney(budget.subtotal)}</td>
            </tr>
            <tr>
              <td>Mano de obra</td>
              <td style={{ textAlign: "right" }}>${formatMoney(budget.laborCost)}</td>
            </tr>
            {budget.discount > 0 && (
              <tr>
                <td>Descuento</td>
                <td style={{ textAlign: "right" }}>-${formatMoney(budget.discount)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <div>Subtotal: ${Math.round(subtotal).toLocaleString("es-AR")}</div>
          {descuento > 0 && (<div>Descuento: -${Math.round(descuento).toLocaleString("es-AR")}</div>)}
          <div style={{ fontWeight: "bold" }}>Total ARS: ${totalARS.toLocaleString("es-AR")}</div>
          {moneda === "USD" && (<div style={{ fontWeight: "bold" }}>Total USD: U$S {totalUSD?.toLocaleString("es-AR")}</div>)}
        </div>

        <hr style={{ margin: "10px 0" }} />

        <div>
          <div>CAE: {cae || factura?.CAE || factura?.cae || budget?.notaCredito?.CAE || budget?.notaCredito?.cae || "SIMULADO"}</div>
          <div>Vencimiento CAE: {(() => {
            const raw =
              factura?.vencimiento ||
              budget?.notaCredito?.vencimiento ||
              budget?.notaCredito?.vencimiento;
            if (!raw) return "-";
            const value = String(raw);
            if (value.length === 8 && !value.includes("-")) {
              const formatted = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
              return new Date(formatted).toLocaleDateString("es-AR");
            }
            return new Date(value).toLocaleDateString("es-AR");
          })()}</div>
          <div>Factura asociada: {factura?.facturaAsociada || budget?.notaCredito?.facturaAsociada || budget?.factura?.numero || "-"}</div>
          {factura?.motivo && (<div>Motivo: {factura.motivo}</div>)}
        </div>

        {qrDataURL && (
          <div style={{ textAlign: "center", marginTop: "20px", display: "flex", justifyContent: "center" }}>
            <img src={qrDataURL} alt="QR Code" style={{ width: "120px", height: "120px" }} />
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "10px" }}>Comprobante autorizado AFIP</div>
      </div>
    </div>
  );
};
