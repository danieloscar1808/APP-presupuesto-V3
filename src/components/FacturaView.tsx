type Props = {
  factura: any;
  profile: any;
  budget: any;
};

const FacturaView = ({ factura, profile, budget }: Props) => {

 console.log("FACTURA EN VIEW:", factura); 

 const formatDoc = (type: string, value: string) => {
    if (type === "CUIT" && value.length === 11) {
      return `${value.slice(0,2)}-${value.slice(2,10)}-${value.slice(10)}`;
    }
    return value;
  };

  if (!factura || !budget) return null;

  return (
    <div className="bg-white text-black p-4 mt-2 rounded-xl shadow print:shadow-none max-h-[95vh] overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-start border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Factura C</h1>
          <p className="text-sm text-gray-600">N° {factura.numero}</p>
          <p className="text-sm text-gray-500">Presupuesto N° {budget.number}</p>
        </div>

        <div className="text-right text-sm">
          <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Condición:</strong> Responsable Monotributo</p>
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
        {budget.clientDocType}: {formatDoc(budget.clientDocType, budget.clientDocNumber)}
        </p>
         )}
        {budget?.clientAddress && (
        <p>Dirección: {budget.clientAddress}</p>
        )} 
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
                <td className="p-2 border">
                 Materiales
                </td>
                <td className="p-2 border text-right">
                ${Number(budget.subtotal || 0).toLocaleString("es-AR")}
                </td>
                </tr>

                <tr>
                <td className="p-2 border">
                 Mano de obra
                </td>
                <td className="p-2 border text-right">
                 ${Number(budget.laborCost || 0).toLocaleString("es-AR")}
                </td>
                </tr>
            </tbody>
        </table>
      </div>

      {/* TOTAL */}
      <div className="flex justify-end mb-6">
        <div className="text-right">
          <p className="text-lg font-bold">
            Total: ${Number(factura.total || 0).toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      {/* CAE */}
      <div className="border-t pt-4 text-sm">
        <p><strong>CAE:</strong> {factura.CAE}</p>
        <p><strong>Vencimiento CAE:</strong> {factura.vencimiento}</p>
      </div>

    </div>
  );
};

export default FacturaView;