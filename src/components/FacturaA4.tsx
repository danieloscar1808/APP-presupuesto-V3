import logoTickettt from "@/assets/Logo-Tickettt.png";
import { QRCodeSVG } from "qrcode.react";

export const FacturaA4 = ({ profile, factura, budget }) => {

  const formatMoney = (n) =>
    Number(n || 0).toLocaleString("es-AR");

  const puntoVenta = factura?.numero?.split("-")?.[0];
  const numeroComp = factura?.numero?.split("-")?.[1];

  const datos = factura;

  const subtotal =
    Number(budget?.subtotal || 0) +
    Number(budget?.laborCost || 0);

  const descuento = Number(budget?.discount || 0);

  const totalARS = Math.round(subtotal - descuento);

  const tipoCambio =
    datos?.tipo_cambio || datos?.exchangeRate || 1;

  const totalUSD =
    datos?.moneda === "USD"
      ? Math.round(totalARS / Number(tipoCambio))
      : null;

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
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

        {/* 🔷 HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <img src={logoTickettt} crossOrigin="anonymous" style={{ width: "50%" }} />

          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: 0 }}>FACTURA C</h1>
            <div>Punto de Venta: {puntoVenta}</div>
            <div>Comprobante Nº: {numeroComp}</div>
            <div>Fecha: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <hr />

        {/* 🔷 DATOS FISCALES */}
        <div style={{ marginBottom: "10px" }}>
          <div>Cond. IVA: Monotributista</div>
          <div>IIBB: {profile?.iibb || "-"}</div>
          <div>Inicio Actividades: {profile?.startDate || "-"}</div>
          <div>Ref. Presupuesto: {budget?.number}</div>
        </div>

        {/* 🔷 EMISOR / CLIENTE */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>

          {/* EMISOR */}
          <div style={{ width: "48%" }}>
            <h3>EMISOR</h3>
            <div>{profile?.ownerName || profile?.name}</div>
            <div>CUIT: {profile?.taxId}</div>
            <div>{profile?.address}</div>
          </div>

          {/* CLIENTE */}
          <div style={{ width: "48%" }}>
            <h3>CLIENTE</h3>
            <div>{factura?.cliente || budget?.clientName}</div>
            <div>{budget?.clientDocType}: {budget?.clientDocNumber}</div>
            <div>{budget?.clientAddress}</div>
            <div>
              Cond. IVA:{" "}
              {factura?.ivaCondition ||
                budget?.facturaPreliminar?.ivaCondition ||
                budget?.clientIvaCondition ||
                "Consumidor Final"}
            </div>
          </div>

        </div>

        <hr />

        {/* 🔷 DATOS DE PAGO */}
        <div style={{ marginTop: "10px" }}>
          <h3>DATOS DE PAGO</h3>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Moneda</span>
            <span>
              {datos?.moneda === "USD"
                ? "Dólares Estadounidenses (USD)"
                : "Pesos Argentinos (ARS)"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Forma de pago</span>
            <span>{datos?.formaPago}</span>
          </div>

          {datos?.moneda === "USD" && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tipo de cambio</span>
              <span>{formatMoney(tipoCambio)}</span>
            </div>
          )}
        </div>

        <hr />

        {/* 🔷 TABLA */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid black" }}>
              <th style={{ textAlign: "left" }}>Descripción</th>
              <th style={{ textAlign: "right" }}>Importe</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Materiales</td>
              <td style={{ textAlign: "right" }}>${formatMoney(budget.subtotal)}</td>
            </tr>

            <tr>
              <td>Mano de obra</td>
              <td style={{ textAlign: "right" }}>${formatMoney(budget.laborCost)}</td>
            </tr>

            {budget.discount > 0 && (
              <tr>
                <td>Descuento</td>
                <td style={{ textAlign: "right" }}>
                  -${formatMoney(budget.discount)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 🔷 TOTALES */}
        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <div>
            Subtotal: $
            {Math.round(subtotal).toLocaleString("es-AR")}
          </div>

          {descuento > 0 && (
            <div>
              Descuento: -$
              {Math.round(descuento).toLocaleString("es-AR")}
            </div>
          )}

          <div style={{ fontWeight: "bold" }}>
            Total ARS: $
            {totalARS.toLocaleString("es-AR")}
          </div>

          {datos?.moneda === "USD" && (
            <div style={{ fontWeight: "bold" }}>
              Total USD: U$S{" "}
              {totalUSD?.toLocaleString("es-AR")}
            </div>
          )}
        </div>

        <hr />

        {/* 🔷 CAE */}
        <div>
          <div>CAE: {factura?.cae || "SIMULADO"}</div>

          <div>
            Vencimiento CAE:{" "}
            {(() => {
              const raw = factura?.vencimiento;
              if (!raw) return "-";

              const value = String(raw);

              if (value.length === 8 && !value.includes("-")) {
                const formatted = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
                return new Date(formatted).toLocaleDateString("es-AR");
              }

              return new Date(value).toLocaleDateString("es-AR");
            })()}
          </div>
        </div>

        {/* 🔷 QR */}
        {factura?.qr && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            {factura?.qr && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <QRCodeSVG value={factura.qr} size={120} />
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "10px" }}>
          Comprobante autorizado AFIP
        </div>

      </div>

    </div >
  );
};
