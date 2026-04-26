import { useRef, useState } from "react";

const MODO = "simulation";

export default function CreatePinScreen({ user_id, onSuccess }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const pinInputRef = useRef(null);
  const confirmPinInputRef = useRef(null);

  const handlePinChange = (setter) => (e) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 4);
    setter(numericValue);
  };

  const handleSave = () => {
    if (pin.length !== 4) {
      alert("El PIN debe tener 4 dígitos");
      return;
    }

    if (!confirmPin) {
      alert("Debe confirmar el PIN");
      return;
    }

    if (pin !== confirmPin) {
      alert("Los PIN no coinciden");
      return;
    }

    localStorage.setItem("pin_creado", "true");
    localStorage.setItem("pin_demo", pin);

    onSuccess();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <h1 style={styles.title}>Crear PIN</h1>

        {/* INPUT PIN */}
        <div style={styles.inputGroup}>
          <span style={styles.label}>Ingrese PIN</span>

          <div
            style={styles.pinBoxes}
            onClick={() => pinInputRef.current?.focus()}
          >
            {[0, 1, 2, 3].map((index) => (
              <div key={index} style={styles.pinBox}>
                {pin[index] || ""}
              </div>
            ))}
          </div>

          <input
            ref={pinInputRef}
            type="tel"
            inputMode="numeric"
            autoComplete="new-password"
            value={pin}
            onChange={handlePinChange(setPin)}
            placeholder="Ingrese PIN"
            maxLength={4}
            style={styles.hiddenInput}
          />
        </div>

        {/* INPUT CONFIRMAR */}
        <div style={styles.inputGroup}>
          <span style={styles.label}>Confirme PIN</span>

          <div
            style={styles.pinBoxes}
            onClick={() => confirmPinInputRef.current?.focus()}
          >
            {[0, 1, 2, 3].map((index) => (
              <div key={index} style={styles.pinBox}>
                {confirmPin[index] || ""}
              </div>
            ))}
          </div>

          <input
            ref={confirmPinInputRef}
            type="tel"
            inputMode="numeric"
            autoComplete="new-password"
            value={confirmPin}
            onChange={handlePinChange(setConfirmPin)}
            placeholder="Confirme PIN"
            maxLength={4}
            style={styles.hiddenInput}
          />
        </div>

        <button onClick={handleSave} style={styles.button}>
          Guardar
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9ebdc",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 30,
    borderRadius: 16,
    background: "#1d4ed8",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  title: {
  fontSize: 25,
  fontWeight: "600",
  textAlign: "center",
  marginBottom: 10,
  color: "#d9c2ab",
},
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  label: {
    color: "#d9c2ab",
    fontSize: 16,
    fontWeight: "600",
  },
  pinBoxes: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    cursor: "text",
  },
  pinBox: {
    width: 58,
    height: 58,
    borderRadius: 12,
    background: "#f8fafc",
    border: "2px solid #bfdbfe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: "700",
    color: "#1d4ed8",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
  },
  button: {
    height: 50,
    borderRadius: 10,
    border: "none",
    background: "#d9c2ab",
    color: " #1d4ed8" ,
    fontSize: 25,
    cursor: "pointer",
  },
};
