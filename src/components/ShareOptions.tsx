import { useState } from "react";
import { Budget, Profile } from "@/types";

import { Button } from "@/components/ui/button";
import { updateBudgetStatus } from "@/lib/storage";
import { downloadPDF } from "@/lib/pdfGenerator";

import { toast } from "sonner";
import { Send, FileDown, CheckCircle, XCircle, Mail, MessageCircle } from "lucide-react";

interface Props {
  budget: Budget;
  profile: Profile;
  onStatusChange?: () => void;
  disabled?: boolean;
}

export const ShareOptions = ({ budget, profile, onStatusChange, disabled }: Props) => {
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // GENERAR PDF
  // ---------------------------------------------------------
  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      await downloadPDF(budget, profile);
      toast.success("PDF descargado");
    } catch (err) {
      toast.error("Error generando PDF");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // ESTADOS DEL PRESUPUESTO
  // ---------------------------------------------------------
  const setStatus = async (status: Budget["status"]) => {
    // 🔒 BLOQUEO DURO
    if (disabled) {
      console.warn("Presupuesto bloqueado - no se puede cambiar estado");
      return;
    }

    try {
      setLoading(true);
      await updateBudgetStatus(budget.id, status);
      toast.success("Estado actualizado");

      if (onStatusChange) onStatusChange();
    } catch (err) {
      toast.error("No se pudo actualizar el estado");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // WHATSAPP
  // ---------------------------------------------------------
  const sendWhatsApp = () => {
    const message = `Hola ${budget.clientName}, te envío el presupuesto #${budget.number} por el trabajo solicitado. Total: $${budget.total.toLocaleString(
      "es-AR"
    )}.`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // ---------------------------------------------------------
  // EMAIL (mailto)
  // ---------------------------------------------------------
  const sendEmail = () => {
    const subject = `Presupuesto ${budget.number}`;
    const body = `Hola ${budget.clientName},\n\nTe comparto el presupuesto solicitado.\n\nTotal: $${budget.total.toLocaleString(
      "es-AR"
    )}\n\nSaludos.\n${profile.name}`;

    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-3">
      {/* DESCARGAR PDF */}
      <Button
        onClick={handleDownloadPDF}
        disabled={loading}
        className="
          w-full 
          bg-blue-500 
          text-white 
          border border-blue-500
          transition-all duration-200
          hover:bg-white hover:text-blue-500
          active:bg-white active:text-blue-500"
      >
        <FileDown className="w-4 h-4 mr-2" />
        Descargar PDF
      </Button>

      {/* WHATSAPP */}
      <Button
        onClick={sendWhatsApp}
        disabled={loading}
        className="
          w-full 
          bg-green-500 
          text-white 
          border border-green-500
          transition-all duration-200
          hover:bg-white hover:text-green-500
          active:bg-white active:text-green-500"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Enviar por WhatsApp
      </Button>

      {/* EMAIL */}
      <Button
        onClick={sendEmail}
        disabled={loading}
        variant="outline"
        className="
          w-full 
          bg-amber-700 
          text-white 
          border border-amber-700
          transition-all duration-200
          hover:bg-white hover:text-amber-700
          active:bg-white active:text-amber-700 active:scale-95"
      >
        <Mail className="w-4 h-4 mr-2" />
        Enviar por Email
      </Button>

      {/* CAMBIAR ESTADO */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button
          onClick={() => setStatus("accepted")}
          disabled={disabled}
          className="
            w-full 
            bg-emerald-600 
            text-white 
            border border-emerald-600
            transition-all duration-200
            hover:bg-white hover:text-emerald-600
            active:bg-white active:text-emerald-600 active:scale-95"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Aceptar
        </Button>

        <Button
          onClick={() => setStatus("rejected")}
          disabled={disabled}
          variant="destructive"
          className="
            w-full 
            bg-red-500 
            text-white 
            border border-red-500
            transition-all duration-200
            hover:bg-white hover:text-red-500
            active:bg-white active:text-red-500 active:scale-95"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Rechazado
        </Button>
      </div>

      {/* MARCAR COMO ENVIADO */}
      {budget.status === "draft" && (
        <Button
          onClick={() => setStatus("sent")}
          disabled={loading}
         className="
            w-full 
            bg-gray-500 
            text-white 
            border border-gray-500
            transition-all duration-200
            hover:bg-white hover:text-gray-500
            active:bg-white active:text-gray-500 active:scale-95"
        >
          <Send className="w-4 h-4 mr-2" />
          Marcar como enviado
        </Button>
      )}
    </div>
  );
};
