import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseCsv } from './catalog';

// Apps Script files have no module system, so evaluate the source and pick the pure helper.
const source = readFileSync(new URL('../../apps-script/Code.js', import.meta.url), 'utf8');
const { toCsv } = new Function(`${source}; return { toCsv };`)() as { toCsv: (rows: string[][]) => string };

describe('Apps Script toCsv', () => {
  it('produces CSV that the site parser reads back unchanged', () => {
    const rows = [
      ['producto', 'precio', 'descripcion'],
      ['Caja de trufas', '1.500', 'Surtidas, en caja "de regalo"'],
      ['Budín', '9.500', 'Dos líneas\ncon salto'],
    ];
    expect(parseCsv(toCsv(rows))).toEqual(rows);
  });
});
