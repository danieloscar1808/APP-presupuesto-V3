import { useState } from "react";

const MODO = "simulation";

export default function CreatePinScreen({ user_id, onSuccess }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

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
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Ingrese PIN"
          maxLength={4}
          style={styles.input}
        />

        {/* INPUT CONFIRMAR */}
        <input
          type="password"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          placeholder="Confirme PIN"
          maxLength={4}
          style={styles.input}
        />

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
  input: {
    height: 55,
    fontSize: 20,
    textAlign: "center",
    borderRadius: 10,
    border: "1px solid #ccc",
    outline: "none",
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