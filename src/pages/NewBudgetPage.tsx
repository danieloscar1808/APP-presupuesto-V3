import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { CategorySelector } from '@/components/CategorySelector';
import { ClientSelector } from '@/components/ClientSelector';
import { ItemsEditor } from '@/components/ItemsEditor';
 import { ACEquipmentData, ACEquipmentValues } from '@/components/ACEquipmentData';
 import { SolarSystemData, SolarSystemValues } from '@/components/SolarSystemData';
import { Budget, BudgetItem, BudgetCategory, Profile, Client } from '@/types';
import { saveBudget, getProfile, saveClient, getClients } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { ChevronRight, ChevronLeft, Save, Eye } from 'lucide-react';

type Step = 'category' | 'client' | 'items' | 'summary';

const NewBudgetPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('category');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '', address: '' });

  const [budget, setBudget] = useState<Partial<Budget>>({
    id: uuid(),
    category: undefined,
    clientId: '',
    clientName: '',
    items: [],
    laborCost: 0,
    subtotal: 0,
    taxRate: 21,
    taxAmount: 0,
    discount: 0,
    total: 0,
    notes: '',
    validityDays: 5,
    warranty: '6 meses en mano de obra',
    paymentTerms: '50% anticipo, 50% al finalizar',
    status: 'draft',
    createdAt: new Date().toISOString(),
     acEquipment: {
       capacity: '',
       technology: '',
       status: '',
     },
     solarSystem: {
       systemType: '',
       panelType: '',
       panelPower: '',
       quantity: 0,
       totalPower: 0,
     },
  });

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      toast.error('Configura tu perfil primero');
      navigate('/profile');
      return;
    }
    setProfile(p);
  }, [navigate]);

  // Calculate totals when items or costs change
  useEffect(() => {
    const subtotal = budget.items?.reduce((sum, item) => sum + item.total, 0) || 0;
    const baseAmount = subtotal + (budget.laborCost || 0);
    const taxAmount = (baseAmount * (budget.taxRate || 0)) / 100;
    const total = baseAmount + taxAmount - (budget.discount || 0);

    setBudget((prev) => ({
      ...prev,
      subtotal,
      taxAmount,
      total: Math.max(0, total),
    }));
  }, [budget.items, budget.laborCost, budget.taxRate, budget.discount]);

  const steps: Step[] = ['category', 'client', 'items', 'summary'];
  const currentStepIndex = steps.indexOf(step);

  const canProceed = () => {
    switch (step) {
      case 'category':
        return !!budget.category;
      case 'client':
        return !!budget.clientId;
      case 'items':
        return (budget.items?.length || 0) > 0 || (budget.laborCost || 0) > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Completa los campos requeridos');
      return;
    }
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const handleSave = () => {
    if (!profile) return;
    
    saveBudget(budget as Budget);
    toast.success('Presupuesto guardado');
    navigate(`/budgets/${budget.id}`);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone) {
      toast.error('Nombre y telefono requeridos');
      return;
    }

    const newClient: Client = {
      id: uuid(),
      name: clientForm.name,
      phone: clientForm.phone,
      email: clientForm.email,
      address: clientForm.address,
      createdAt: new Date().toISOString(),
    };

    saveClient(newClient);
    setBudget((prev) => ({
      ...prev,
      clientId: newClient.id,
      clientName: newClient.name,
    }));
    setIsClientDialogOpen(false);
    setClientForm({ name: '', phone: '', email: '', address: '' });
    toast.success('Cliente agregado');
  };

  const renderStep = () => {
    switch (step) {
      case 'category':
        return (
          <CategorySelector
            value={budget.category}
            onChange={(category) => setBudget((prev) => ({ ...prev, category }))}
          />
        );

      case 'client':
        return (
          <ClientSelector
            value={budget.clientId}
            onChange={(clientId, clientName) =>
              setBudget((prev) => ({ ...prev, clientId, clientName }))
            }
            onAddNew={() => setIsClientDialogOpen(true)}
          />
        );

      case 'items':
        return (
          <div className="space-y-6">
             {/* AC Equipment Data */}
             {budget.category === 'ac' && (
               <ACEquipmentData
                 value={budget.acEquipment as ACEquipmentValues}
                 onChange={(acEquipment) => setBudget((prev) => ({ ...prev, acEquipment }))}
               />
             )}
 
             {/* Solar System Data */}
             {budget.category === 'solar' && (
               <SolarSystemData
                 value={budget.solarSystem as SolarSystemValues}
                 onChange={(solarSystem) => setBudget((prev) => ({ ...prev, solarSystem }))}
               />
             )}
 
            <ItemsEditor
              items={budget.items || []}
              onChange={(items) => setBudget((prev) => ({ ...prev, items }))}
               category={budget.category}
            />

            <div className="card-elevated p-4 space-y-4">
              <div>
                <Label htmlFor="laborCost">Mano de Obra</Label>
                <Input
                  id="laborCost"
                  type="number"
                  value={budget.laborCost || ''}
                  onChange={(e) =>
                    setBudget((prev) => ({ ...prev, laborCost: Number(e.target.value) }))
                  }
                  placeholder="0"
                  className="mt-1 text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="taxRate">IVA (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={budget.taxRate || ''}
                    onChange={(e) =>
                      setBudget((prev) => ({ ...prev, taxRate: Number(e.target.value) }))
                    }
                    className="mt-1 text-center"
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Descuento ($)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={budget.discount || ''}
                    onChange={(e) =>
                      setBudget((prev) => ({ ...prev, discount: Number(e.target.value) }))
                    }
                    className="mt-1 text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            {/* Totals */}
            <div className="card-elevated p-4 space-y-3">
              <h3 className="font-medium text-foreground">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Materiales</span>
                  <span>${budget.subtotal?.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mano de Obra</span>
                  <span>${budget.laborCost?.toLocaleString('es-AR')}</span>
                </div>
                {(budget.taxRate || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA ({budget.taxRate}%)</span>
                    <span>${budget.taxAmount?.toLocaleString('es-AR')}</span>
                  </div>
                )}
                {(budget.discount || 0) > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Descuento</span>
                    <span>-${budget.discount?.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">
                    ${budget.total?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="card-elevated p-4 space-y-4">
              <h3 className="font-medium text-foreground">Condiciones</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="validityDays">Validez (dias)</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    value={budget.validityDays}
                    onChange={(e) =>
                      setBudget((prev) => ({ ...prev, validityDays: Number(e.target.value) }))
                    }
                    className="mt-1 text-center"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="warranty">Garantia</Label>
                <Input
                  id="warranty"
                  value={budget.warranty}
                  onChange={(e) => setBudget((prev) => ({ ...prev, warranty: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="paymentTerms">Forma de Pago</Label>
                <Input
                  id="paymentTerms"
                  value={budget.paymentTerms}
                  onChange={(e) => setBudget((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Observaciones</Label>
                <Textarea
                  id="notes"
                  value={budget.notes}
                  onChange={(e) => setBudget((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas adicionales..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  const stepLabels: Record<Step, string> = {
    category: 'Tipo',
    client: 'Cliente',
    items: 'Items',
    summary: 'Resumen',
  };

  return (
    <PageLayout title="Nuevo Presupuesto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= currentStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  i < currentStepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Paso {currentStepIndex + 1}: {stepLabels[step]}
      </p>

      {/* Step Content */}
      <div className="mb-6">{renderStep()}</div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStepIndex > 0 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Atras
          </Button>
        )}
        {currentStepIndex < steps.length - 1 ? (
          <Button onClick={handleNext} className="flex-1 btn-gradient" disabled={!canProceed()}>
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSave} className="flex-1 btn-accent">
            <Save className="w-4 h-4 mr-1" />
            Guardar
          </Button>
        )}
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div>
              <Label htmlFor="newClientName">Nombre *</Label>
              <Input
                id="newClientName"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newClientPhone">Telefono *</Label>
              <Input
                id="newClientPhone"
                type="tel"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newClientEmail">Email</Label>
              <Input
                id="newClientEmail"
                type="email"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsClientDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 btn-gradient">
                Agregar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default NewBudgetPage;
