import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

// ---------- SETTINGS: edit this part ----------
// Folder that holds one subfolder per model (inside "public")
const IMAGES_ROOT = "public/images";
const PRODUCTS_FILE = "src/data/products.json";
const DEFAULT_PRICE = 1599;
// Folders to skip, relative to IMAGES_ROOT (for example brand images)
const IGNORE_FOLDERS = [];

// One line per model. The key can be the model code ("10127") or the folder slug.
// category: "sandalias", "zapatillas" or "balerinas". "price" is optional
const MODELS = {
  "6077": { category: "sandalias" },
  "10110": { category: "sandalias" },
  "10127": { category: "zapatillas" },
  "10161": { category: "zapatillas" },
  "10164": { category: "zapatillas" },
  "10188": { category: "zapatillas" },
  "10453": { category: "sandalias" },
  "10575": { category: "sandalias" },
  "10596": { category: "sandalias" },
  
  // "6077": { category: "sandalias" }, // only if it is a NEW model
};
// ----------------------------------------------

// Without --write the script only previews and changes nothing
const shouldWrite = process.argv.includes("--write");

// "Buck Negro/Espejo" -> "buck-negro-espejo"
function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// "cabra maquillaje" -> "Cabra Maquillaje"
function toTitleCase(text) {
  return text.replace(/(^|\s)(\w)/g, (_, space, char) => space + char.toUpperCase());
}

// Turns a disk path into the public URL path: "public/images/a" -> "/images/a"
function toPublicPath(diskPath) {
  return "/" + path.relative("public", path.resolve(diskPath)).split(path.sep).join("/");
}

const products = JSON.parse(await readFile(PRODUCTS_FILE, "utf-8"));
const usedSlugs = new Set(products.map((product) => product.slug));

// 1) Folders already used by a product
const usedFolders = new Set();
for (const product of products) {
  for (const imagePath of [product.image, ...(product.images ?? [])]) {
    if (imagePath) usedFolders.add(path.posix.dirname(imagePath.replace(/\\/g, "/")));
  }
}

// 2) Every folder that contains .webp files
const rootPublicPath = toPublicPath(IMAGES_ROOT);
const entries = await readdir(IMAGES_ROOT, { recursive: true, withFileTypes: true });
const folders = new Map();

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".webp")) continue;

  const folder = toPublicPath(entry.parentPath);
  if (!folders.has(folder)) folders.set(folder, []);
  folders.get(folder).push(entry.name);
}

// 3) Keep only the folders that no product uses yet
const candidates = [];
for (const [folder, files] of folders) {
  const relative = path.posix.relative(rootPublicPath, folder);
  if (relative === "" || IGNORE_FOLDERS.includes(relative)) continue;
  if (usedFolders.has(folder)) continue;

  const folderName = path.posix.basename(folder);
  const slug = slugify(folderName);
  const codeMatch = slug.match(/^(\d+)(?:-|$)/);
  const code = codeMatch ? codeMatch[1] : "";
  const words = slug.split("-").filter((word) => word && word !== code);

  candidates.push({
    folder,
    folderName,
    slug,
    code,
    name: [code, toTitleCase(words.join(" "))].filter(Boolean).join(" "),
    files: files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
  });
}

if (candidates.length === 0) {
  console.log("No new folders: every folder with images is already used by a product.");
  process.exit(0);
}

// 4) Stop if a model has no category yet, and print the lines to add
const findModel = (item) => MODELS[item.slug] ?? MODELS[item.code];
const missing = candidates.filter((item) => !findModel(item));

if (missing.length > 0) {
  console.error("Add these lines to MODELS (choose the right category) and run again:\n");
  const printed = new Set();
  for (const item of missing) {
    const key = item.code || item.slug;
    if (printed.has(key)) continue;
    printed.add(key);
    console.error(`  "${key}": { category: "sandalias" },   // e.g. ${item.folderName}`);
  }
  process.exit(1);
}

// 5) Build the new products, using the last product as the template for the other fields
const template = products[products.length - 1] ?? {};
const newProducts = [];

for (const item of candidates) {
  if (usedSlugs.has(item.slug)) {
    console.warn(`skip (slug already exists): ${item.slug}`);
    continue;
  }

  if (/[A-Z\s]/.test(item.folderName) || item.files.some((file) => /[A-Z\s]/.test(file))) {
    console.warn(`warning: ${item.folder} has uppercase letters or spaces. Rename it: servers are case sensitive`);
  }

  const model = findModel(item);
  const images = item.files.map((file) => `${item.folder}/${file}`);

  const product = {
    ...template,
    slug: item.slug,
    sku: item.code,
    name: item.name,
    price: model.price ?? DEFAULT_PRICE,
    category: model.category,
    description: "",
    image: images[0],
    images,
    rating: 0,
    reviewCount: 0,
  };

  // These flags must be chosen on purpose, never copied from the template
  delete product.bestSeller;
  delete product.isNew;
  if (!item.code) delete product.sku;

  newProducts.push(product);
  console.log(`${shouldWrite ? "added" : "would add"}: ${item.slug} (${images.length} photos, ${model.category})`);
}

// 6) Write only when --write is used
if (shouldWrite) {
  await writeFile(PRODUCTS_FILE, JSON.stringify([...products, ...newProducts], null, 2) + "\n");
  console.log(`\nDone: ${newProducts.length} products added.`);
} else {
  console.log(`\nPreview only (${newProducts.length} products). Run "npm run products:add" to save them.`);
}