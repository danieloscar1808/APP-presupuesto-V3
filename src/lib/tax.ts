console.log("✅ TAX CARGADO OK");

export function calcularResumen(facturas, retenciones, alicuota) {
  const totalFacturado = facturas.reduce(
    (acc, f) => acc + (f.total || 0),
    0
  );

  const totalRetenciones = retenciones.reduce(
    (acc, r) => acc + (r.monto || 0),
    0
  );

  // 🔥 cálculo base
  const iibbCalculado = totalFacturado * (alicuota || 0);

  // 🔥 redondeo a favor de AGIP
  const iibb = Math.ceil(iibbCalculado);

  const saldo = Math.ceil(iibb - totalRetenciones);

  return {
    totalFacturado: Math.ceil(totalFacturado),
    iibb,
    retenciones: Math.ceil(totalRetenciones),
    saldo,
  };
}

export function filtrarFacturasPorMes(facturas, mes, anio) {
  return facturas.filter((f) => {
    if (!f.fecha) return false;

    const fecha = new Date(f.fecha);

    return (
      fecha.getMonth() === mes &&
      fecha.getFullYear() === anio &&
      f.estado === "facturado" // MUY IMPORTANTE
    );
  });
}