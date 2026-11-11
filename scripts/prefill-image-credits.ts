import fs from 'node:fs';
import path from 'node:path';

const creditsPath = path.join(process.cwd(), 'image-credits.csv');
const sourcesPath = path.join(process.cwd(), 'image-sources.csv');
const parse = (text: string) => { const rows: string[][] = []; let row: string[] = [], cell = '', quoted = false; for (let i = 0; i < text.length; i++) { const c = text[i]; if (quoted && c === '"' && text[i + 1] === '"') { cell += '"'; i++; continue; } if (c === '"') { quoted = !quoted; continue; } if (!quoted && c === ',') { row.push(cell); cell = ''; continue; } if (!quoted && (c === '\n' || c === '\r')) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; continue; } cell += c; } if (cell || row.length) { row.push(cell); rows.push(row); } return rows.filter((r) => r.some(Boolean)); };
const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
const normalize = (value: string) => value.replace(/\\/g, '/').replace(/^.*\/public\//i, '/').replace(/^\//, '/');
const sourceRows = parse(fs.readFileSync(sourcesPath, 'utf8')); const sourceHeaders = sourceRows.shift() ?? []; const fileAt = sourceHeaders.indexOf('file'); const hostAt = sourceHeaders.indexOf('host');
const sources = new Map(sourceRows.map((row) => [normalize(row[fileAt] ?? ''), row[hostAt] ?? '']));
const creditRows = parse(fs.readFileSync(creditsPath, 'utf8')); const headers = creditRows.shift() ?? []; const creditFileAt = headers.indexOf('file');
const ensure = (name: string) => { let i = headers.indexOf(name); if (i < 0) { headers.push(name); i = headers.length - 1; for (const row of creditRows) row.push(''); } return i; };
const cdnAt = ensure('unsplash_cdn_id'); const lensAt = ensure('lens_url'); const tineyeAt = ensure('tineye_url'); const notesAt = ensure('notes');
let unsplash = 0, plus = 0, other = 0, noHost = 0, unmatched = 0;
for (const row of creditRows) { const hostUrl = sources.get(normalize(row[creditFileAt] ?? '')); if (hostUrl === undefined) { unmatched++; continue; } let hostname = ''; try { hostname = new URL(hostUrl).hostname.toLowerCase(); } catch { }
  if (hostname === 'images.unsplash.com') { unsplash++; if (!row[headers.indexOf('license')]) row[headers.indexOf('license')] = 'unsplash'; const parsed = new URL(hostUrl.replace(/\0/g, '')); const clean = `${parsed.origin}${parsed.pathname}`; const match = parsed.pathname.match(/photo-\d+-[A-Za-z0-9]+/); if (!row[cdnAt]) row[cdnAt] = match?.[0] ?? ''; if (!row[lensAt]) row[lensAt] = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(clean)}`; if (!row[tineyeAt]) row[tineyeAt] = `https://tineye.com/search?url=${encodeURIComponent(clean)}`; }
  else if (hostname === 'plus.unsplash.com') { plus++; if (!row[notesAt]) row[notesAt] = 'UNSPLASH+ - not covered by free licence, replace image'; }
  else if (hostname) { other++; if (!row[notesAt]) row[notesAt] = `source unproven: ${hostname}`; }
  else { noHost++; if (!row[notesAt]) row[notesAt] = 'source unproven: empty'; }
}
fs.writeFileSync(creditsPath, [headers, ...creditRows].map((row) => row.map(quote).join(',')).join('\n') + '\n', 'utf8');
console.log(`images.unsplash.com: ${unsplash}`); console.log(`plus.unsplash.com: ${plus}`); console.log(`other hosts: ${other}`); console.log(`no host: ${noHost}`); console.log(`rows unmatched: ${unmatched}`);
