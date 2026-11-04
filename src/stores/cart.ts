import { atom, computed } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image?: string;
  size: string;
  quantity: number;
};

// Maximum units of the same product and size in one line
export const MAX_QUANTITY = 10;

// localStorage can be edited by anyone, so we never trust what we read from it
function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.size === "string" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}

function decodeCart(raw: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCartItem).map((item) => ({
      ...item,
      quantity: Math.min(Math.floor(item.quantity), MAX_QUANTITY),
    }));
  } catch {
    // Corrupted data: start with an empty cart instead of crashing
    return [];
  }
}

// The cart itself, saved in localStorage under "vanidiosas-cart"
export const $cart = persistentAtom<CartItem[]>("vanidiosas-cart", [], {
  encode: JSON.stringify,
  decode: decodeCart,
});

// Whether the side panel is open (not saved: it always starts closed)
export const $isCartOpen = atom(false);

// Derived values: calculated from $cart, never stored separately
export const $cartCount = computed($cart, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

export const $cartTotal = computed($cart, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

// A cart line is identified by product + size (same shoe, different size = different line)
function isSameLine(item: CartItem, slug: string, size: string): boolean {
  return item.slug === slug && item.size === size;
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity: number) {
  const items = $cart.get();
  const exists = items.some((current) => isSameLine(current, item.slug, item.size));

  if (exists) {
    // Never mutate the array: create a new one so subscribers are notified
    $cart.set(
      items.map((current) =>
        isSameLine(current, item.slug, item.size)
          ? { ...current, quantity: Math.min(current.quantity + quantity, MAX_QUANTITY) }
          : current
      )
    );
    return;
  }

  $cart.set([...items, { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }]);
}

export function updateQuantity(slug: string, size: string, quantity: number) {
  // Going below 1 removes the line
  if (quantity < 1) {
    removeFromCart(slug, size);
    return;
  }

  $cart.set(
    $cart.get().map((item) =>
      isSameLine(item, slug, size)
        ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
        : item
    )
  );
}

export function removeFromCart(slug: string, size: string) {
  $cart.set($cart.get().filter((item) => !isSameLine(item, slug, size)));
}

export function clearCart() {
  $cart.set([]);
}

export function openCart() {
  $isCartOpen.set(true);
}

export function closeCart() {
  $isCartOpen.set(false);
}