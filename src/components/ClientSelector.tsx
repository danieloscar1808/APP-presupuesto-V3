import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { getClients } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientSelectorProps {
  value?: string;
  onChange: (clientId: string, clientName: string) => void;
  onAddNew: () => void;
}

export const ClientSelector = ({ value, onChange, onAddNew }: ClientSelectorProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setClients(getClients());
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Cliente</label>
        <Button variant="ghost" size="sm" onClick={onAddNew} className="text-primary">
          <Plus className="w-4 h-4 mr-1" />
          Nuevo
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide">
        {filteredClients.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay clientes registrados</p>
            <Button variant="link" onClick={onAddNew} className="mt-1 text-primary">
              Agregar primer cliente
            </Button>
          </div>
        ) : (
          filteredClients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => onChange(client.id, client.name)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                value === client.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-sm font-medium text-secondary-foreground">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{client.name}</p>
                <p className="text-sm text-muted-foreground truncate">{client.phone}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
