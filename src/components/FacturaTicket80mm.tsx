import logoTicket from "@/assets/Logo-Ticket.png";
import logoTickettt from "@/assets/Logo-Tickettt.png";

export const FacturaTicket80mm = ({ profile, factura, budget }) => {
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
        width: "80mm",
        fontFamily: "monospace",
        fontSize: "11px",
        padding: "4mm",
        boxSizing: "border-box",
      }}
    >
      {/* Encabezado */}
      <div style={{ textAlign: "center", marginBottom: "0px" }}>
        {/* LOGO */}
        <img
          src={logoTickettt}
          alt="Logo"
          style={{
            width: "90%",
            marginBottom: "2px"
          }}
        />
      </div>

      <hr style={{ border: "none", borderTop: "1px solid black", margin: "2px 0" }} />

      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            margin: "0",
            textAlign: "center"
          }}
        >
          FACTURA C
        </h1>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid black",
          margin: "2px 0"
        }}
      />

      {/* DATOS FACTURA */}
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

      {/* EMISOR */}
      <div>
        <div style={{ fontWeight: "bold", fontSize: "13px", marginTop: "4px" }}>
          EMISOR
        </div>
        <div>{profile?.ownerName || profile?.name}</div>
        <div>CUIT: {profile?.taxId}</div>
        <div>{profile?.address}</div>
      </div>

      <hr />

      {/* CLIENTE */}
      <div>
        <div style={{ fontWeight: "bold", fontSize: "13px", marginTop: "4px" }}>
          CLIENTE
        </div>
        <div>{factura?.cliente || budget?.clientName}</div>
        <div>
          {budget?.clientDocType || "DNI/CUIT"}:{" "}
          {budget?.clientDocNumber}
        </div>
        <div>{budget?.clientAddress}</div>
        <div>
          Cond. IVA:{" "}
          {factura?.ivaCondition ||
            budget?.facturaPreliminar?.ivaCondition ||
            budget?.clientIvaCondition ||
            "Consumidor Final"}
        </div>
      </div>

      <hr />

      {/* DATOS DE PAGO */}
      <div>
        <div style={{ fontWeight: "bold", fontSize: "13px", marginTop: "4px" }}>
          DATOS DE PAGO
        </div>

        {/* FILAS TIPO TABLA */}
        <div style={{ marginTop: "4px" }}>

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
      </div>

      <hr />

      {/* TABLA OPTIMIZADA PARA IMPRESORA */}
      <div style={{ marginTop: "6px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
          <span>Descripción</span>
          <span>Importe</span>
        </div>

        {/* SEPARADOR */}
        <div style={{ borderTop: "1px dashed black", margin: "2px 0" }} />

        {/* FILAS */}
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
              <span>
                -${Number(budget.discount).toLocaleString("es-AR")}
              </span>
            </div>
          )}

        </div>

        {/* SEPARADOR FINAL */}
        <div style={{ borderTop: "1px dashed black", marginTop: "2px" }} />

      </div>

      {/* TOTALES DERECHA */}
      <div style={{ textAlign: "right", marginTop: "6px" }}>

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

      <hr style={{ border: "none", borderTop: "1px solid black", margin: "2px 0" }} />

      {/* CAE + VENCIMIENTO */}
      <div style={{ marginTop: "4px" }}>

        <div>
          CAE: {factura?.CAE || "SIMULADO"}
        </div>

        <div>
          Vencimiento CAE:{" "}
          {(() => {
            const raw = factura?.vencimiento;

            if (!raw) return "-";

            const value = String(raw);

            // formato YYYYMMDD
            if (value.length === 8 && !value.includes("-")) {
              const formatted = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
              return new Date(formatted).toLocaleDateString("es-AR");
            }

            // formato ISO u otro
            return new Date(value).toLocaleDateString("es-AR");
          })()}
        </div>

      </div>

      {factura?.qr && (
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(factura.qr)}`}
            style={{ width: 100 }}
          />
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "6px" }}>
        Comprobante autorizado AFIP
      </div>
    </div>
  );
};