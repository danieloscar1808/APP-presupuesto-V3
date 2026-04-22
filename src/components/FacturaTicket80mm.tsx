import logoTicket from "@/assets/Logo-Ticket.png";
import logoTickettt from "@/assets/Logo-Tickettt.png";

export const FacturaTicket80mm = ({ profile, factura, budget }) => {
  const formatMoney = (n) =>
    Number(n || 0).toLocaleString("es-AR");

  const puntoVenta = factura?.numero?.split("-")?.[0];
  const numeroComp = factura?.numero?.split("-")?.[1];



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

      <hr />

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
        <div>Cond. IVA: {budget?.clientIvaCondition || "Consumidor Final"}</div>
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
              {(factura?.currency || budget?.facturaPreliminar?.currency) === "USD"
                ? "Dólares Estadounidenses (USD)"
                : "Pesos Argentinos (ARS)"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Forma de pago</span>
            <span>
              {factura?.formaPago || budget?.facturaPreliminar?.formaPago}
            </span>
          </div>

          {(factura?.currency === "USD" || budget?.facturaPreliminar?.currency === "USD") && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Tipo de cambio</span>
                <span>
                  {Number(
                    factura?.exchangeRate || budget?.facturaPreliminar?.exchangeRate || 0
                  ).toLocaleString("es-AR")}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total USD</span>
                <span>
                  {Number(factura?.totalUSD || 0).toLocaleString("es-AR")}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total ARS</span>
                <span>
                  ${Number(factura?.total || budget.total).toLocaleString("es-AR")}
                </span>
              </div>
            </>
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
          {Number(
            (budget.subtotal || 0) + (budget.laborCost || 0)
          ).toLocaleString("es-AR")}
        </div>

        {budget.discount > 0 && (
          <div style={{ color: "#010000" }}>
            Descuento: -${Number(budget.discount).toLocaleString("es-AR")}
          </div>
        )}

        <div style={{ fontWeight: "bold", fontSize: "13px" }}>
          Total: ${Number(factura?.total || budget.total).toLocaleString("es-AR")}
        </div>

      </div>

      <hr />

      {/* CAE */}


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