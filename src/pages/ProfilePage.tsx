import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Profile } from '@/types';
import { getProfile, saveProfile } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { Save, Building2, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile>({
    id: uuid(),
    name: '',
    businessName: '',
    taxId: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    const existing = getProfile();
    if (existing) {
      setProfile(existing);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.name || !profile.phone) {
      toast.error('Nombre y telefono son requeridos');
      return;
    }
    
    saveProfile(profile);
    toast.success('Perfil guardado correctamente');
  };

  const updateField = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <PageLayout title="Perfil Profesional">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
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
              <Label htmlFor="phone">Telefono *</Label>
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

        {/* Business Info */}
        <div className="card-elevated p-4 space-y-4">
          <h2 className="font-medium text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Datos Comerciales
          </h2>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="businessName">Razon Social / Nombre Comercial</Label>
              <Input
                id="businessName"
                value={profile.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                placeholder="Instalaciones JP"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="taxId">CUIT / Identificacion Fiscal</Label>
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
              <Label htmlFor="address">Direccion</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Av. Corrientes 1234, CABA"
                  className="pl-10 min-h-[60px]"
                />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full btn-gradient h-12">
          <Save className="w-4 h-4 mr-2" />
          Guardar Perfil
        </Button>
      </form>
    </PageLayout>
  );
};

export default ProfilePage;
