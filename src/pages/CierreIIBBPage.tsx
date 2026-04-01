"use client";

import { useMemo } from "react";

import { calcularResumen } from "../lib/tax";
import { generarPDFImpositivo } from "../lib/pdfTax";

import { useFacturasStore } from "../store/facturasStore";
import { useRetencionesStore } from "../store/retencionesStore";
import { useConfigStore } from "../store/configStore";
import { useTaxStore } from "../store/taxStore";

// ⚠️ si no lo tenés importado
import { filtrarFacturasPorMes } from "../lib/tax";

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

  const descargarPDF = () => {
    generarPDFImpositivo(resumen);
  };

  return (
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
        onClick={descargarPDF}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Descargar PDF para AGIP
      </button>
    </div>
  );
}