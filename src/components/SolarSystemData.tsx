 import { useEffect } from 'react';
 import { Label } from '@/components/ui/label';
 import { Input } from '@/components/ui/input';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 
 export interface SolarSystemValues {
   systemType: string;
   panelType: string;
   panelPower: string;
   quantity: number;
   totalPower: number;
 }
 
 interface SolarSystemDataProps {
   value: SolarSystemValues;
   onChange: (value: SolarSystemValues) => void;
 }
 
 const SYSTEM_TYPE_OPTIONS = ['On-grid', 'Off-grid', 'Hibrido'];
 const PANEL_TYPE_OPTIONS = ['Monocristalino', 'Policristalino'];
 const PANEL_POWER_OPTIONS = [
   '10', '30', '50', '60', '90', '120', '170', '200', '210',
   '350', '370', '400', '410', '440', '450', '500', '520', '550', '580', '585', '610', '635', '700', '710'
 ];
 
 export const SolarSystemData = ({ value, onChange }: SolarSystemDataProps) => {
   // Calcular potencia total cuando cambia la potencia del panel o cantidad
   useEffect(() => {
     const power = parseInt(value.panelPower) || 0;
     const qty = value.quantity || 0;
     const totalPower = power * qty;
     if (totalPower !== value.totalPower) {
       onChange({ ...value, totalPower });
     }
   }, [value.panelPower, value.quantity]);
 
   return (
     <div className="card-elevated p-4 space-y-4">
       <h3 className="font-medium text-foreground">Datos del Sistema</h3>
 
       {/* Tipo de Sistema */}
       <div className="space-y-2">
         <Label>Tipo de Sistema</Label>
         <Select
           value={value.systemType}
           onValueChange={(selected) => onChange({ ...value, systemType: selected })}
         >
           <SelectTrigger>
             <SelectValue placeholder="Seleccionar tipo de sistema" />
           </SelectTrigger>
           <SelectContent>
             {SYSTEM_TYPE_OPTIONS.map((opt) => (
               <SelectItem key={opt} value={opt}>
                 {opt}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       {/* Tipo de Panel */}
       <div className="space-y-2">
         <Label>Tipo de Panel</Label>
         <Select
           value={value.panelType}
           onValueChange={(selected) => onChange({ ...value, panelType: selected })}
         >
           <SelectTrigger>
             <SelectValue placeholder="Seleccionar tipo de panel" />
           </SelectTrigger>
           <SelectContent>
             {PANEL_TYPE_OPTIONS.map((opt) => (
               <SelectItem key={opt} value={opt}>
                 {opt}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       {/* Potencia del Panel */}
       <div className="space-y-2">
         <Label>Potencia del Panel (Wp)</Label>
         <Select
           value={value.panelPower}
           onValueChange={(selected) => onChange({ ...value, panelPower: selected })}
         >
           <SelectTrigger>
             <SelectValue placeholder="Seleccionar potencia" />
           </SelectTrigger>
           <SelectContent>
             {PANEL_POWER_OPTIONS.map((opt) => (
               <SelectItem key={opt} value={opt}>
                 {opt} Wp
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       {/* Cantidad de Paneles */}
       <div className="space-y-2">
         <Label>Cantidad de Paneles</Label>
         <Input
           type="number"
           min={0}
           value={value.quantity || ''}
           onChange={(e) => onChange({ ...value, quantity: Number(e.target.value) })}
           placeholder="0"
         />
       </div>
 
       {/* Potencia Total (calculada) */}
       <div className="space-y-2">
         <Label>Potencia Total (Wp)</Label>
         <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted text-foreground font-medium">
           {value.totalPower || 0} Wp
         </div>
         <p className="text-xs text-muted-foreground">
           Calculado automaticamente: Potencia x Cantidad
         </p>
       </div>
     </div>
   );
 };