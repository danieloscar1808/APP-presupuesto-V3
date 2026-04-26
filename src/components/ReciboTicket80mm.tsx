import logoTickettt from "@/assets/Logo-Tickettt.png";

export const ReciboTicket80mm = ({ recibo }) => {
    const formatMoney = (n) =>
        Number(n || 0).toLocaleString("es-AR");

    const montoARS = Number(recibo.monto || 0);
    const montoUSD = Number(recibo.monto_usd || 0);

    const montoMostrado =
        recibo.moneda === "USD" ? montoUSD : montoARS;

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

    return (
        <div
            id="recibo-ticket"
            style={{
                width: "80mm",
                fontFamily: "monospace",
                fontSize: "12px",
                padding: "5px"
            }}
        >

            {/* HEADER */}
            <div style={{ textAlign: "center" }}>
                <img src={logoTickettt} style={{ width: "90%" }} />

                <hr style={{ border: "none", borderTop: "1px solid black", margin: "4px 0" }} />

                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            letterSpacing: "2px"
                        }}
                    >
                        RECIBO
                    </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid black", margin: "4px 0" }} />

                <div>Nº {recibo.numero}</div>
                <div>
                    {new Date(recibo.fecha).toLocaleDateString("es-AR")}
                </div>
            </div>

            <hr />

            {/* DATOS */}
            <div>
                <div>Cliente: {recibo.cliente}</div>

                <div style={{ marginTop: "5px" }}>
                    Recibí de:
                    <br />
                    <strong>{recibo.cliente}</strong>
                </div>

                <div style={{ marginTop: "5px" }}>
                    Importe:
                    <br />
                    <strong>
                        {recibo.moneda === "USD"
                            ? `U$S ${formatMoney(montoUSD)}`
                            : `$ ${formatMoney(montoARS)}`}
                    </strong>
                </div>

                <div style={{ marginTop: "5px" }}>
                    Son:
                    <br />
                    <strong>
                        {numeroALetras(montoMostrado, recibo.moneda)}
                    </strong>
                </div>

                <div style={{ marginTop: "5px" }}>
                    Concepto:
                    <br />
                    Factura {recibo.factura_id}
                </div>
            </div>

            <hr />

            {/* PAGO */}
            <div style={{ marginTop: "5px" }}>

                <div>
                    Forma de pago:
                    <br />
                    <strong>{recibo.forma_pago}</strong>
                </div>

                <div style={{ marginTop: "4px" }}>
                    Moneda:
                    <br />
                    <strong>
                        {recibo.moneda === "USD"
                            ? "Dólares Estadounidenses (USD)"
                            : "Pesos Argentinos(ARS)"
                        }
                    </strong>
                </div>

                {recibo.moneda === "USD" && (
                    <div style={{ marginTop: "4px" }}>
                        Tipo de cambio:
                        <br />
                        <strong>{formatMoney(recibo.tipo_cambio)}</strong>
                    </div>
                )}

            </div>
            <hr />

            {/* TOTALES */}
            <div>
                <div>
                    TOTAL ARS: $ {formatMoney(montoARS)}
                </div>

                {recibo.moneda === "USD" && (
                    <div>
                        TOTAL USD: U$S {formatMoney(montoUSD)}
                    </div>
                )}
            </div>

            <hr />

            <div style={{ marginTop: "20px", textAlign: "center" }}>
                Daniel Oscar Bertolotti
                <br />
                -------------------------
                <br />
                Emisor
            </div>

            {/* FIRMA */}
            <div style={{ marginTop: "60px", textAlign: "center" }}>
                -------------------------
                <br />
                Firma del Emisor
            </div>

        </div>
    );
};