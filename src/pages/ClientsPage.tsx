import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageLayout } from "@/components/PageLayout";
import { Client } from "@/types";
import {
  getClients,
  saveClient,
  deleteClient,
} from "@/lib/storage";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import {
  Plus,
  Search,
  User,
  Phone,
  Mail,
  Trash2,
  Edit,
} from "lucide-react";

const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // ---------------------------------------------------------
  // CARGAR CLIENTES DESDE INDEXEDDB
  // ---------------------------------------------------------
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const list = await getClients();
    setClients(list);
  };

  // FILTRO
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  // ---------------------------------------------------------
  // DIALOG - NUEVO CLIENTE
  // ---------------------------------------------------------
  const openNewDialog = () => {
    setEditingClient(null);
    setFormData({ name: "", phone: "", email: "", address: "" });
    setIsDialogOpen(true);
  };

  // ---------------------------------------------------------
  // DIALOG - EDITAR CLIENTE
  // ---------------------------------------------------------
  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
    });
    setIsDialogOpen(true);
  };

  // ---------------------------------------------------------
  // GUARDAR CLIENTE (NUEVO O EDITADO)
  // ---------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Nombre y teléfono son requeridos");
      return;
    }

    const client: Client = {
      id: editingClient?.id || uuid(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      createdAt:
        editingClient?.createdAt || new Date().toISOString(),
    };

    await saveClient(client);
    await loadClients();

    setIsDialogOpen(false);
    toast.success(
      editingClient ? "Cliente actualizado" : "Cliente agregado"
    );
  };

  // ---------------------------------------------------------
  // ELIMINAR CLIENTE
  // ---------------------------------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este cliente?")) return;

    await deleteClient(id);
    await loadClients();

    toast.success("Cliente eliminado");
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <PageLayout title="Clientes">
      {/* SEARCH */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button onClick={openNewDialog} className="btn-accent shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* LISTA */}
      {filteredClients.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            No hay clientes registrados
          </p>
          <Button
            variant="link"
            onClick={openNewDialog}
            className="mt-2 text-primary"
          >
            Agregar primer cliente
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <div key={client.id} className="card-elevated p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-primary">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground">
                      {client.name}
                    </h3>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Phone className="w-3 h-3" />
                      <span>{client.phone}</span>
                    </div>

                    {client.email && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(client)}
                    className="h-8 w-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(client.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIALOGO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Teléfono *</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>

              <Button type="submit" className="flex-1 btn-gradient">
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ClientsPage;