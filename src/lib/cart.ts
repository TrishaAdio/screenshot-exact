import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  category?: string;
  months: number;
  price: number;
  realPrice?: number;
  quantity: number;
};

const KEY = "symdeals.cart";
const EVT = "symdeals:cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVT));
  } catch {
    /* ignore */
  }
}

function itemKey(i: Pick<CartItem, "productId" | "months">) {
  return `${i.productId}::${i.months}`;
}

export function getCart(): CartItem[] {
  return read();
}

export function addToCart(item: CartItem) {
  const items = read();
  const k = itemKey(item);
  const existing = items.find((x) => itemKey(x) === k);
  if (existing) {
    existing.quantity += item.quantity || 1;
    // refresh price/realPrice in case admin updated
    existing.price = item.price;
    existing.realPrice = item.realPrice;
    existing.image = item.image;
    existing.name = item.name;
    existing.category = item.category;
  } else {
    items.push({ ...item, quantity: item.quantity || 1 });
  }
  write(items);
}

export function removeFromCart(productId: string, months: number) {
  write(read().filter((x) => !(x.productId === productId && x.months === months)));
}

export function setCartQuantity(productId: string, months: number, qty: number) {
  const items = read();
  const next = items
    .map((x) =>
      x.productId === productId && x.months === months
        ? { ...x, quantity: Math.max(0, Math.floor(qty)) }
        : x
    )
    .filter((x) => x.quantity > 0);
  write(next);
}

export function clearCart() {
  write([]);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => read());

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVT, sync as EventListener);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const totalItems = items.reduce((s, x) => s + x.quantity, 0);
  const totalPrice = items.reduce((s, x) => s + x.price * x.quantity, 0);
  const totalSaved = items.reduce(
    (s, x) =>
      s + Math.max(0, ((x.realPrice ?? 0) - x.price)) * x.quantity,
    0
  );

  const remove = useCallback((productId: string, months: number) => {
    removeFromCart(productId, months);
  }, []);
  const setQty = useCallback(
    (productId: string, months: number, qty: number) => {
      setCartQuantity(productId, months, qty);
    },
    []
  );
  const clear = useCallback(() => clearCart(), []);

  return { items, totalItems, totalPrice, totalSaved, remove, setQty, clear };
}
