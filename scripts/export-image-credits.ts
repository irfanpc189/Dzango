import fs from 'node:fs';
import path from 'node:path';
import { images } from '../data/images';

const headers = ['id', 'file', 'guessed_source', 'guessed_creator', 'guessed_source_url', 'license', 'creator', 'sourceUrl', 'licenseUrl', 'alt', 'verified', 'unsplash_cdn_id', 'lens_url', 'tineye_url', 'notes'];
const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
function guess(file: string) {
  const name = path.basename(file);
  const unsplash = name.match(/^(.+)-([A-Za-z0-9]+)-unsplash\.[^.]+$/i);
  if (unsplash) return ['unsplash', unsplash[1], `https://unsplash.com/photos/${unsplash[2]}`];
  const pexels = name.match(/^pexels-(.+)-([0-9]+)\.[^.]+$/i);
  if (pexels) return ['pexels', pexels[1], `https://www.pexels.com/photo/${pexels[2]}/`];
  if (/^.+-[0-9]+\.[^.]+$/i.test(name)) return ['pixabay?', '', ''];
  return ['', '', ''];
}
const existingPath = path.join(process.cwd(), 'image-credits.csv');
const existing = fs.existsSync(existingPath) ? parseExisting(fs.readFileSync(existingPath, 'utf8')) : new Map<string, string[]>();
const rows = Object.entries(images).map(([id, image]) => { const [source, creator, sourceUrl] = guess(image.file); const prior = existing.get(id) ?? []; return [id, image.file, source, creator, sourceUrl, prior[5] || image.license || '', prior[6] || image.creator || '', prior[7] || image.sourceUrl || '', prior[8] || image.licenseUrl || '', prior[9] || image.alt, prior[10] || '', prior[11] || '', prior[12] || '', prior[13] || '', prior[14] || '']; });
const output = path.join(process.cwd(), 'image-credits.csv');
fs.writeFileSync(output, [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n') + '\n', 'utf8');
console.log(`Wrote ${rows.length} rows to ${output}`);
console.log(`Filename-based guesses: ${rows.filter((row) => row[2]).length}`);

function parseExisting(text: string) { const rows: string[][] = []; let row: string[] = [], cell = '', quoted = false; for (let i = 0; i < text.length; i++) { const c = text[i]; if (quoted && c === '"' && text[i + 1] === '"') { cell += '"'; i++; continue; } if (c === '"') { quoted = !quoted; continue; } if (!quoted && c === ',') { row.push(cell); cell = ''; continue; } if (!quoted && (c === '\n' || c === '\r')) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; continue; } cell += c; } const map = new Map<string, string[]>(); for (const r of rows.slice(1)) if (r[0]) map.set(r[0], r); return map; }
