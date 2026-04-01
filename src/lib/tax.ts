console.log("✅ TAX CARGADO OK");

export function calcularResumen(
  facturas,
  retenciones,
  alicuota
) {
  const totalFacturado = facturas.reduce((acc, f) => acc + f.total, 0);

  const iibb = totalFacturado * alicuota;

  const totalRetenciones = retenciones.reduce(
    (acc, r) => acc + r.monto,
    0
  );

  return {
    totalFacturado,
    iibb,
    retenciones: totalRetenciones,
    saldo: iibb - totalRetenciones,
  };
}

export function filtrarFacturasPorMes(facturas, mes, anio) {
  return facturas.filter((f) => {
    const fecha = new Date(f.fecha);

    return (
      fecha.getMonth() === mes &&
      fecha.getFullYear() === anio
    );
  });
}