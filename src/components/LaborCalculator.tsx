import { useEffect, useState } from "react";
import { getLaborItems } from "@/lib/storage";

export const LaborCalculator = ({ onClose, onUseTotal }) => {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getLaborItems();
    setItems(data);
  };

  const addItem = (item) => {
    setSelected((prev) => [...prev, item]);
  };

  const removeItem = (index) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  const total = selected.reduce((acc, i) => acc + i.price, 0);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">

      <h2 className="font-semibold text-lg">
        Calculadora de mano de obra
      </h2>

      <input
        placeholder="Buscar trabajo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded p-2"
      />

      <div className="max-h-40 overflow-y-auto space-y-1">
        {filtered.map((item) => (
          <div key={item.id} className="flex justify-between border p-2 rounded">
            <span>{item.name}</span>
            <button onClick={() => addItem(item)}>+</button>
          </div>
        ))}
      </div>

      <div className="border-t pt-2">
        <p className="text-sm font-medium">Seleccionados:</p>

        {selected.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{item.name}</span>
            <button onClick={() => removeItem(i)}>x</button>
          </div>
        ))}
      </div>

      <div className="text-lg font-bold">
        Total: ${total.toLocaleString("es-AR")}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={() => onUseTotal(total, selected)}>
          Usar
        </button>

        <button onClick={onClose}>
          Cerrar
        </button>
      </div>

    </div>
  );
};