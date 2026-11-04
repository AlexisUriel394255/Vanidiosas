// Minimal shape the search needs. Any item with a name can be searched
export type SearchItem = {
  slug: string;
  name: string;
  price: number;
  image?: string;
};

// Lowercase and remove accents, so "azúl" matches "azul"
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Returns the items whose name contains every word the user typed.
// TODO: replace with a call to the Spring Boot API (GET /api/products?search=...)
export function searchProducts<T extends { name: string }>(items: T[], query: string): T[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);

  // Nothing typed, nothing to search
  if (words.length === 0) return [];

  return items.filter((item) => {
    const name = normalize(item.name);
    return words.every((word) => name.includes(word));
  });
}