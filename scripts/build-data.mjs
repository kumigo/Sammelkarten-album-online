// Lädt die öffentlichen Cardmarket-Dateien für Pokémon und schreibt kompakte Versionen nach data/.
import { mkdir, writeFile, readFile } from "node:fs/promises";

const BASE = "https://downloads.s3.cardmarket.com/productCatalog";
const SOURCES = {
  products: `${BASE}/productList/products_singles_6.json`,
  prices: `${BASE}/priceGuide/price_guide_6.json`,
};

async function load(name) {
  // Lokale Datei als Alternative (z. B. zum Testen): node build-data.mjs <produkte.json> <preise.json>
  const local = name === "products" ? process.argv[2] : process.argv[3];
  if (local) return JSON.parse(await readFile(local, "utf8"));
  const res = await fetch(SOURCES[name], { headers: { "user-agent": "pokemon-sammelbuch-preisupdate" } });
  if (!res.ok) throw new Error(`${SOURCES[name]} -> HTTP ${res.status}`);
  return res.json();
}

const products = await load("products");
const prices = await load("prices");
if (!products.products?.length || !prices.priceGuides?.length) throw new Error("Cardmarket-Dateien sind leer oder haben ein unbekanntes Format");

const ids = new Set(products.products.map(p => p.idProduct));
const r2 = v => (v == null ? null : Math.round(v * 100) / 100);

const katalog = {
  date: products.createdAt,
  rows: products.products.map(p => [p.idProduct, p.name, p.idExpansion, p.idMetacard]),
};
const preise = {
  date: prices.createdAt,
  rows: prices.priceGuides
    .filter(p => ids.has(p.idProduct))
    .map(p => [p.idProduct, r2(p.trend), r2(p.avg), r2(p.low), r2(p.avg30), r2(p["trend-holo"]), r2(p["low-holo"]), r2(p["avg30-holo"])]),
};

// Pokémon-Namen Deutsch/Englisch für die Texterkennung (Cardmarket führt nur englische Namen).
async function loadNames() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const lines = (await res.text()).trim().split("\n").slice(1);
    const byId = new Map();
    for (const line of lines) {
      const [id, lang, name] = line.split(",");
      if (lang !== "6" && lang !== "9") continue;
      const e = byId.get(id) || {};
      e[lang === "6" ? "de" : "en"] = name;
      byId.set(id, e);
    }
    return [...byId.values()].filter(e => e.en).map(e => [e.de || e.en, e.en]);
  } catch (err) {
    console.warn("Namensliste nicht geladen:", err.message);
    return [];
  }
}
const namen = await loadNames();

await mkdir("data", { recursive: true });
await writeFile("data/namen.json", JSON.stringify(namen));
await writeFile("data/katalog.json", JSON.stringify(katalog));
await writeFile("data/preise.json", JSON.stringify(preise));
console.log(`Namen: ${namen.length}, Katalog: ${katalog.rows.length} Karten (${katalog.date}), Preise: ${preise.rows.length} (${preise.date})`);
