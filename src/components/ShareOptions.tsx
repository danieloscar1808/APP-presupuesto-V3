import { Budget, Profile } from '@/types';
import { downloadPDF } from '@/lib/pdfGenerator';
import { updateBudgetStatus } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Download, MessageCircle, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareOptionsProps {
  budget: Budget;
  profile: Profile;
  onStatusChange?: () => void;
}

export const ShareOptions = ({ budget, profile, onStatusChange }: ShareOptionsProps) => {
  const handleDownload = () => {
    downloadPDF(budget, profile);
    toast.success('PDF descargado correctamente');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola ${budget.clientName}, le envio el presupuesto de ${budget.category === 'ac' ? 'instalacion de aire acondicionado' : budget.category === 'electric' ? 'instalacion electrica' : 'sistema fotovoltaico'}.\n\nTotal: $${budget.total.toLocaleString('es-AR')}\n\nSaludos,\n${profile.name}`
    );
    
    // Download PDF first
    downloadPDF(budget, profile);
    
    // Open WhatsApp
    window.open(`https://wa.me/?text=${message}`, '_blank');
    
    // Update status
    updateBudgetStatus(budget.id, 'sent');
    onStatusChange?.();
    toast.success('Presupuesto marcado como enviado');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Presupuesto - ${profile.businessName || profile.name}`);
    const body = encodeURIComponent(
      `Estimado/a ${budget.clientName},\n\nAdjunto encontrara el presupuesto solicitado.\n\nTotal: $${budget.total.toLocaleString('es-AR')}\n\nQuedo a disposicion para cualquier consulta.\n\nSaludos cordiales,\n${profile.name}\n${profile.phone}`
    );
    
    // Download PDF first
    downloadPDF(budget, profile);
    
    // Open email client
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    // Update status
    updateBudgetStatus(budget.id, 'sent');
    onStatusChange?.();
    toast.success('Presupuesto marcado como enviado');
  };

  const markAsAccepted = () => {
    updateBudgetStatus(budget.id, 'accepted');
    onStatusChange?.();
    toast.success('Presupuesto marcado como aceptado');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Compartir Presupuesto</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleDownload} className="h-auto py-3 flex-col gap-1">
          <Download className="w-5 h-5" />
          <span className="text-xs">Descargar PDF</span>
        </Button>
        <Button onClick={handleWhatsApp} className="h-auto py-3 flex-col gap-1 bg-success hover:bg-success/90">
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs">WhatsApp</span>
        </Button>
        <Button variant="outline" onClick={handleEmail} className="h-auto py-3 flex-col gap-1">
          <Mail className="w-5 h-5" />
          <span className="text-xs">Email</span>
        </Button>
        {budget.status !== 'accepted' && (
          <Button variant="outline" onClick={markAsAccepted} className="h-auto py-3 flex-col gap-1 text-success border-success/50">
            <Check className="w-5 h-5" />
            <span className="text-xs">Aceptado</span>
          </Button>
        )}
      </div>
    </div>
  );
};
