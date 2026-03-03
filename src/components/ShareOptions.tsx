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
}

export const ShareOptions = ({ budget, profile, onStatusChange }: Props) => {
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
        className="w-full btn-accent"
      >
        <FileDown className="w-4 h-4 mr-2" />
        Descargar PDF
      </Button>

      {/* WHATSAPP */}
      <Button
        onClick={sendWhatsApp}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Enviar por WhatsApp
      </Button>

      {/* EMAIL */}
      <Button
        onClick={sendEmail}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        <Mail className="w-4 h-4 mr-2" />
        Enviar por Email
      </Button>

      {/* CAMBIAR ESTADO */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button
          onClick={() => setStatus("accepted")}
          disabled={loading}
          className="btn-gradient w-full"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Aceptado
        </Button>

        <Button
          onClick={() => setStatus("rejected")}
          disabled={loading}
          variant="destructive"
          className="w-full"
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
          className="w-full mt-2"
        >
          <Send className="w-4 h-4 mr-2" />
          Marcar como enviado
        </Button>
      )}
    </div>
  );
};