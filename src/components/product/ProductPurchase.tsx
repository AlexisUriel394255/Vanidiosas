import { useState } from 'react';

type Props = {
  sizes: string[];
};

export default function ProductPurchase({ sizes }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

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
            onClick={() => setSelectedSize(size)}
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
    </div>
  );
}