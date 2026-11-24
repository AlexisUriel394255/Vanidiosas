import { useState } from 'react';
import { MessageCircle, Check } from 'lucide-react';

type Props = {
  productName: string;
  sizes: string[];
  slug: string;
  price: number;
  image?: string;
};

type Feedback = { type: 'error' | 'success'; text: string };

// Read from .env at build time. Digits only, with country code (e.g. 52 + 10 digits for Mexico).
const WHATSAPP_NUMBER = import.meta.env.PUBLIC_WHATSAPP_NUMBER as string | undefined;

export default function ProductPurchase({ productName, sizes }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function selectSize(size: string) {
    setSelectedSize(size);
    setFeedback(null);
  }

  function handleWhatsApp() {
    if (!selectedSize) {
      setFeedback({ type: 'error', text: 'Selecciona tu talla para continuar.' });
      return;
    }

    if (!WHATSAPP_NUMBER) {
      setFeedback({
        type: 'error',
        text: 'El WhatsApp de la tienda no está disponible por ahora.',
      });
      return;
    }

    // The page URL lets the shop find the exact model the customer is asking about
    const message =
      `Hola, me interesa el modelo ${productName} en talla ${selectedSize}. ` +
      `${window.location.href}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
   

    window.open(url, '_blank', 'noopener,noreferrer');
    setFeedback({ type: 'success', text: 'Abriendo WhatsApp…' });
  }

  return (
    <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.22em]">
          Talla {selectedSize && <span className="text-muted">· {selectedSize}</span>}
        </p>
        <a href="/size-guide" className="text-[13px] text-muted underline hover:text-ink">
          Guía de tallas
        </a>
      </div>
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

      <div className="mt-8">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex w-full items-center justify-center gap-2 bg-sun px-9 py-4 text-xs font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:bg-[#ffd74a]"
        >
          <MessageCircle size={18} />
          Consultar por WhatsApp
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