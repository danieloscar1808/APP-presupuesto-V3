import { useEffect, useState } from "react";
import { Client } from "@/types";
import { getClients } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Plus } from "lucide-react";

interface Props {
  value: string;
  onChange: (id: string, name: string) => void;
  onAddNew: () => void;
}

export const ClientSelector = ({ value, onChange, onAddNew }: Props) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const list = await getClients();
      setClients(list);
    };
    load();
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {filtered.map((client) => (
          <Button
            key={client.id}
            variant={client.id === value ? "default" : "outline"}
            className="w-full justify-start text-left"
            onClick={() => onChange(client.id, client.name)}
          >
            <div>
              <p className="font-medium">{client.name}</p>
              <p className="text-xs opacity-70">{client.phone}</p>
            </div>
          </Button>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">
            No se encontraron clientes
          </p>
        )}
      </div>

      <Button className="w-full btn-gradient" onClick={onAddNew}>
        <Plus className="w-4 h-4 mr-2" />
        Agregar Cliente
      </Button>
    </div>
  );
};