import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export default function FABAction() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/budgets/new")}
      className="fixed bottom-20 left-4 z-50 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}