import { useState } from "react";

const MODO = "simulation";

export default function EnterPinScreen({ user_id, onSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleValidate = () => {
    if (pin.length !== 4) return;

    if (MODO === "simulation") {
      const pinGuardado = localStorage.getItem("pin_demo");

      if (pin === pinGuardado) {
        setError(false);
        onSuccess();
      } else {
        setError(true);
        setPin("");
      }
      return;
    }

    // PRODUCCIÓN (lo dejamos listo)
  };

  const addNumber = (num) => {
    if (pin.length < 4) {
      setPin((prev) => prev + String(num));
      setError(false);
    }
  };

  const removeLast = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <h1 style={styles.title}>Ingrese PIN</h1>

        {/* DISPLAY PIN */}
        <div style={styles.pinContainer}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                ...styles.pinCircle,
                background: pin[i] ? "#2563eb" : "#e5e7eb",
                transform: error ? "translateX(-5px)" : "none",
                transition: "all 0.2s"
              }}
            />
          ))}
        </div>

        {/* MENSAJE ERROR */}
        {error && (
          <p style={styles.errorText}>PIN incorrecto</p>
        )}

        {/* TECLADO */}
        <div style={styles.keyboard}>
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <button
              key={n}
              onClick={() => addNumber(n)}
              style={styles.key}
            >
              {n}
            </button>
          ))}

          <button style={styles.key} onClick={() => setPin("")}>
            C
          </button>

          <button
            style={{
              ...styles.key,
              background: "#2563eb",
              color: "white"
            }}
            onClick={handleValidate}
          >
            OK
          </button>

          <button style={styles.key} onClick={removeLast}>
            ←
          </button>
        </div>

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
    background: "#f4f6f8",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 30,
    borderRadius: 16,
    background: "#f9ebdc",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  title: {
    marginBottom: 10,
  },
  pinContainer: {
    display: "flex",
    gap: 15,
    marginBottom: 10,
  },
  pinCircle: {
    width: 18,
    height: 18,
    borderRadius: "50%",
  },
  errorText: {
    color: "red",
    fontSize: 14,
  },
  keyboard: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 80px)",
    gap: 15,
    justifyContent: "center",
  },
  key: {
    height: 70,
    fontSize: 20,
    borderRadius: 12,
    border: "none",
    background: "#f1f5f9",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
};