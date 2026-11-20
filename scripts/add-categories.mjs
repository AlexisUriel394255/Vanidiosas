import { readFile, writeFile } from "node:fs/promises";

const PRODUCTS_FILE = "src/data/products.json";

const products = JSON.parse(await readFile(PRODUCTS_FILE, "utf-8"));

const CATEGORY_BY_SKU = {
  "6077": "sandalias",
  "6130": "sandalias",
  "6195": "sandalias",
  "6284": "sandalias",
  "6291": "sandalias",
  "6295": "sandalias",
  "6296": "sandalias",
  "6297": "sandalias",
  "10161": "zapatillas",
};

for (const product of products) {
  if (product.category) continue;

  const category = CATEGORY_BY_SKU[product.sku];
  if (!category) {
    console.warn(`no category for: ${product.slug} (sku ${product.sku})`);
    continue;
  }

  product.category = category;
}

await writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2) + "\n");
console.log("Done.");