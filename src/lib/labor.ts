import { BudgetLaborItem, CatalogItem } from "@/types";

type LaborLikeItem = CatalogItem | BudgetLaborItem;

const getLaborItemKey = (item: Pick<CatalogItem, "id" | "name" | "price">) =>
  `${item.id}::${item.name}::${item.price}`;

export const getLaborItemQuantity = (
  item: Pick<BudgetLaborItem, "quantity">
): number => {
  const parsedQuantity = Number(item.quantity);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
    return 1;
  }

  return Math.floor(parsedQuantity);
};

export const getLaborItemTotal = (
  item: Pick<BudgetLaborItem, "price" | "quantity">
): number => Number(item.price || 0) * getLaborItemQuantity(item);

export const getLaborItemsTotal = (items: BudgetLaborItem[] = []): number =>
  items.reduce((acc, item) => acc + getLaborItemTotal(item), 0);

export const getLaborUnitsCount = (items: BudgetLaborItem[] = []): number =>
  items.reduce((acc, item) => acc + getLaborItemQuantity(item), 0);

export const normalizeLaborItems = (
  items: LaborLikeItem[] = []
): BudgetLaborItem[] => {
  const normalizedItems = new Map<string, BudgetLaborItem>();

  items.forEach((item) => {
    const quantity = getLaborItemQuantity(item);
    const itemKey = getLaborItemKey(item);
    const existingItem = normalizedItems.get(itemKey);

    if (existingItem) {
      normalizedItems.set(itemKey, {
        ...existingItem,
        quantity: getLaborItemQuantity(existingItem) + quantity,
      });
      return;
    }

    normalizedItems.set(itemKey, {
      ...item,
      quantity,
      createdAt: item.createdAt || new Date().toISOString(),
    });
  });

  return Array.from(normalizedItems.values());
};
