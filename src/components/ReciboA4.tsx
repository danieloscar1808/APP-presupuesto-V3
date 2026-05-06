import logoTickettt from "@/assets/Logo-Tickettt.png";
import firmaEmisorBase from "@/assets/firma.png";


const numeroALetras = (num, moneda) => {
  const unidades = [
    "", "uno", "dos", "tres", "cuatro", "cinco",
    "seis", "siete", "ocho", "nueve"
  ];

  const especiales = [
    "diez", "once", "doce", "trece", "catorce",
    "quince", "dieciséis", "diecisiete",
    "dieciocho", "diecinueve"
  ];

  const decenas = [
    "", "", "veinte", "treinta", "cuarenta",
    "cincuenta", "sesenta", "setenta",
    "ochenta", "noventa"
  ];

  const centenas = [
    "", "ciento", "doscientos", "trescientos",
    "cuatrocientos", "quinientos",
    "seiscientos", "setecientos",
    "ochocientos", "novecientos"
  ];

  const convertir = (n) => {
    if (n === 0) return "cero";
    if (n === 100) return "cien";

    let texto = "";

    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) texto += centenas[c] + " ";

    if (d === 1) {
      texto += especiales[u];
    } else if (d === 2 && u !== 0) {
      texto += "veinti" + unidades[u];
    } else {
      if (d > 1) {
        texto += decenas[d];
        if (u > 0) texto += " y ";
      }
      if (u > 0) texto += unidades[u];
    }

    return texto.trim();
  };

  const numero = Math.round(num);

  let resultado = "";

  if (numero >= 1000) {
    const miles = Math.floor(numero / 1000);
    const resto = numero % 1000;

    if (miles === 1) {
      resultado = "mil";
    } else {
      resultado = convertir(miles) + " mil";
    }

    if (resto > 0) {
      resultado += " " + convertir(resto);
    }
  } else {
    resultado = convertir(numero);
  }

  resultado =
    resultado.charAt(0).toUpperCase() + resultado.slice(1);

  if (moneda === "USD") {
    return resultado + " dólares estadounidenses";
  }

  return resultado + " pesos argentinos";
};



export const ReciboA4 = ({ recibo }) => {
  const formatMoney = (n) =>
    Number(n || 0).toLocaleString("es-AR");

  const montoARS = Number(recibo.monto || 0);
  const montoUSD = Number(recibo.monto_usd || 0);
  const firmaEmisor = recibo.firma || recibo.firmaEscaneada || firmaEmisorBase;

  const montoMostrado =
    recibo.moneda === "USD" ? montoUSD : montoARS;


  return (
    <div
      id="recibo-a4"
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "40mm",
        background: "white",
        fontFamily: "Arial, sans-serif"
      }}
    >

      {/* 🔲 MARCO CONTENIDO */}
      <div
        style={{
          border: "1px solid #444",
          padding: "15mm"
        }}
      >

        {/* 🔷 HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <img
            src={logoTickettt}
            style={{ width: "50%" }}
          />

          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: 0 }}>RECIBO</h1>
            <div>Nº: {recibo.numero}</div>
            <div>
              Fecha: {new Date(recibo.fecha).toLocaleDateString("es-AR")}
            </div>
          </div>
        </div>

        <hr style={{ margin: "10px 0" }} />

        {/* 🔷 DATOS */}
        <div style={{ fontSize: "14px", lineHeight: "1.6" }}>

          <p>
            Recibí de: <strong>{recibo.cliente}</strong>
          </p>

          <p>
            La suma de:{" "}
            <strong style={{ fontSize: "18px" }}>
              {recibo.moneda === "USD"
                ? `U$S ${formatMoney(recibo.monto_usd || 0)}`
                : `$ ${formatMoney(recibo.monto || 0)}`
              }
            </strong>
          </p>

          <p>
            Son:{" "}
            <strong>
              {numeroALetras(montoMostrado, recibo.moneda)}
            </strong>
          </p>

          <p>
            En concepto de: Pago correspondiente a factura{" "}
            <strong>{recibo.factura_id}</strong>
          </p>

          <p>
            Forma de pago: <strong>{recibo.forma_pago}</strong>
          </p>

          <p>
            Moneda:{" "}
            <strong>
              {recibo.moneda === "USD"
                ? "Dólares Estadounidenses (USD)"
                : "Pesos (ARS)"
              }
            </strong>
          </p>

          {recibo.moneda === "USD" && (
            <p>
              Tipo de cambio:{" "}
              <strong>{formatMoney(recibo.tipo_cambio)}</strong>
            </p>
          )}

          {recibo.observaciones && (
            <p>
              Observaciones: {recibo.observaciones}
            </p>
          )}
        </div>

        <div style={{ marginTop: "10px", fontSize: "15px" }}>

          <p>
            Total ARS:{" "}
            <strong>
              $ {formatMoney(montoARS)}
            </strong>
          </p>

          {recibo.moneda === "USD" && (
            <p>
              Total USD:{" "}
              <strong>
                U$S {formatMoney(montoUSD)}
              </strong>
            </p>
          )}

        </div>


        <hr style={{ margin: "20px 0" }} />

        {/* 🔷 FIRMA */}
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "150px"
            }}
          >
            <div
              style={{
                height: "78px",
                width: "220px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                marginBottom: "-6px"
              }}
            >
              <img
                src={firmaEmisor}
                alt="Firma del emisor"
                style={{
                  width: "190px",
                  height: "72px",
                  objectFit: "contain",
                  objectPosition: "center bottom",
                  mixBlendMode: "multiply"
                }}
              />
            </div>
            <div style={{ borderTop: "1px solid black", width: "220px", margin: "0" }}></div>
            <div style={{ height: "20px", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "8px" }}>
              <p style={{ margin: 0 }}>Firma del emisor</p>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "150px"
            }}
          >
            <div style={{ height: "70px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              Daniel Oscar Bertolotti
            </div>
            <div style={{ borderTop: "1px solid black", width: "200px", margin: "0" }}></div>
            <div style={{ height: "20px", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "8px" }}>
              <p style={{ margin: 0 }}>Emisor</p>
            </div>
          </div>
        </div>

        {/* 🔷 LEYENDA */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px" }}>
          Este recibo no reemplaza la factura
        </div>

      </div>
    </div>
  );
};
