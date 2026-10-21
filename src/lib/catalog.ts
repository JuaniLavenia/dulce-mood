// Reads the catalog from a Google Sheet published as CSV
// (File > Share > Publish to web > CSV). Falls back to a local CSV so the
// site still builds when the sheet is not configured or unreachable.
//
// Each sheet row is one variant (e.g. "Cookie de chocolate" / "25 g").
// Rows sharing product name and category are grouped into a single product.

export type Availability = 'available' | 'on-order' | 'sold-out';

export interface Variant {
  label: string;
  // 0 means "to quote": the price is agreed over WhatsApp.
  price: number;
  availability: Availability;
  // The variant's own cells, or the product's when left empty.
  image: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  variants: Variant[];
}

// Minimal RFC 4180 parser: handles quoted fields, escaped quotes and commas inside quotes.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

// Expected headers (Spanish, as the shop owner sees them in the sheet).
const COLUMNS = {
  name: 'producto',
  category: 'categoria',
  variant: 'variante',
  price: 'precio',
  availability: 'disponibilidad',
  image: 'imagen',
  description: 'descripcion',
} as const;

const plain = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

const slug = (value: string) => plain(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const toPrice = (value: string) => {
  // Accepts "12.500", "$ 12500" or "1.250,50" as written by Argentine users.
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toAvailability = (value: string): Availability => {
  const text = plain(value);
  if (text.includes('encargo')) return 'on-order';
  if (text.includes('agotado') || text.includes('sin stock')) return 'sold-out';
  return 'available';
};

export function toProducts(rows: string[][]): Product[] {
  const [header, ...body] = rows;
  if (!header) return [];
  const cols = Object.fromEntries(
    Object.entries(COLUMNS).map(([key, column]) => [key, header.findIndex((h) => plain(h) === column)]),
  ) as Record<keyof typeof COLUMNS, number>;
  const cell = (row: string[], i: number) => (i >= 0 ? (row[i] ?? '').trim() : '');

  const products = new Map<string, Product>();
  for (const row of body) {
    const name = cell(row, cols.name);
    if (!name) continue;
    const category = cell(row, cols.category) || 'Otros';
    const key = `${plain(category)}|${plain(name).replace(/\s+/g, ' ')}`;

    let product = products.get(key);
    if (!product) {
      product = { id: slug(`${category} ${name}`), name, category, description: '', image: '', variants: [] };
      products.set(key, product);
    }
    const description = cell(row, cols.description);
    const image = cell(row, cols.image);
    product.description ||= description;
    product.image ||= image;
    product.variants.push({
      label: cell(row, cols.variant),
      price: toPrice(cell(row, cols.price)),
      availability: toAvailability(cell(row, cols.availability)),
      image,
      description,
    });
  }
  // Fill empty variant cells once the product values are known, since they may
  // come from a later row.
  for (const product of products.values()) {
    for (const variant of product.variants) {
      variant.image ||= product.image;
      variant.description ||= product.description;
    }
  }
  return [...products.values()];
}

// Without a sheet URL (local development) the sample CSV is used. With one, any
// problem fails the build on purpose: the host then keeps serving the previous
// deploy instead of publishing sample or empty data.
export async function loadCatalog(sheetUrl: string | undefined, fallbackCsv: string) {
  if (!sheetUrl) return toProducts(parseCsv(fallbackCsv));

  const response = await fetch(sheetUrl);
  if (!response.ok) throw new Error(`[catalog] Could not load the sheet: HTTP ${response.status}`);
  const products = toProducts(parseCsv(await response.text()));
  if (products.length === 0) throw new Error('[catalog] The sheet has no products; check the column headers.');
  return products;
}
