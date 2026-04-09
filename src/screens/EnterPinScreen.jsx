import { useState } from "react";

const MODO = "simulation";

export default function EnterPinScreen({ user_id, onSuccess }) {
  const [pin, setPin] = useState("");

  const handleValidate = async () => {

    if (MODO === "simulation") {
  const pinGuardado = localStorage.getItem("pin_demo");

  if (pin === pinGuardado) {
    onSuccess();
  } else {
    alert("PIN incorrecto");
  }
  return;
}

    try {
      const res = await fetch("http://TU_BACKEND/pin/validar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          pin,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        onSuccess();
      } else {
        alert("PIN incorrecto");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Ingrese PIN</h2>

      <div
        style={{
          fontSize: 28,
          letterSpacing: 10,
          marginBottom: 20,
        }}
      >
        {"●".repeat(pin.length)}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 80px)",
          gap: 10,
          justifyContent: "center",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => {
              if (pin.length < 4) setPin(pin + n);
            }}
            style={{ height: 60, fontSize: 18 }}
          >
            {n}
          </button>
        ))}

        <button onClick={() => setPin("")}>C</button>

        <button
          onClick={() => {
            if (pin.length === 4) handleValidate();
          }}
        >
          OK
        </button>

        <button onClick={() => setPin(pin.slice(0, -1))}>←</button>
      </div>
    </div>
  );
}