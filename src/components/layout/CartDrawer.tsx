import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useStore } from "@nanostores/react";
import {
  $cart,
  $cartCount,
  $cartTotal,
  $isCartOpen,
  MAX_QUANTITY,
  closeCart,
  openCart,
  removeFromCart,
  updateQuantity,
} from "../../stores/cart";
import { formatPrice } from "../../utils/format";

// Inline SVG icons: no extra dependency needed in React
function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function CartDrawer() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const storedItems = useStore($cart);
  const storedCount = useStore($cartCount);
  const storedTotal = useStore($cartTotal);
  const isOpen = useStore($isCartOpen);

  // The server renders an empty cart. We show the saved cart only after mounting,
  // so the first client render matches the server HTML (avoids hydration mismatch)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const items = mounted ? storedItems : [];
  const count = mounted ? storedCount : 0;
  const total = mounted ? storedTotal : 0;

  // Keep the native <dialog> in sync with the shared store
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // A click on the backdrop has the dialog itself as target
  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeCart();
  }

  const countLabel = count === 1 ? "artículo" : "artículos";

  return (
    <>
      <button
        type="button"
        onClick={openCart}
        aria-label={`Carrito, ${count} ${countLabel}`}
        aria-haspopup="dialog"
        className="relative flex size-11 items-center justify-center"
      >
        <BagIcon />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 min-w-[18px] rounded-full bg-sun px-1 text-center text-[11px] font-medium leading-[18px] text-ink"
          >
            {count}
          </span>
        )}
      </button>

      {/* Native <dialog> styled as a side panel: focus trap and Esc key come for free */}
      <dialog
        ref={dialogRef}
        onClose={closeCart}
        onClick={handleDialogClick}
        aria-label="Carrito de compras"
        className="m-0 ml-auto h-dvh max-h-none w-[min(92vw,420px)] max-w-none border-0 bg-ivory p-0 text-ink backdrop:bg-black/40"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#E6DCCD] px-6 py-4">
            <h2 className="font-display text-2xl">Tu carrito ({count})</h2>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Cerrar carrito"
              className="flex size-11 items-center justify-center"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted">Tu carrito está vacío.</p>
                <a href="/products" className="mt-4 inline-block text-sm underline">
                  Ver productos
                </a>
              </div>
            ) : (
              <ul>
                {items.map((item) => (
                  <li
                    key={`${item.slug}-${item.size}`}
                    className="flex gap-4 border-b border-[#E6DCCD] py-5"
                  >
                    <div className="size-20 shrink-0 overflow-hidden border border-[#EADFC9] bg-white">
                      {item.image && (
                        <img src={item.image} alt="" loading="lazy" className="size-full object-contain" />
                      )}
                    </div>

                    <div className="flex-1">
                      <a href={`/products/${item.slug}`} className="text-base">
                        {item.name}
                      </a>
                      <p className="text-sm text-muted">Talla {item.size}</p>
                      <p className="mt-1 text-sm">{formatPrice(item.price)}</p>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center border border-[#EADFC9] bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.slug, item.size, item.quantity - 1)}
                            aria-label={`Quitar una unidad de ${item.name}`}
                            className="size-8"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.slug, item.size, item.quantity + 1)}
                            disabled={item.quantity >= MAX_QUANTITY}
                            aria-label={`Agregar una unidad de ${item.name}`}
                            className="size-8 disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.slug, item.size)}
                          aria-label={`Quitar ${item.name} del carrito`}
                          className="text-sm underline"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-[#E6DCCD] px-6 py-5">
              <div className="mb-4 flex items-center justify-between text-lg">
                <span>Total</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              {/* TODO: turn this into a link to /checkout when that page exists */}
              <button
                type="button"
                disabled
                className="w-full rounded-full bg-sun px-11 py-4 text-xs font-medium uppercase tracking-[0.22em] text-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                Finalizar compra
              </button>
              <p className="mt-2 text-center text-[13px] text-muted">
                El pago estará disponible pronto.
              </p>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}