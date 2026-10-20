import { useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';

type Props = {
  productName: string;
  sizes: string[];
};

type Feedback = { type: 'error' | 'success'; text: string };

export default function ProductPurchase({ productName, sizes }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function selectSize(size: string) {
    setSelectedSize(size);
    setFeedback(null);
  }

  function hasSize(): boolean {
    if (!selectedSize) {
      setFeedback({ type: 'error', text: 'Selecciona tu talla para continuar.' });
      return false;
    }
    return true;
  }

  function handleAddToCart() {
    if (!hasSize()) return;
    setFeedback({
      type: 'success',
      text: `${quantity} × ${productName}, talla ${selectedSize}, añadido al carrito.`,
    });
  }

  function handleBuyNow() {
    if (!hasSize()) return;
    setFeedback({ type: 'success', text: 'Demo: aquí se continuaría al pago.' });
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
                ? 'border-ink bg-ink text-ivory'
                : 'border-[#E6DCCD] bg-white hover:border-ink'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em]">Cantidad</p>
        <div className="inline-flex items-center border border-[#E6DCCD] bg-white">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-12 items-center justify-center transition-colors hover:bg-[#F6EBD3]"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center" aria-live="polite">{quantity}</span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="flex size-12 items-center justify-center transition-colors hover:bg-[#F6EBD3]"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full bg-champagne px-9 py-4 text-xs font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:bg-[#d8b87f]"
        >
          Añadir al carrito
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full bg-ink px-9 py-4 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-wine"
        >
          Comprar ahora
        </button>
      </div>

      {feedback && (
        <p
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`mt-4 flex items-center gap-2 text-sm ${
            feedback.type === 'error' ? 'text-wine' : 'text-ink'
          }`}
        >
          {feedback.type === 'success' && <Check size={18} className="text-gold-deep" />}
          {feedback.text}
        </p>
      )}
    </div>
  );
}