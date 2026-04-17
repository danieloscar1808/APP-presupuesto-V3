type Props = {
  factura: any;
  profile: any;
  budget: any;
  preliminar?: boolean;
};

const FacturaView = ({ factura, profile, budget, preliminar }: Props) => {

  console.log("FACTURA EN VIEW:", factura);
  console.log("FACTURA ASOCIADA:", factura?.facturaAsociada);
  const formatDoc = (type: string, value: string) => {
    if (type === "CUIT" && value.length === 11) {
      return `${value.slice(0, 2)}-${value.slice(2, 10)}-${value.slice(10)}`;
    }
    return value;
  };

  if (!factura || !budget) return null;

  const datos = preliminar ? budget.facturaPreliminar : factura;
  const totalFinal = budget.total;

  return (
    <div className="bg-white text-black pt-0 px-0 pb-4 mt-2 rounded-xl shadow border border-black overflow-hidden">
      {preliminar && (
        <div className="bg-yellow-100 text-yellow-800 text-center py-2 font-bold rounded mb-2">
          ⚠️ FACTURA PRELIMINAR - SIN VALIDEZ FISCAL
        </div>
      )}

      {/* HEADER */}
      <div className="text-center mb-1">
        <p className="empresa-nombre w-full bg-black text-white py-3 text-[13px] font-bold text-center">
          {profile?.businessName && profile.businessName.trim() !== ""
            ? profile.businessName
            : "SERVICIOS INTEGRALES DE CLIMATIZACION Y ENERGIA"}
        </p>
      </div>

      <div className="px-3 pt-0">
        <h1 className="text-[25px] font-bold">Factura C</h1>

        <div className="text-gray-600 text-[14px] leading-[1.3]">

          <div>
            Punto de Venta: {preliminar ? "—" : String(factura?.puntoVenta || 1).padStart(5, "0")}
          </div>

          <div>
            Comp. N°: {preliminar ? "—" : String(factura?.numero || 0).padStart(8, "0")}
          </div>

          <div>
            Ref: Presupuesto N° {budget.number}
          </div>

          <div>
            Fecha: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* EMPRESA */}
      <div className="border-t border-dashed border-gray-400 my-2"></div>
      <div className="px-3 pt-0 mb-2 mt-2 text-[14px] leading-[1.3]">
        <h2 className="font-semibold text-[16px]">Emisor</h2>
        <p>{profile?.name || "Tu Empresa"}</p>
        <p>CUIT: {profile?.taxId || "CUIT no cargado"}</p>
        <p>Condición frente al IVA: {datos?.ivaCondition || "Monotributista"}</p>
        <p>{profile?.address || "Dirección no definida"}</p>
        <p>IIBB: {profile.iibb}</p>
        <p>Inicio de actividades: {profile.startDate}</p>
      </div>

      {/* CLIENTE */}
      <div className="border-t border-dashed border-gray-400 my-"></div>
      <div className="px-3 pt-0 mb-2 mt-2 text-[15px] leading-[1.3]">
        <h2 className="font-semibold text-[16px]">Cliente</h2>
        <p>{factura?.cliente || budget?.clientName || "Cliente no definido"}</p>

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
      <div className="border-t border-dashed border-gray-400 my-2"></div>
      <div className="px-3 pt-0 mb-2 mt-2">
        <h2 className="font-semibold text-[16px]">Datos del Pago</h2>

        <div className=" text-[14px] leading-[1.3]">

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
      <div className="px-3 pt-0 mb-3">
        <table className="w-full text-[14px] border leading-[1.2]">
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
      <div className="px-3 pt-0 flex justify-end mb-3">
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



      {/* 🔹 CAE SIEMPRE DESDE LA FACTURA ORIGINAL */}
      {!preliminar && (factura?.cae || budget?.factura?.cae) && (
        <div className="px-3 pt-0 border-t pt-1 text-[14px] leading-[1.3]">

          <p>
            <strong>CAE:</strong>{" "}
            {factura?.cae || budget?.factura?.cae || "-"}
          </p>

          <p>
            <strong>Vencimiento CAE:</strong>{" "}
            {(factura?.vencimiento || budget?.factura?.vencimiento)
              ? new Date(
                (factura?.vencimiento || budget?.factura?.vencimiento).length === 8
                  ? `${(factura?.vencimiento || budget?.factura?.vencimiento).slice(0, 4)}-${(factura?.vencimiento || budget?.factura?.vencimiento).slice(4, 6)}-${(factura?.vencimiento || budget?.factura?.vencimiento).slice(6, 8)}`
                  : (factura?.vencimiento || budget?.factura?.vencimiento)
              ).toLocaleDateString("es-AR")
              : "-"}
          </p>

          {budget?.notaCredito && (
            <p className="text-red-600 font-bold text-[13px] text-center mt-2 mb-3">
              ⚠️ Factura anulada mediante Nota de Crédito
            </p>
          )}

          {/* NOTA DE CRÉDITO */}
          {budget?.notaCredito?.numero && (
            <div className="mt-2 p-2 border rounded bg-red-50 text-red-700">
              <p className="font-bold text-[15px] mb-1">NOTA DE CRÉDITO C</p>

              <p>Número NC: {budget.notaCredito.numero}</p>

              <p>
                <strong>Cae:</strong> {budget.notaCredito.CAE || "-"}
              </p>

              <p>
                <strong>Vencimiento Cae:</strong>{" "}
                {budget.notaCredito.vencimiento
                  ? new Date(budget.notaCredito.vencimiento).toLocaleDateString()
                  : "-"}
              </p>

              <p>
                Factura Asociada:{" "}
                {`${String(factura?.puntoVenta || 1).padStart(5, "0")} - ${String(factura?.numero || 0).padStart(8, "0")}`}
              </p>

              <p>
                Total: $
                {Number(budget?.notaCredito?.total || 0).toLocaleString("es-AR")}
              </p>
            </div>
          )}
        </div>

      )}
    </div>
  );
}

export default FacturaView;