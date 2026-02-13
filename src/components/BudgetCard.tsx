import { Budget, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface BudgetCardProps {
  budget: Budget;
  onClick: () => void;
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

export const BudgetCard = ({ budget, onClick }: BudgetCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full card-elevated p-4 text-left hover:shadow-elevated transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs px-2 py-0.5 rounded-full', CATEGORY_COLORS[budget.category])}>
              {CATEGORY_LABELS[budget.category].split(' ')[0]}
            </span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', statusStyles[budget.status])}>
              {statusLabels[budget.status]}
            </span>
          </div>
          <h3 className="font-medium text-foreground truncate">{budget.clientName}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(budget.createdAt), "d MMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-foreground">
            ${budget.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
          </p>
          <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto mt-1" />
        </div>
      </div>
    </button>
  );
};
