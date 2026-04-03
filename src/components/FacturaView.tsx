type Props = {
  factura: any;
  profile: any;
  budget: any;
  preliminar?: boolean;
};

const FacturaView = ({ factura, profile, budget, preliminar }: Props) => {

 console.log("FACTURA EN VIEW:", factura); 

 const formatDoc = (type: string, value: string) => {
    if (type === "CUIT" && value.length === 11) {
      return `${value.slice(0,2)}-${value.slice(2,10)}-${value.slice(10)}`;
    }
    return value;
  };

  if (!factura || !budget) return null;

  const datos = preliminar ? budget.facturaPreliminar : factura;
  const totalFinal = preliminar ? budget.total : factura.total;

  return (
  <div className="bg-white text-black p-4 mt-2 rounded-xl shadow print:max-h-none overflow-y-auto">

    {preliminar && (
      <div className="bg-yellow-100 text-yellow-800 text-center py-2 font-bold rounded mb-2">
        ⚠️ FACTURA PRELIMINAR - SIN VALIDEZ FISCAL
      </div>
    )}

    {/* HEADER */}
    <div className="flex justify-between items-start border-b pb-4 mb-6">
      
      <div>
        <h1 className="text-2xl font-bold">Factura C</h1>
        <p className="text-sm text-gray-600">
          Punto de Venta: {preliminar ? "—" : factura.numero?.split("-")[0]}
        </p>
        <p className="text-sm text-gray-600">
          Comp. N°: {preliminar ? "—" : factura.numero?.split("-")[1]}
        </p>
        <p className="text-sm text-gray-500">
          Ref: Presupuesto N° {budget.number}
        </p>
        <p className="text-sm text-gray-600">
          Fecha: {new Date().toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600">
          Condición Frente al IVA: {datos?.ivaCondition || "Monotributista"}
        </p>
      </div>

      <div className="text-right text-sm max-w-[240px]">
        <p className="font-bold text-base leading-tight">
          SERVICIOS INTEGRALES DE CLIMATIZACION Y ENERGIA
        </p>
      </div>

    </div>

    {/* EMPRESA */}
    <div className="mb-6">
      <h2 className="font-semibold text-lg">Emisor</h2>
      <p>{profile?.name || "Tu Empresa"}</p>
      <p>CUIT: {profile?.taxId || "CUIT no cargado"}</p>
      <p>{profile?.address || "Dirección no definida"}</p>
    </div>

    {/* CLIENTE */}
    <div className="mb-6">
      <h2 className="font-semibold text-lg">Cliente</h2>
      <p>{factura.cliente}</p>

      {budget?.clientDocNumber && (
        <p>
          {budget.clientDocType}:{" "}
          {formatDoc(budget.clientDocType, budget.clientDocNumber)}
        </p>
      )}

      {budget?.clientAddress && (
        <>
          <p>Dirección: {budget.clientAddress}</p>
          <p>
            Condición frente al IVA:{" "}
            {factura?.ivaCondition || "Consumidor Final"}
          </p>
        </>
      )}
    </div>

    {/* DATOS DEL PAGO */}
    <div className="mb-6">
      <h2 className="font-semibold text-lg">Datos del Pago</h2>

      <div className="text-sm space-y-1">

        <div className="flex justify-between">
          <span className="text-gray-600">Moneda</span>
          <span>
            {datos?.currency === "USD"
              ? "Dólares Estadounidenses (USD)"
              : "Pesos Argentinos (ARS)"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Forma de pago</span>
          <span>{datos?.formaPago || "Transferencia"}</span>
        </div>

        {datos?.currency === "USD" && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo de cambio</span>
              <span>{datos?.exchangeRate || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Total USD</span>
              <span>
                {preliminar
                  ? Math.floor(Number(budget.total) / Number(datos?.exchangeRate || 1)).toLocaleString("es-AR")
                  : factura?.totalUSD
                  ? Number(factura.totalUSD).toLocaleString("es-AR")
                  : "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Total ARS</span>
              <span>
                ${Number(
                  preliminar ? budget.total : factura?.total || 0
                ).toLocaleString("es-AR")}
              </span>
            </div>
          </>
        )}

      </div>
    </div>

{/* TABLA DETALLE */}
<div className="mb-6">
  <table className="w-full text-sm border">
    <thead className="bg-gray-100">
      <tr>
        <th className="text-left p-2 border">Descripción</th>
        <th className="text-right p-2 border">Importe</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td className="p-2 border">Materiales</td>
        <td className="p-2 border text-right">
          ${Number(budget?.subtotal || 0).toLocaleString("es-AR")}
        </td>
      </tr>

      <tr>
        <td className="p-2 border">Mano de obra</td>
        <td className="p-2 border text-right">
          ${Number(budget?.laborCost || 0).toLocaleString("es-AR")}
        </td>
      </tr>

      {Number(budget?.discount || 0) > 0 && (
        <tr>
          <td className="p-2 border">Descuento</td>
          <td className="p-2 border text-right text-red-600">
            -${Number(budget?.discount || 0).toLocaleString("es-AR")}
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


    {/* TOTAL */}
    <div className="flex justify-end mb-6">
      <div className="text-right space-y-1">

        <p>
          Subtotal: $
          {(Number(budget?.subtotal || 0) + Number(budget?.laborCost || 0))
            .toLocaleString("es-AR")}
        </p>

        {Number(budget?.discount || 0) > 0 && (
          <p className="text-red-600">
            Descuento: -$
            {Number(budget.discount).toLocaleString("es-AR")}
          </p>
        )}

        <p className="text-lg font-bold">
          Total: ${Number(totalFinal || 0).toLocaleString("es-AR")}
        </p>
        
      </div>
    </div>

    {/* CAE */}
    {!preliminar && (
      <div className="border-t pt-4 text-sm">
        <p><strong>CAE:</strong> {factura.CAE}</p>
        <p><strong>Vencimiento CAE:</strong> {factura.vencimiento}</p>
      </div>
    )}


    {/* NOTA DE CRÉDITO */}
{(factura?.estado === "cancelado" || factura?.facturaAsociada) && (
  <div className="mt-4 p-3 border rounded bg-red-50 text-red-700">
    <p className="font-bold">NOTA DE CRÉDITO ASOCIADA</p>
    <p>Factura original: {factura.facturaAsociada || "-"}</p>
    <p>Estado: CANCELADA</p>
  </div>
)}

</div>
);
};

export default FacturaView;