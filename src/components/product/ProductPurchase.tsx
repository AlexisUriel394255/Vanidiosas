import { useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';
import { MAX_QUANTITY, addToCart, openCart } from '../../stores/cart';

type Props = {
  productName: string;
  sizes: string[];
  slug: string;
  price: number;
  image?: string;
};

type Feedback = { type: 'error' | 'success'; text: string };

export default function ProductPurchase({ productName, sizes, slug, price, image }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function selectSize(size: string) {
    setSelectedSize(size);
    setFeedback(null);
  }

  // Validates the size and adds the selection to the shared cart.
  // Returns true when the product was added
  function addSelectionToCart(): boolean {
    if (!selectedSize) {
      setFeedback({ type: 'error', text: 'Selecciona tu talla para continuar.' });
      return false;
    }

    // Inside this `if` check, TypeScript knows selectedSize is a string
    addToCart({ slug, name: productName, price, image, size: selectedSize }, quantity);
    return true;
  }

  function handleAddToCart() {
    if (!addSelectionToCart()) return;

    setFeedback({
      type: 'success',
      text: `${quantity} × ${productName}, talla ${selectedSize}, añadido al carrito.`,
    });
    // Reset so the next click does not add the same amount again by accident
    setQuantity(1);
    openCart();
  }

  function handleBuyNow() {
    if (!addSelectionToCart()) return;

    // TODO: redirect to /checkout when that page exists
    setFeedback(null);
    setQuantity(1);
    openCart();
  }

  return (
    <div className="mt-8">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em]">
        Talla {selectedSize && <span className="text-muted">· {selectedSize}</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => selectSize(size)}
            aria-pressed={selectedSize === size}
            className={`size-12 border text-sm transition-colors ${
              selectedSize === size
                ? 'border-ink bg-sun font-medium text-ink'
                : 'border-[#D9CBA8] bg-white hover:border-ink'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em]">Cantidad</p>
        <div className="inline-flex items-center border border-[#D9CBA8] bg-white">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-12 items-center justify-center transition-colors hover:bg-[#FFF4CC]"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center" aria-live="polite">{quantity}</span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            className="flex size-12 items-center justify-center transition-colors hover:bg-[#FFF4CC]"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full bg-sun px-9 py-4 text-xs font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:bg-[#ffd74a]"
        >
          Añadir al carrito
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full bg-ink px-9 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#2a2622]"
        >
          Comprar ahora
        </button>
      </div>

      {feedback && (
        <p
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`mt-4 flex items-center gap-2 text-sm ${
            feedback.type === 'error' ? 'text-red-700' : 'text-ink'
          }`}
        >
          {feedback.type === 'success' && <Check size={18} className="text-sun-deep" />}
          {feedback.text}
        </p>
      )}
    </div>
  );
}