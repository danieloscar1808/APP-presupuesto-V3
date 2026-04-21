export const FacturaTicket80mm = ({ profile, factura, budget }) => {
  const formatMoney = (n) =>
    Number(n || 0).toLocaleString("es-AR");

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
      {/* EMPRESA */}
      <div style={{ textAlign: "center", marginBottom: "6px" }}>
        <strong style={{ fontSize: "13px" }}>
          {profile?.businessName}
        </strong>
        <div>CUIT: {profile?.taxId}</div>
      </div>

      <hr />

      {/* FACTURA */}
      <div>
        <div>Pto Vta: {factura?.puntoVenta}</div>
        <div>Comp: {factura?.numero}</div>
        <div>Fecha: {new Date().toLocaleDateString()}</div>
      </div>

      <hr />

      {/* CLIENTE */}
      <div>
        <strong>Cliente</strong>
        <div>{factura?.cliente || budget?.clientName}</div>
      </div>

      <hr />

      {/* ITEMS */}
      {budget.items?.map((item, i) => (
        <div key={i} style={{ marginBottom: "4px" }}>
          <div>{item.description}</div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              {item.quantity} x ${formatMoney(item.unitPrice)}
            </span>
            <span>${formatMoney(item.quantity * item.unitPrice)}</span>
          </div>
        </div>
      ))}

      {/* MANO DE OBRA */}
      {budget.laborCost > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Mano de obra</span>
          <span>${formatMoney(budget.laborCost)}</span>
        </div>
      )}

      {/* DESCUENTO */}
      {budget.discount > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Descuento</span>
          <span>-${formatMoney(budget.discount)}</span>
        </div>
      )}

      <hr />

      {/* TOTAL */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
          fontSize: "13px",
        }}
      >
        <span>TOTAL</span>
        <span>${formatMoney(factura?.total || budget.total)}</span>
      </div>

      <hr />

      {/* CAE */}
      <div style={{ textAlign: "center", marginTop: "6px" }}>
        CAE: {factura?.cae}
      </div>

      {/* QR */}
      {factura?.qr && (
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <img src={factura.qr} style={{ width: "120px" }} />
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "6px" }}>
        Comprobante autorizado AFIP
      </div>
    </div>
  );
};