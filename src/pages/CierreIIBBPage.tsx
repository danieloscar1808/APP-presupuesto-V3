"use client";

import { useMemo } from "react";

import { calcularResumen } from "../lib/tax";
import { generarPDFImpositivo } from "../lib/pdfTax";

import { useFacturasStore } from "../store/facturasStore";
import { useRetencionesStore } from "../store/retencionesStore";
import { useConfigStore } from "../store/configStore";
import { useTaxStore } from "../store/taxStore";
import { FileDown, Plus } from "lucide-react";

// ⚠️ si no lo tenés importado
import { filtrarFacturasPorMes } from "../lib/tax";
import { FABMenu } from "../components/ui/FABMenu";
//import { FABAction } from "../components/ui/FABAction";


export default function ResumenImpositivoPage() {

  const { cierres } = useTaxStore();

  const facturas = useFacturasStore((s) => s.facturas);
  const retenciones = useRetencionesStore((s) => s.retenciones);
  const alicuota = useConfigStore((s) => s.alicuota);

  console.log("cierres:", cierres);
  console.log("facturas:", facturas);
  console.log("retenciones:", retenciones);
  console.log("alicuota:", alicuota);

  const hoy = new Date();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();

  const facturasMes = useMemo(
  () => filtrarFacturasPorMes(facturas, mes, anio),
  [facturas, mes, anio]
);

  const resumen = useMemo(
    () => calcularResumen(facturasMes, retenciones, alicuota),
    [facturasMes, retenciones, alicuota]
  );

  // 🔍 DEBUG
console.log("facturasMes:", facturasMes);
console.log("resumen:", resumen);
console.log("facturas totales:", facturas);
console.log("retenciones:", retenciones);
console.log("alicuota:", alicuota);

  const descargarPDF = () => {
  const cierreActual = cierres.find(
    (c) => c.mes === mes && c.anio === anio
  );
  if (!cierreActual) {
    alert("Primero tenés que cerrar el mes");
    return;
  }
  generarPDFImpositivo(cierreActual.snapshot);
  };

  const { cerrarMes, obtenerEstadoMes } = useTaxStore();

  const estadoMes = obtenerEstadoMes(mes, anio);

  const cerrar = () => {
  if (estadoMes?.cerrado) {
    alert("Este mes ya está cerrado");
    return;
  }
  if (facturasMes.length === 0) {
    alert("No hay facturas en este mes");
    return;
  }
  const ok = confirm("¿Cerrar mes? Esto no se puede modificar después.");
  if (ok) {
    cerrarMes(mes, anio, resumen);
  }
};
  
    return (
  <>
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Resumen Impositivo</h1>

      <div className="border p-4 rounded">
        <p>Total facturado: ${resumen.totalFacturado}</p>
        <p>IIBB estimado: ${resumen.iibb}</p>
        <p>Retenciones: ${resumen.retenciones}</p>
        <p className="font-bold">
          Saldo a pagar: ${resumen.saldo}
        </p>
      </div>

      <button
        onClick={cerrar}
        className="w-full bg-black text-white py-2 rounded"
      >
        {estadoMes?.cerrado ? "Mes cerrado" : "Cerrar mes"}
      </button>

      <div className="mt-6 space-y-3">
        <h2 className="font-semibold text-lg">Historial de cierres</h2>

        {cierres.length === 0 ? (
          <p className="text-muted-foreground">No hay cierres aún</p>
        ) : (
          cierres.map((cierre, index) => (
            <div key={index} className="border p-3 rounded">
              <p className="font-medium">
                {cierre.mes + 1}/{cierre.anio}
              </p>
              <p>Total: ${cierre.snapshot?.totalFacturado}</p>
              <p>IIBB: ${cierre.snapshot?.iibb}</p>
              <p>Saldo: ${cierre.snapshot?.saldo}</p>
            </div>
          ))
        )}
      </div>

      <button
        onClick={descargarPDF}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Descargar PDF para AGIP
      </button>
    </div>

   <FABMenu />
  
  </>
);
}
