import { useState } from "react";

const MODO = "simulation";

export default function CreatePinScreen(props) {
  const { user_id, onSuccess } = props;

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleSave = () => {
    if (pin.length !== 4) {
      alert("PIN inválido");
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
localStorage.setItem("pin_demo", pin); // 👈 ESTA LÍNEA FALTABA

console.log("PIN GUARDADO:", pin);

onSuccess();
  
};

  return (
    <div>
      <h2>Crear PIN</h2>

      <input
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />

      <input
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value)}
      />

      <button onClick={handleSave}>Guardar</button>
    </div>
  );
}