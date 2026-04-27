import { useState } from "react";
import { ChevronLeft } from "lucide-react";

const MODO = "simulation";
const ACCENT_COLOR = "#9da8b9";

export default function EnterPinScreen({ user_id, onSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const pinGuardado = localStorage.getItem("pin_demo") || "";

  const handleValidate = () => {
    if (pin.length !== 4) return;

    if (MODO === "simulation") {
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

  const getPinColor = (index) => {
    if (!pin[index]) return ACCENT_COLOR;
    return pin[index] === pinGuardado[index] ? "#16a34a" : "#dc2626";
  };

  const getKeyStyle = (keyId, overrides = {}) => ({
    ...styles.key,
    ...(activeKey === keyId ? styles.keyActive : {}),
    ...overrides,
  });

  const getKeyEvents = (keyId) => ({
    onPointerDown: () => setActiveKey(keyId),
    onPointerUp: () => setActiveKey(null),
    onPointerLeave: () => setActiveKey(null),
    onPointerCancel: () => setActiveKey(null),
  });

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
                background: getPinColor(i),
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
          {[1,2,3,4,5,6,7,8,9,0].map((n) => (
            <button
              key={n}
              onClick={() => addNumber(n)}
              style={getKeyStyle(`num-${n}`)}
              {...getKeyEvents(`num-${n}`)}
            >
              {n}
            </button>
          ))}

         

          <button
            style={getKeyStyle("ok")}
            onClick={handleValidate}
            {...getKeyEvents("ok")}
            >
            OK
          </button>

          <button
            style={getKeyStyle("back")}
            onClick={removeLast}
            {...getKeyEvents("back")}
          >
  <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
    <ChevronLeft size={30} />
  </div>
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
    background: "#000000",
  },
  card: {
    width: "100%",
    maxWidth: 330,
    padding: 30,
    borderRadius: 16,
    background: "#000000",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  title: {
  fontSize: 25,
  fontWeight: "600",
  textAlign: "center",
  marginBottom: 10,
  color: ACCENT_COLOR,
},
  pinContainer: {
    display: "flex",
    gap: 20,
    marginBottom: 10,
  },
  pinCircle: {
    width: 18,
    height: 18,
    borderRadius: "50%",
  },
  errorText: {
    color: "red",
    fontSize: 20,
  },
  keyboard: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 80px)",
    gap: 20,
    justifyContent: "center",
  },
  key: {
    height: 70,
    fontSize: 25,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(145deg, #050505, #111111)",
    color: ACCENT_COLOR,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(45, 134, 78, 1), inset 0 1px 0 rgba(255,255,255,0.05)",
    transition: "transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease, color 0.14s ease",
    touchAction: "manipulation",
  },
  keyActive: {
    transform: "translateY(2px) scale(0.97)",
    background: "linear-gradient(145deg, #9da8b9, #c3ccd8)",
    color: "#050505",
    boxShadow: "0 4px 14px rgba(157, 168, 185, 0.35), 0 0 0 1px rgba(255,255,255,0.08)",
  },
};
