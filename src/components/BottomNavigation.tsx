import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, FileText, Settings, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/budgets', icon: FileText, label: 'Historial' },
  { path: '/clients', icon: Users, label: 'Clientes' },
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/catalog', icon: Package, label: 'Catalogo' },
  { path: '/profile', icon: Settings, label: 'Perfil' },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="nav-mobile safe-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;


          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              <span className={cn('text-xs mt-1', isActive && 'font-medium')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
