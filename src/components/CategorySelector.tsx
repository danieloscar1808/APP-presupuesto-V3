import { cn } from '@/lib/utils';
import { BudgetCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { Thermometer, Zap, Sun } from 'lucide-react';

interface CategorySelectorProps {
  value?: BudgetCategory;
  onChange: (category: BudgetCategory) => void;
}

const categories: { id: BudgetCategory; icon: typeof Thermometer; description: string }[] = [
  { id: 'ac', icon: Thermometer, description: 'Split, frigorias, caneria' },
  { id: 'electric', icon: Zap, description: 'Bocas, cableado, tableros' },
  { id: 'solar', icon: Sun, description: 'Paneles, inversores, baterias' },
];

export const CategorySelector = ({ value, onChange }: CategorySelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Tipo de Instalacion</label>
      <div className="grid gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = value === cat.id;
          
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  CATEGORY_COLORS[cat.id]
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{CATEGORY_LABELS[cat.id]}</p>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                )}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
