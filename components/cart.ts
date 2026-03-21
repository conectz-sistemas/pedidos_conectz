export type CartExtra = { ingredientId: string; name: string; priceCents: number; quantity?: number };

export type CartSubstitution = {
  baseIngredientId: string;
  baseName: string;
  chosenIngredientId: string;
  chosenName: string;
};

export type CartItem = {
  productId: string;
  productName: string;
  basePriceCents: number;
  quantity: number;
  notes?: string;

  removed: { ingredientId: string; name: string }[];
  substitutions: CartSubstitution[];
  extras: CartExtra[];
};

export type Cart = { items: CartItem[] };

export function cartStorageKey(merchantSlug: string) {
  return `pedidos_conectz_cart_${merchantSlug}`;
}

export function readCart(merchantSlug: string): Cart {
  if (typeof window === "undefined") return { items: [] };
  const raw = localStorage.getItem(cartStorageKey(merchantSlug));
  if (!raw) return { items: [] };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.items || !Array.isArray(parsed.items)) return { items: [] };
    return parsed as Cart;
  } catch {
    return { items: [] };
  }
}

export function writeCart(merchantSlug: string, cart: Cart) {
  if (typeof window === "undefined") return;
  localStorage.setItem(cartStorageKey(merchantSlug), JSON.stringify(cart));
}

export function addItem(merchantSlug: string, item: CartItem) {
  const cart = readCart(merchantSlug);
  cart.items.push(item);
  writeCart(merchantSlug, cart);
  return cart;
}

export function clearCart(merchantSlug: string) {
  writeCart(merchantSlug, { items: [] });
}

export function cartTotals(cart: Cart) {
  const subtotalCents = cart.items.reduce((sum, it) => {
    const extrasSum = it.extras.reduce(
      (s, e) => s + e.priceCents * (e.quantity ?? 1),
      0
    );
    return sum + (it.basePriceCents + extrasSum) * it.quantity;
  }, 0);
  return { subtotalCents, totalCents: subtotalCents };
}

