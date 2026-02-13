 import { Label } from '@/components/ui/label';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 
 export interface ACEquipmentValues {
   capacity: string;
   technology: string;
   status: string;
 }
 
 interface ACEquipmentDataProps {
   value: ACEquipmentValues;
   onChange: (value: ACEquipmentValues) => void;
 }
 
 const CAPACITY_OPTIONS = ['2250', '3000', '4500', '6000'];
 const TECHNOLOGY_OPTIONS = ['On/Off', 'Inverter'];
 const STATUS_OPTIONS = [
   'Instalacion de equipo nuevo',
   'Desinstalacion',
   'Reinstalacion',
 ];
 
 export const ACEquipmentData = ({ value, onChange }: ACEquipmentDataProps) => {
   return (
     <div className="card-elevated p-4 space-y-4">
       <h3 className="font-medium text-foreground">Datos del Equipo</h3>
 
       {/* Capacidad */}
       <div className="space-y-2">
         <Label>Capacidad del Equipo (Frigorias)</Label>
         <Select
           value={value.capacity}
           onValueChange={(selected) => onChange({ ...value, capacity: selected })}
         >
           <SelectTrigger>
             <SelectValue placeholder="Seleccionar capacidad" />
           </SelectTrigger>
           <SelectContent>
             {CAPACITY_OPTIONS.map((opt) => (
               <SelectItem key={opt} value={opt}>
                 {opt} frigorias
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       {/* Tecnologia */}
       <div className="space-y-2">
         <Label>Tecnologia</Label>
         <Select
           value={value.technology}
           onValueChange={(selected) => onChange({ ...value, technology: selected })}
         >
           <SelectTrigger>
             <SelectValue placeholder="Seleccionar tecnologia" />
           </SelectTrigger>
           <SelectContent>
             {TECHNOLOGY_OPTIONS.map((opt) => (
               <SelectItem key={opt} value={opt}>
                 {opt}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       {/* Estado */}
       <div className="space-y-2">
         <Label>Estado</Label>
         <Select
           value={value.status}
           onValueChange={(selected) => onChange({ ...value, status: selected })}
         >
           <SelectTrigger>
             <SelectValue placeholder="Seleccionar estado" />
           </SelectTrigger>
           <SelectContent>
             {STATUS_OPTIONS.map((opt) => (
               <SelectItem key={opt} value={opt}>
                 {opt}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
     </div>
   );
 };