import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { getProfile, getBudgets, getClients } from '@/lib/storage';
import { Profile, Budget } from '@/types';
import { Button } from '@/components/ui/button';
import { BudgetCard } from '@/components/BudgetCard';
import { Plus, FileText, Users, TrendingUp, Settings } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentBudgets, setRecentBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState({
    clients: 0,
    budgets: 0,
    total: 0
  });

  useEffect(() => {
    async function load() {
      // Cargar perfil
      const p = await getProfile();
      setProfile(p);

      // Cargar presupuestos y clientes
      const budgets = await getBudgets();
      const clients = await getClients();

      // Ordenar presupuestos recientes
      const sorted = [...budgets].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRecentBudgets(sorted.slice(0, 3));

      // Stats
      const totalAmount = budgets.reduce((sum, b) => sum + (b.total || 0), 0);

      setStats({
        clients: clients.length,
        budgets: budgets.length,
        total: totalAmount
      });
    }

    load();
  }, []);

  // Si NO hay perfil todavía
  if (!profile) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Settings className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Bienvenido</h1>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Configura tu perfil profesional para comenzar a generar presupuestos
          </p>
          <Button onClick={() => navigate('/profile')} className="btn-gradient">
            Configurar Perfil
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Inicio">
    
      {/* Botón nuevo presupuesto */}
      <Button onClick={() => navigate('/budgets/new')} className="w-full btn-accent h-14 text-base mb-6">
        <Plus className="w-5 h-5 mr-2" />
        Nuevo Presupuesto
      </Button>

      {/* Recent budgets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Presupuestos Recientes</h2>
          {recentBudgets.length > 0 && (
            <Button
              variant="link"
              onClick={() => navigate('/budgets')}
              className="text-primary p-0 h-auto"
            >
              Ver todos
            </Button>
          )}
        </div>

        {recentBudgets.length === 0 ? (
          <div className="card-elevated p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No hay presupuestos aún</p>
            <p className="text-sm text-muted-foreground">Crea tu primer presupuesto</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onClick={() => navigate(`/budgets/${budget.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Index;