import { useState } from 'react';

type Props = {
  images: string[];
  name: string;
};

export default function ProductGallery({ images, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="aspect-[4/5] overflow-hidden border border-b-[3px] border-[#EADFC9] border-b-sun bg-linear-to-b from-white to-[#FFF4CC]">
        <img
          src={images[activeIndex]}
          alt={`${name}, foto ${activeIndex + 1} de ${images.length}`}
          className="size-full object-contain mix-blend-multiply"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver foto ${index + 1} de ${name}`}
              aria-pressed={index === activeIndex}
              className={`size-20 overflow-hidden border bg-white transition-colors ${
                index === activeIndex
                  ? 'border-ink border-b-[3px] border-b-sun'
                  : 'border-[#EADFC9] hover:border-ink'
              }`}
            >
              <img
                src={image}
                alt=""
                loading="lazy"
                className="size-full object-contain mix-blend-multiply"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}