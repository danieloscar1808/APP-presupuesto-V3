import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Home, Users, FileText, Package, Settings, Calculator } from "lucide-react";

export const FABMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const items = [
    { label: "Inicio", path: "/", icon: Home },
    { label: "Historial", path: "/budgets", icon: FileText },
    { label: "Clientes", path: "/clients", icon: Users },
    { label: "Cierre IIBB", path: "/cierre-iibb", icon: Calculator },
    { label: "Catalogo", path: "/catalog", icon: Package },
    { label: "Perfil", path: "/profile", icon: Settings },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
      
      {/* Items desplegables */}
      {open &&
        items.map((item, i) => {
          const Icon = item.icon;

          return (
            <button
              key={i}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
              className="flex items-center gap-2 bg-white shadow-lg rounded-full px-4 py-2 text-sm"
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}

      {/* Botón principal */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg"
      >
        {open ? <X /> : <Plus />}
      </button>
    </div>
  );
};