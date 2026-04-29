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
        className="btn-blue"
      >
        <FileDown className="w-4 h-4 mr-2" />
        Descargar PDF
      </Button>

      {/* WHATSAPP */}
      <Button
        onClick={sendWhatsApp}
        disabled={loading}
        className="btn-green"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Enviar por WhatsApp
      </Button>

      {/* EMAIL */}
      <Button
        onClick={sendEmail}
        disabled={loading}
        variant="outline"
        className="btn-amber"
      >
        <Mail className="w-4 h-4 mr-2" />
        Enviar por Email
      </Button>

      {/* MARCAR COMO ENVIADO */}
      {budget.status === "draft" && (

        <Button
          onClick={() => setStatus("sent")}
          disabled={loading}
          className="btn-gray"
        >
          <Send className="w-4 h-4 mr-2" />
          Marcar como enviado
        </Button>

      )}


      {/* CAMBIAR ESTADO */}
      {!disabled && (
        <div className="grid grid-cols-2 gap-2 pt-3 mb-3 border-t">
          <Button
            onClick={() => setStatus("accepted")}
            className="btn-emerald"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Aceptar
          </Button>

          <Button
            onClick={() => setStatus("rejected")}
            variant="destructive"
            className="btn-red"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rechazado
          </Button>
        </div>
      )}


    </div>
  );
};
