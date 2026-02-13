 import { useState, useEffect } from 'react';
 import { BudgetItem, BudgetCategory, CatalogItem } from '@/types';
 import { getCatalogItems } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 
 interface ItemsEditorProps {
   items: BudgetItem[];
   onChange: (items: BudgetItem[]) => void;
   category?: BudgetCategory;
 }
 
 export const ItemsEditor = ({ items, onChange, category }: ItemsEditorProps) => {
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, unitPrice: 0 });
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);

  useEffect(() => {
    setCatalogItems(getCatalogItems());
  }, []);

  // Filter catalog items by category or general
  const availableCatalogItems = catalogItems.filter(
    item => item.category === 'general' || item.category === category
  );

  const handleCatalogSelect = (catalogItemName: string) => {
    const catalogItem = catalogItems.find(i => i.name === catalogItemName);
    if (catalogItem) {
      setNewItem({
        description: catalogItem.name,
        quantity: 1,
        unitPrice: catalogItem.price,
      });
    }
  };

  const addItem = () => {
    if (!newItem.description || newItem.unitPrice <= 0) return;
    
    const item: BudgetItem = {
      id: uuid(),
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total: newItem.quantity * newItem.unitPrice,
    };
    
    onChange([...items, item]);
    setNewItem({ description: '', quantity: 1, unitPrice: 0 });
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.total = updated.quantity * updated.unitPrice;
        return updated;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground">Materiales e Items</label>
      
      {/* Item list */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <Input
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                className="flex-1"
                placeholder="Descripcion"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="text-destructive shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <div className="w-20">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                  min={1}
                  className="text-center"
                />
                <span className="text-xs text-muted-foreground">Cant.</span>
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                  min={0}
                  className="text-right"
                />
                <span className="text-xs text-muted-foreground">Precio Unit.</span>
              </div>
              <div className="w-28 text-right">
                <p className="h-10 flex items-center justify-end font-medium text-foreground">
                  ${item.total.toLocaleString('es-AR')}
                </p>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add new item */}
      <div className="card-elevated p-3 border-dashed space-y-2">
        {availableCatalogItems.length > 0 && (
          <Select
            value=""
            onValueChange={handleCatalogSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar del catalogo..." />
            </SelectTrigger>
            <SelectContent>
              {availableCatalogItems.map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name} - ${item.price.toLocaleString('es-AR')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Input
          placeholder="Descripcion del item o material"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        />
        <div className="flex gap-2">
          <div className="w-20">
            <Input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              min={1}
              className="text-center"
            />
          </div>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Precio"
              value={newItem.unitPrice || ''}
              onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
              min={0}
              className="text-right"
            />
          </div>
          <Button onClick={addItem} className="btn-accent shrink-0">
            <Plus className="w-4 h-4 mr-1" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Subtotal */}
      {items.length > 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Subtotal Materiales</span>
          <span className="font-semibold text-foreground">
            ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
};
