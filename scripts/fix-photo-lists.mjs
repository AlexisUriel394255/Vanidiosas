import { readFile, readdir, writeFile } from "node:fs/promises";

const PRODUCTS_FILE = "src/data/products.json";
const SLUGS = ["snake-cabra-metal", "6077-perlas-buck-negro", "6077-piedra-buck-negro"];

const products = JSON.parse(await readFile(PRODUCTS_FILE, "utf-8"));

for (const product of products) {
  if (!SLUGS.includes(product.slug)) continue;

  // Folder as the JSON already writes it, so the capital letters match the disk
  const folder = product.images[0].split("/").slice(0, -1).join("/");
  const files = (await readdir("public" + folder))
    .filter((file) => file.endsWith(".webp"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  product.images = files.map((file) => `${folder}/${file}`);

  // Keep the same main photo if it still exists, otherwise use the first one
  const current = product.image.split("/").pop().toLowerCase();
  const same = files.find((file) => file.toLowerCase() === current);
  product.image = same ? `${folder}/${same}` : product.images[0];
}

await writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2) + "\n");
console.log("Done.");