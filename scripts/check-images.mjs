import { readFile, readdir } from "node:fs/promises";

const products = JSON.parse(await readFile("src/data/products.json", "utf-8"));
const folders = await readdir("public/images/products");

let broken = 0;

for (const product of products) {
  for (const imagePath of product.images) {
    const parts = imagePath.split("/");
    const fileName = parts.pop();
    const folderName = parts[3];

    let files = [];
    try {
      files = await readdir("public" + parts.join("/"));
    } catch {
      // folder not found: files stays empty
    }

    if (!folders.includes(folderName) || !files.includes(fileName)) {
      console.log(`${product.slug}: ${imagePath}`);
      broken++;
    }
  }
}

console.log(`Broken paths: ${broken}`);