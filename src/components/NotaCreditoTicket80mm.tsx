import logoTickettt from "@/assets/Logo-Tickettt.png";

export const NotaCreditoTicket80mm = ({ profile, factura, budget }) => {
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

  return (
    <div
      style={{
        width: "80mm",
        fontFamily: "monospace",
        fontSize: "11px",
        padding: "4mm",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "0px" }}>
        <img
          src={logoTickettt}
          alt="Logo"
          style={{ width: "90%", marginBottom: "2px" }}
        />
      </div>

      <hr style={{ border: "none", borderTop: "1px solid black", margin: "2px 0" }} />

      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            margin: "0",
            textAlign: "center",
          }}
        >
          NOTA DE CRÉDITO C
        </h1>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid black", margin: "2px 0" }} />

      <div>
        <div>Punto de Venta: {puntoVenta}</div>
        <div>Comprobante Nº: {numeroComp}</div>
        <div>Ref. Presupuesto: {budget?.number}</div>
        <div>Fecha: {new Date().toLocaleDateString()}</div>
        <div>Cond. IVA: Monotributista</div>
        <div>IIBB: {profile?.iibb || "-"}</div>
        <div>Inicio Actividades: {profile?.startDate || "-"}</div>
      </div>

      <hr />

      <div>
        <div style={{ fontWeight: "bold", fontSize: "13px", marginTop: "4px" }}>
          EMISOR
        </div>
        <div>{profile?.ownerName || profile?.name}</div>
        <div>CUIT: {profile?.taxId}</div>
        <div>{profile?.address}</div>
      </div>

      <hr />

      <div>
        <div style={{ fontWeight: "bold", fontSize: "13px", marginTop: "4px" }}>
          CLIENTE
        </div>
        <div>{factura?.cliente || budget?.clientName}</div>
        <div>
          {budget?.clientDocType || "DNI/CUIT"}: {budget?.clientDocNumber}
        </div>
        <div>{budget?.clientAddress}</div>
        <div>
          Cond. IVA: {factura?.ivaCondition || budget?.facturaPreliminar?.ivaCondition || budget?.clientIvaCondition || "Consumidor Final"}
        </div>
      </div>

      <hr />

      <div>
        <div style={{ fontWeight: "bold", fontSize: "13px", marginTop: "4px" }}>
          DATOS DE PAGO
        </div>

        <div style={{ marginTop: "4px" }}>
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
      </div>

      <hr />

      <div style={{ marginTop: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
          <span>Descripción</span>
          <span>Importe</span>
        </div>

        <div style={{ borderTop: "1px dashed black", margin: "2px 0" }} />

        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Materiales</span>
            <span>${Number(budget.subtotal || 0).toLocaleString("es-AR")}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Mano de obra</span>
            <span>${Number(budget.laborCost || 0).toLocaleString("es-AR")}</span>
          </div>

          {budget.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Descuento</span>
              <span>-${Number(budget.discount).toLocaleString("es-AR")}</span>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px dashed black", marginTop: "2px" }} />
      </div>

      <div style={{ textAlign: "right", marginTop: "6px" }}>
        <div>
          Subtotal: ${Math.round(subtotal).toLocaleString("es-AR")}
        </div>

        {descuento > 0 && (
          <div>
            Descuento: -${Math.round(descuento).toLocaleString("es-AR")}
          </div>
        )}

        <div style={{ fontWeight: "bold" }}>
          Total ARS: ${totalARS.toLocaleString("es-AR")}
        </div>

        {moneda === "USD" && (
          <div style={{ fontWeight: "bold" }}>
            Total USD: U$S {totalUSD?.toLocaleString("es-AR")}
          </div>
        )}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid black", margin: "2px 0" }} />

      <div style={{ marginTop: "4px" }}>
        <div>CAE: {factura?.CAE || factura?.cae || budget?.notaCredito?.CAE || budget?.notaCredito?.cae || "SIMULADO"}</div>
        <div>
          Vencimiento CAE:{" "}
          {(() => {
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
          })()}
        </div>
        <div>Factura asociada: {factura?.facturaAsociada || budget?.notaCredito?.facturaAsociada || budget?.factura?.numero || "-"}</div>
        {factura?.motivo && <div>Motivo: {factura.motivo}</div>}
      </div>

      {factura?.qr && (
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <img src={factura.qr} alt="QR Code" style={{ width: "100px", height: "100px" }} />
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "8px" }}>
        Comprobante autorizado AFIP
      </div>
    </div>
  );
};
