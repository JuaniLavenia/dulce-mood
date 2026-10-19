import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadCatalog, parseCsv, toProducts } from './catalog';

const HEADER = 'producto,categoria,variante,precio,disponibilidad,imagen,descripcion';
const products = (...lines: string[]) => toProducts(parseCsv([HEADER, ...lines].join('\n')));

describe('parseCsv', () => {
  it('handles quoted fields with commas, escaped quotes and CRLF', () => {
    expect(parseCsv('a,"b, c","say ""hi"""\r\n1,2,3\r\n')).toEqual([
      ['a', 'b, c', 'say "hi"'],
      ['1', '2', '3'],
    ]);
  });

  it('drops blank rows', () => {
    expect(parseCsv('a,b\n,\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });
});

describe('toProducts', () => {
  it('groups rows with the same product and category into variants, in sheet order', () => {
    const result = products(
      'Cookie de chocolate,Cookies,10 g,800,,,',
      'Trufas,Trufas,,500,,,',
      'Cookie de chocolate,Cookies,25 g,1.800,,,',
    );
    expect(result.map((p) => p.name)).toEqual(['Cookie de chocolate', 'Trufas']);
    expect(result[0].variants).toEqual([
      { label: '10 g', price: 800, availability: 'available' },
      { label: '25 g', price: 1800, availability: 'available' },
    ]);
  });

  it('keeps products with the same name in different categories apart', () => {
    const result = products('Trufas,Trufas,1 unidad,500,,,', 'Trufas,Packs,Caja x9,4.000,,,');
    expect(result.map((p) => p.category)).toEqual(['Trufas', 'Packs']);
  });

  it('matches product names ignoring case and surrounding spaces', () => {
    const result = products('Budín de limón,Budines,Chico,5000,,,', ' budín de LIMÓN ,Budines,Grande,9000,,,');
    expect(result).toHaveLength(1);
    expect(result[0].variants).toHaveLength(2);
  });

  it('maps availability, defaulting to available', () => {
    const result = products(
      'A,X,1,1,Disponible,,',
      'A,X,2,1,Por encargo,,',
      'A,X,3,1,encargo,,',
      'A,X,4,1,Agotado,,',
      'A,X,5,1,sin stock,,',
      'A,X,6,1,,,',
    );
    expect(result[0].variants.map((v) => v.availability)).toEqual([
      'available',
      'on-order',
      'on-order',
      'sold-out',
      'sold-out',
      'available',
    ]);
  });

  it('parses Argentine price formats and leaves empty prices at 0 (to quote)', () => {
    const result = products('A,X,1,$ 12.500,,,', 'A,X,2,"1.250,50",,,', 'A,X,3,,,,');
    expect(result[0].variants.map((v) => v.price)).toEqual([12500, 1250.5, 0]);
  });

  it('takes image and description from the first row that has them', () => {
    const result = products('A,X,1,1,,,', 'A,X,2,1,,https://img/a.jpg,Rico', 'A,X,3,1,,https://img/b.jpg,Otro');
    expect(result[0]).toMatchObject({ image: 'https://img/a.jpg', description: 'Rico' });
  });

  it('skips rows without a product name and defaults the category', () => {
    const result = products(',Cookies,10 g,800,,,', 'Alfajor,,,900,,,');
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Otros');
  });

  it('accepts headers in any order and case', () => {
    const result = toProducts(parseCsv('Precio,PRODUCTO,Categoria\n700,Magdalena,Magdalenas'));
    expect(result[0]).toMatchObject({ name: 'Magdalena', category: 'Magdalenas' });
    expect(result[0].variants).toEqual([{ label: '', price: 700, availability: 'available' }]);
  });

  it('gives each product a stable, unique id', () => {
    const result = products('Caja de trufas,Packs,x9,1,,,', 'Caja de trufas,Trufas,x9,1,,,');
    expect(result.map((p) => p.id)).toEqual(['packs-caja-de-trufas', 'trufas-caja-de-trufas']);
  });
});

describe('loadCatalog', () => {
  const fallback = `${HEADER}\nEjemplo,Cookies,10 g,800,,,`;

  afterEach(() => vi.unstubAllGlobals());

  it('uses the local fallback when no sheet is configured', async () => {
    expect((await loadCatalog(undefined, fallback))[0].name).toBe('Ejemplo');
  });

  it('reads the published sheet when configured', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(`${HEADER}\nReal,Cookies,10 g,800,,,`)));
    expect((await loadCatalog('https://sheet.csv', fallback))[0].name).toBe('Real');
  });

  // Showing sample products on the live site is worse than keeping the previous deploy.
  it('fails instead of falling back when the configured sheet is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
    await expect(loadCatalog('https://sheet.csv', fallback)).rejects.toThrow('HTTP 404');
  });

  it('fails when the configured sheet has no products', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(HEADER)));
    await expect(loadCatalog('https://sheet.csv', fallback)).rejects.toThrow('no products');
  });
});
