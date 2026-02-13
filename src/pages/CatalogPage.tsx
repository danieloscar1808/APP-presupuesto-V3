 import { useState, useEffect } from 'react';
 import { PageLayout } from '@/components/PageLayout';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 import { Plus, Trash2, Search, Package, Download, Upload } from 'lucide-react';
 import { CatalogItem, BudgetCategory, CATEGORY_LABELS } from '@/types';
 import { getCatalogItems, saveCatalogItem, deleteCatalogItem } from '@/lib/storage';
 import { v4 as uuid } from 'uuid';
 import { toast } from 'sonner';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from '@/components/ui/alert-dialog';
 
const CatalogPage = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: 0, category: 'general' as BudgetCategory | 'general' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(getCatalogItems());
  }, []);

  const handleExport = () => {
    const data = JSON.stringify(items, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalogo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Catálogo exportado');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as CatalogItem[];
          if (!Array.isArray(imported)) throw new Error();
          imported.forEach((item) => {
            if (item.name && item.price != null) {
              saveCatalogItem({ ...item, id: item.id || uuid(), createdAt: item.createdAt || new Date().toISOString() });
            }
          });
          setItems(getCatalogItems());
          toast.success(`${imported.length} items importados`);
        } catch {
          toast.error('Archivo inválido');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };
 
   const handleAddItem = () => {
     if (!newItem.name.trim() || newItem.price <= 0) {
       toast.error('Ingrese nombre y precio valido');
       return;
     }
 
     const item: CatalogItem = {
       id: uuid(),
       name: newItem.name.trim(),
       price: newItem.price,
       category: newItem.category,
       createdAt: new Date().toISOString(),
     };
 
     saveCatalogItem(item);
     setItems(getCatalogItems());
     setNewItem({ name: '', price: 0, category: 'general' });
     toast.success('Item agregado al catalogo');
   };
 
   const handleUpdateItem = (item: CatalogItem) => {
     saveCatalogItem(item);
     setItems(getCatalogItems());
     setEditingId(null);
     toast.success('Item actualizado');
   };
 
   const handleDeleteItem = (id: string) => {
     deleteCatalogItem(id);
     setItems(getCatalogItems());
     toast.success('Item eliminado');
   };
 
   const filteredItems = items.filter(item =>
     item.name.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const getCategoryLabel = (cat?: BudgetCategory | 'general') => {
     if (!cat || cat === 'general') return 'General';
     return CATEGORY_LABELS[cat];
   };
 
   return (
     <PageLayout title="Catalogo de Materiales">
      <div className="space-y-4">
           <div className="flex gap-2">
             <Button variant="outline" className="flex-1" onClick={handleImport}>
               <Upload className="w-4 h-4 mr-2" />
               Importar
             </Button>
             <Button variant="outline" className="flex-1" onClick={handleExport} disabled={items.length === 0}>
               <Download className="w-4 h-4 mr-2" />
               Exportar
             </Button>
           </div>

           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input
               placeholder="Buscar material..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10"
             />
           </div>
 
         {/* Add new item form */}
         <Card className="border-dashed">
           <CardContent className="p-4 space-y-3">
             <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
               <Plus className="w-4 h-4" />
               Agregar nuevo item
             </div>
             <Input
               placeholder="Nombre del material o item"
               value={newItem.name}
               onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
             />
             <div className="flex gap-2">
               <div className="flex-1">
                 <Input
                   type="number"
                   placeholder="Precio"
                   value={newItem.price || ''}
                   onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                   min={0}
                 />
               </div>
               <Select
                 value={newItem.category}
                 onValueChange={(val) => setNewItem({ ...newItem, category: val as BudgetCategory | 'general' })}
               >
                 <SelectTrigger className="w-36">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="general">General</SelectItem>
                   <SelectItem value="ac">Aire Acond.</SelectItem>
                   <SelectItem value="electric">Electrico</SelectItem>
                   <SelectItem value="solar">Solar</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <Button onClick={handleAddItem} className="w-full btn-gradient">
               <Plus className="w-4 h-4 mr-2" />
               Agregar al Catalogo
             </Button>
           </CardContent>
         </Card>
 
         {/* Items list */}
         <div className="space-y-2">
           {filteredItems.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
               <p className="font-medium">No hay items en el catalogo</p>
               <p className="text-sm">Agrega materiales para usarlos en tus presupuestos</p>
             </div>
           ) : (
             filteredItems.map((item) => (
               <Card key={item.id} className="card-elevated">
                 <CardContent className="p-4">
                   {editingId === item.id ? (
                      <div className="space-y-2">
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            const updated = { ...item, name: e.target.value };
                            setItems(items.map(i => i.id === item.id ? updated : i));
                          }}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const updated = { ...item, price: Number(e.target.value) };
                              setItems(items.map(i => i.id === item.id ? updated : i));
                            }}
                            className="flex-1"
                          />
                          <Select
                            value={item.category || 'general'}
                            onValueChange={(val) => {
                              const updated = { ...item, category: val as BudgetCategory | 'general' };
                              setItems(items.map(i => i.id === item.id ? updated : i));
                            }}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="ac">Aire Acond.</SelectItem>
                              <SelectItem value="electric">Electrico</SelectItem>
                              <SelectItem value="solar">Solar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleUpdateItem(item)}
                            className="flex-1 btn-accent"
                          >
                            Guardar
                          </Button>
                        </div>
                      </div>
                   ) : (
                     <div className="flex items-center justify-between">
                       <div
                         className="flex-1 cursor-pointer"
                         onClick={() => setEditingId(item.id)}
                       >
                         <p className="font-medium text-foreground">{item.name}</p>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <span>${item.price.toLocaleString('es-AR')}</span>
                           <span>•</span>
                           <span>{getCategoryLabel(item.category)}</span>
                         </div>
                       </div>
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Eliminar item</AlertDialogTitle>
                             <AlertDialogDescription>
                               Esta seguro que desea eliminar "{item.name}" del catalogo?
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancelar</AlertDialogCancel>
                             <AlertDialogAction
                               onClick={() => handleDeleteItem(item.id)}
                               className="bg-destructive text-destructive-foreground"
                             >
                               Eliminar
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>
                   )}
                 </CardContent>
               </Card>
             ))
           )}
         </div>
 
         {items.length > 0 && (
           <p className="text-center text-sm text-muted-foreground">
             {items.length} item{items.length !== 1 ? 's' : ''} en el catalogo
           </p>
         )}
       </div>
     </PageLayout>
   );
 };
 
 export default CatalogPage;