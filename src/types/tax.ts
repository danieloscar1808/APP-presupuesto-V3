export type Factura = {
  id: string;
  fecha: string; // ISO
  total: number;
};

export type Retencion = {
  fecha: string;
  monto: number;
};

export type TaxConfig = {
  alicuota: number; // ej: 0.035
};

export type ResumenImpositivo = {
  totalFacturado: number;
  iibb: number;
  retenciones: number;
  saldo: number;
};

export type EstadoMes = {
  mes: number;     // 0-11
  anio: number;
  cerrado: boolean;
  snapshot?: ResumenImpositivo;
};