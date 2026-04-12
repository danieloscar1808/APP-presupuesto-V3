export const FacturaTicket80mm = ({ profile, factura, budget }) => {
  return (
    <div style={{ width: "80mm", fontSize: "12px", fontFamily: "monospace" }}>

      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <strong>{profile?.businessName}</strong>
        <div>CUIT: {profile?.taxId}</div>
      </div>

      <hr />

      <div>
        <div>Pto Vta: {factura?.puntoVenta}</div>
        <div>Comp: {factura?.numero}</div>
        <div>Fecha: {new Date().toLocaleDateString()}</div>
      </div>

      <hr />

      <div>
        <strong>Cliente</strong>
        <div>{factura?.cliente || budget?.clientName}</div>
      </div>

      <hr />

      {budget.items?.map((item, i) => (
        <div key={i}>
          <div>{item.descripcion}</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{item.cantidad} x ${item.precio}</span>
            <span>${item.total}</span>
          </div>
        </div>
      ))}

      <hr />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>TOTAL</strong>
        <strong>${factura?.total}</strong>
      </div>

      <hr />

      <div style={{ textAlign: "center" }}>
        CAE: {factura?.cae}
      </div>

    </div>
  );
};