import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { ShareOptions } from '@/components/ShareOptions';
import { Budget, Profile, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { getBudgetById, getProfile, deleteBudget } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const BudgetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const b = getBudgetById(id);
    const p = getProfile();
    
    if (!b) {
      toast.error('Presupuesto no encontrado');
      navigate('/budgets');
      return;
    }
    
    setBudget(b);
    setProfile(p);
  }, [id, navigate]);

  const loadBudget = () => {
    if (!id) return;
    const b = getBudgetById(id);
    if (b) setBudget(b);
  };

  const handleDelete = () => {
    if (!id) return;
    if (confirm('Eliminar este presupuesto?')) {
      deleteBudget(id);
      toast.success('Presupuesto eliminado');
      navigate('/budgets');
    }
  };

  if (!budget || !profile) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </PageLayout>
    );
  }

  const statusLabels: Record<Budget['status'], string> = {
    draft: 'Borrador',
    sent: 'Enviado',
    accepted: 'Aceptado',
    rejected: 'Rechazado',
  };

  const statusStyles: Record<Budget['status'], string> = {
    draft: 'bg-muted text-muted-foreground',
    sent: 'status-sent',
    accepted: 'status-accepted',
    rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/budgets')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Presupuesto</h1>
          <p className="text-sm text-muted-foreground">
            #{budget.id.substring(0, 8).toUpperCase()}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Status and Category */}
      <div className="flex gap-2 mb-4">
        <span className={cn('text-xs px-3 py-1 rounded-full', CATEGORY_COLORS[budget.category])}>
          {CATEGORY_LABELS[budget.category]}
        </span>
        <span className={cn('text-xs px-3 py-1 rounded-full', statusStyles[budget.status])}>
          {statusLabels[budget.status]}
        </span>
      </div>

      {/* Client Info */}
      <div className="card-elevated p-4 mb-4">
        <h3 className="text-sm text-muted-foreground mb-1">Cliente</h3>
        <p className="font-medium text-foreground">{budget.clientName}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(budget.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Items */}
      <div className="card-elevated p-4 mb-4">
        <h3 className="text-sm text-muted-foreground mb-3">Detalle</h3>
        <div className="space-y-2">
          {budget.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-foreground">
                {item.quantity}x {item.description}
              </span>
              <span className="text-muted-foreground">
                ${item.total.toLocaleString('es-AR')}
              </span>
            </div>
          ))}
        </div>
        
        <div className="border-t border-border mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Materiales</span>
            <span>${budget.subtotal.toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mano de Obra</span>
            <span>${budget.laborCost.toLocaleString('es-AR')}</span>
          </div>
          {budget.taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA ({budget.taxRate}%)</span>
              <span>${budget.taxAmount.toLocaleString('es-AR')}</span>
            </div>
          )}
          {budget.discount > 0 && (
            <div className="flex justify-between text-sm text-accent">
              <span>Descuento</span>
              <span>-${budget.discount.toLocaleString('es-AR')}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">
              ${budget.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="card-elevated p-4 mb-4">
        <h3 className="text-sm text-muted-foreground mb-3">Condiciones</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Validez</span>
            <span>{budget.validityDays} dias</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Garantia</span>
            <span>{budget.warranty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Forma de Pago</span>
            <span>{budget.paymentTerms}</span>
          </div>
        </div>
        {budget.notes && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">Observaciones:</p>
            <p className="text-sm mt-1">{budget.notes}</p>
          </div>
        )}
      </div>

      {/* Share Options */}
      <div className="card-elevated p-4">
        <ShareOptions budget={budget} profile={profile} onStatusChange={loadBudget} />
      </div>
    </PageLayout>
  );
};

export default BudgetDetailPage;
