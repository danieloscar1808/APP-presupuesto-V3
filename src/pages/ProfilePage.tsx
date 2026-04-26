import { useState, useEffect } from 'react';
import CreatePinScreen from '../screens/CreatePinScreen.jsx';
import EnterPinScreen from '../screens/EnterPinScreen.jsx';
import { PageLayout } from '@/components/PageLayout';
import { Profile } from '@/types';
import { getProfile, saveProfile, generateBackup } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Building2, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';


const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile>({
    id: "profile",
    name: '',
    businessName: '',
    taxId: '',
    phone: '',
    email: '',
    address: '',
    iibb: '',
    startDate: '',
  });

  const [autorizado, setAutorizado] = useState(false);
  const [pinCreado, setPinCreado] = useState(false);
  const user_id = "usuario_demo";

  // Cargar perfil almacenado
  useEffect(() => {
    async function load() {
      const existing = await getProfile();
      if (existing) {
        setProfile(existing);
      }
      const pin = localStorage.getItem("pin_creado");
      if (pin === "true") {
      setPinCreado(true);
    }
    }
    load();
  }, []);

  const updateField = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.name || !profile.phone) {
      toast.error('Nombre y teléfono son requeridos');
      return;
    }

    await saveProfile(profile);
    toast.success('Perfil guardado correctamente');
  };

  // 1. No tiene PIN → crear
if (!pinCreado) {
  return (
    <CreatePinScreen
      user_id={user_id}
      onSuccess={() => setPinCreado(true)}
    />
  );
}

// 2. Tiene PIN pero no validó → pedir PIN
if (!autorizado) {
  return (
    <EnterPinScreen
      user_id={user_id}
      onSuccess={() => {
        console.log("AUTORIZADO");
        setAutorizado(true);
      }}
    />
  );
}
  
  return (
    <PageLayout title="Perfil Profesional">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Datos Personales */}
        <div className="card-elevated p-4 space-y-4">
          <h2 className="font-medium text-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Datos Personales
          </h2>

          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Juan Perez"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono *</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+54 11 1234-5678"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="juan@ejemplo.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Datos Comerciales */}
        <div className="card-elevated p-4 space-y-4">
          <h2 className="font-medium text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Datos Comerciales
          </h2>

          <div className="space-y-3">
            <div>
              <Label htmlFor="businessName">Razón Social / Nombre Comercial</Label>
              <Input
                id="businessName"
                value={profile.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                placeholder="Instalaciones JP"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="taxId">CUIT / Identificación Fiscal</Label>
              <div className="relative mt-1">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="taxId"
                  value={profile.taxId}
                  onChange={(e) => updateField('taxId', e.target.value)}
                  placeholder="20-12345678-9"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <div className="relative mt-1">
                
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Av. Corrientes 1234, CABA"
                  className="pl-2 min-h-[60px] text-[16px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="iibb">Ingresos Brutos (IIBB)</Label>
              <Input
              id="iibb"
              value={profile.iibb || ''}
                onChange={(e) => updateField('iibb', e.target.value)}
                placeholder="901-123456-7"
                className="mt-1"
                />
            </div>

            <div>
              <Label htmlFor="startDate">Inicio de Actividades</Label>
              <Input
              id="startDate"
              type="date"
              value={profile.startDate || ''}
              onChange={(e) => updateField('startDate', e.target.value)}
              className="mt-1"
              />
            </div>

          </div>
        </div>

        <Button type="submit" className="w-full btn-gradient h-12 text-foreground">
          <Save className="w-4 h-4 mr-2" />
          Guardar Perfil
        </Button>
      </form>

      {/* BACKUP SECTION */}
      <div className="card-elevated p-4 space-y-3 mt-6">
        <h3 className="font-medium text-foreground">Backup de Datos</h3>
        <p className="text-sm text-muted-foreground">
          Guarda o restaura una copia completa de tus clientes, presupuestos, catálogo y perfil.
        </p>

        {/* Exportar Backup */}
        <Button
          className="btn-accent w-full"
          onClick={async () => {
            const backup = await generateBackup();
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "Perfil SICE.json";
            a.click();

            URL.revokeObjectURL(url);
          }}
        >
          Exportar Backup
        </Button>

        {/* Importar Backup */}
        <Button
  variant="outline"
  className="w-full"
  onClick={() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        toast.error("No seleccionaste ningún archivo");
        return;
      }

      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const text = reader.result as string;
          const data = JSON.parse(text);

          const { importBackup } = await import("@/lib/storage");

          await importBackup(data);

          toast.success("Backup importado. Recargando...");

          setTimeout(() => {
            window.location.reload();
          }, 800);
        } catch (error) {
          console.error(error);
          toast.error("Error al procesar el archivo");
        }
      };

      reader.onerror = () => {
        toast.error("Error leyendo el archivo");
      };

      reader.readAsText(file);
    };

    input.click();
  }}
>
  Importar Backup
</Button>
      </div>

    </PageLayout>
  );
};

export default ProfilePage;
