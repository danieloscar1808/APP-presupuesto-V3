import logoTickettt from "@/assets/Logo-Tickettt.png";

export const ReciboA4 = ({ recibo }) => {
  const formatMoney = (n) =>
    Number(n || 0).toLocaleString("es-AR");

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "10mm",
        background: "white",
        fontFamily: "Arial, sans-serif"
      }}
    >

      {/* 🔲 MARCO CONTENIDO */}
      <div
        style={{
          border: "1px solid #444",
          padding: "15mm"
        }}
      >

        {/* 🔷 HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <img
            src={logoTickettt}
            style={{ width: "180px" }}
          />

          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: 0 }}>RECIBO</h1>
            <div>Nº: {recibo.numero}</div>
            <div>
              Fecha: {new Date(recibo.fecha).toLocaleDateString("es-AR")}
            </div>
          </div>
        </div>

        <hr style={{ margin: "10px 0" }} />

        {/* 🔷 DATOS */}
        <div style={{ fontSize: "14px", lineHeight: "1.6" }}>

          <p>
            Recibí de: <strong>{recibo.cliente}</strong>
          </p>

          <p>
            La suma de:{" "}
            <strong style={{ fontSize: "18px" }}>
              ${formatMoney(recibo.monto)}
            </strong>
          </p>

          <p>
            En concepto de: Pago correspondiente a factura{" "}
            <strong>{recibo.factura_id}</strong>
          </p>

          <p>
            Forma de pago: <strong>{recibo.forma_pago}</strong>
          </p>

          <p>
            Moneda:{" "}
            <strong>
              {recibo.moneda === "USD"
                ? "Dólares (USD)"
                : "Pesos (ARS)"}
            </strong>
          </p>

          {recibo.observaciones && (
            <p>
              Observaciones: {recibo.observaciones}
            </p>
          )}
        </div>

        <hr style={{ margin: "20px 0" }} />

        {/* 🔷 FIRMA */}
        <div
          style={{
            marginTop: "60px",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ borderTop: "1px solid black", width: "200px" }}></div>
            <p>Firma del emisor</p>
          </div>

          <div>
            <div style={{ borderTop: "1px solid black", width: "200px" }}></div>
            <p>Aclaración</p>
          </div>
        </div>

        {/* 🔷 LEYENDA */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px" }}>
          Este recibo no reemplaza la factura
        </div>

      </div>
    </div>
  );
};