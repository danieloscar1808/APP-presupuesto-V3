import { useRef, useState } from "react";

const MODO = "simulation";
const ACCENT_COLOR = "#9da8b9";

export default function CreatePinScreen({ user_id, onSuccess }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [savePressed, setSavePressed] = useState(false);
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
              <div
                key={index}
                style={{
                  ...styles.pinBox,
                  ...(focusedField === "pin" ? styles.pinBoxActive : {}),
                }}
              >
                {pin[index] ? "*" : ""}
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
            onFocus={() => setFocusedField("pin")}
            onBlur={() => setFocusedField(null)}
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
              <div
                key={index}
                style={{
                  ...styles.pinBox,
                  ...(focusedField === "confirm" ? styles.pinBoxActive : {}),
                }}
              >
                {confirmPin[index] ? "*" : ""}
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
            onFocus={() => setFocusedField("confirm")}
            onBlur={() => setFocusedField(null)}
            placeholder="Confirme PIN"
            maxLength={4}
            style={styles.hiddenInput}
          />
        </div>

        <button
          onClick={handleSave}
          onPointerDown={() => setSavePressed(true)}
          onPointerUp={() => setSavePressed(false)}
          onPointerLeave={() => setSavePressed(false)}
          onPointerCancel={() => setSavePressed(false)}
          style={{
            ...styles.button,
            ...(savePressed ? styles.buttonActive : {}),
          }}
        >
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
    background: "#000000",
  },
  card: {
    width: "100%",
    maxWidth: 330,
    padding: 30,
    borderRadius: 16,
    background: "#000000",
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
  color: ACCENT_COLOR,
},
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  label: {
    color: ACCENT_COLOR,
    fontSize: 16,
    fontWeight: "600",
  },
  pinBoxes: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
    cursor: "text",
  },
  pinBox: {
    width: 58,
    height: 58,
    borderRadius: 12,
    background: "linear-gradient(145deg, #050505, #111111)",
    border: "1px solid rgba(157, 168, 185, 0.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 38,
    fontWeight: "700",
    color: ACCENT_COLOR,
    boxShadow: "0 10px 24px rgba(157, 168, 185, 0.18), inset 0 1px 0 rgba(255,255,255,0.05)",
    transition: "transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease",
  },
  pinBoxActive: {
    transform: "translateY(1px) scale(0.98)",
    borderColor: ACCENT_COLOR,
    boxShadow: "0 12px 28px rgba(157, 168, 185, 0.24), 0 0 0 1px rgba(157, 168, 185, 0.18)",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
  },
  button: {
    height: 70,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(145deg, #050505, #111111)",
    color: ACCENT_COLOR,
    fontSize: 25,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(157, 168, 185, 0.18), inset 0 1px 0 rgba(255,255,255,0.05)",
    transition: "transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease, color 0.14s ease",
    touchAction: "manipulation",
  },
  buttonActive: {
    transform: "translateY(2px) scale(0.98)",
    background: "linear-gradient(145deg, #9da8b9, #c3ccd8)",
    color: "#050505",
    boxShadow: "0 4px 14px rgba(157, 168, 185, 0.35), 0 0 0 1px rgba(255,255,255,0.08)",
  },
};
