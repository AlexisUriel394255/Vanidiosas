import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { searchProducts } from "../../utils/search";
import type { SearchItem } from "../../utils/search";
import { formatPrice } from "../../utils/format";

type Props = {
  products: SearchItem[];
};

// Inline SVG icons: no extra dependency needed in React
function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
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

export default function SearchDialog({ products }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // Derived value: recalculated on every render, so it is NOT stored in state
  const results = searchProducts(products, query);
  const hasQuery = query.trim().length > 0;

  function openDialog() {
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  // Runs when the dialog closes by any means: button, Esc key or backdrop click
  function handleClose() {
    setQuery("");
  }

  // A click on the backdrop has the dialog itself as target
  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeDialog();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  // Pressing Enter opens the first result
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (results.length > 0) {
      window.location.href = `/products/${results[0].slug}`;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Buscar"
        aria-haspopup="dialog"
        className="flex size-11 items-center justify-center"
      >
        <SearchIcon />
      </button>

      {/* Native <dialog>: focus trap, Esc key and backdrop come for free */}
      <dialog
        ref={dialogRef}
        onClose={handleClose}
        onClick={handleDialogClick}
        aria-label="Buscar modelos"
        className="mx-auto mt-[8vh] w-[min(92vw,640px)] border-0 bg-ivory p-0 text-ink backdrop:bg-black/40"
      >
        <div className="p-6">
          <form
            role="search"
            onSubmit={handleSubmit}
            className="flex items-center gap-3 border-b border-[#E6DCCD] pb-4"
          >
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={handleChange}
              placeholder="Buscar modelos..."
              aria-label="Buscar modelos"
              autoComplete="off"
              className="w-full bg-transparent text-lg outline-none"
            />
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Cerrar búsqueda"
              className="flex size-11 shrink-0 items-center justify-center"
            >
              <CloseIcon />
            </button>
          </form>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {/* Announces the result count to screen readers */}
            <p aria-live="polite" className="sr-only">
              {hasQuery ? `${results.length} resultados` : ""}
            </p>

            {!hasQuery && (
              <p className="py-6 text-center text-sm text-muted">
                Escribe el nombre de un modelo.
              </p>
            )}

            {hasQuery && results.length === 0 && (
              <p className="py-6 text-center text-sm text-muted">
                No encontramos modelos para «{query.trim()}».
              </p>
            )}

            {results.length > 0 && (
              <ul>
                {results.map((product) => (
                  <li key={product.slug}>
                    <a
                      href={`/products/${product.slug}`}
                      className="flex items-center gap-4 py-3 transition-colors hover:bg-white"
                    >
                      <div className="size-16 shrink-0 overflow-hidden border border-[#EADFC9] bg-white">
                        {product.image && (
                          <img
                            src={product.image}
                            alt=""
                            loading="lazy"
                            className="size-full object-contain"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-base">{product.name}</p>
                        <p className="text-sm text-muted">{formatPrice(product.price)}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}