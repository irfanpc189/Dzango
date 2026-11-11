import fs from 'node:fs';
import path from 'node:path';
import { destinations } from '../data/destinations';
import { imageLicenses, images } from '../data/images';

const root = process.cwd();
const errors: string[] = [];
const warnings: string[] = [];
const referenced = new Set<string>();
const allowed = new Set<string>(imageLicenses);

for (const dir of ['data', 'app', 'components', 'content', 'public']) {
  const target = path.join(root, dir);
  if (!fs.existsSync(target)) continue;
  const walk = (folder: string) => fs.readdirSync(folder, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|jsx|json|css|html|md|txt|svg|ya?ml)$/i.test(entry.name) && /pinterest|pinimg\.com|i\.pinimg/i.test(fs.readFileSync(full, 'utf8'))) errors.push(`Pinterest reference found in ${path.relative(root, full)}`);
  });
  walk(target);
}

for (const [id, image] of Object.entries(images)) {
  if (image.status !== 'cleared') errors.push(`${id}: status is ${image.status}`);
  if (!allowed.has(image.license)) errors.push(`${id}: unsupported license ${image.license}`);
  if (image.license === 'ai-generated') { if (!image.creator.trim()) errors.push(`${id}: missing creator`); if (!image.generator?.trim()) errors.push(`${id}: missing generator`); if (!image.prompt?.trim()) errors.push(`${id}: missing prompt`); if (image.illustrative !== true) errors.push(`${id}: illustrative must be true`); }
  else { for (const field of ['creator', 'alt', 'licenseUrl'] as const) if (!image[field].trim()) errors.push(`${id}: missing ${field}`); if (!image.sourceUrl.trim() && image.license !== 'own') errors.push(`${id}: missing sourceUrl`); }
  if ((image.license === 'cc-by' || image.license === 'cc-by-sa') && (!image.creator.trim() || !image.sourceUrl.trim())) errors.push(`${id}: attribution requires creator and sourceUrl`);
  if (image.file.startsWith('/')) {
    if (!fs.existsSync(path.join(root, 'public', image.file.slice(1)))) errors.push(`${id}: file does not exist: ${image.file}`);
  }
}

for (const destination of destinations) for (const id of destination.images) {
  referenced.add(id);
  if (!images[id]) errors.push(`${destination.id}: unknown image id ${id}`);
}
const sourceText = ['app', 'data', 'components', 'content'].flatMap((dir) => {
  const target = path.join(root, dir);
  if (!fs.existsSync(target)) return [];
  const files: string[] = [];
  const walk = (folder: string) => fs.readdirSync(folder, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|jsx|css)$/i.test(entry.name)) files.push(fs.readFileSync(full, 'utf8'));
  });
  walk(target);
  return files;
}).join('\n');
for (const id of Object.keys(images)) if (sourceText.includes(`['${id}']`) || sourceText.includes(`['${id}']`)) referenced.add(id);
for (const id of Object.keys(images)) if (!referenced.has(id)) warnings.push(`Unreferenced image: ${id}`);

const counts = Object.fromEntries(imageLicenses.map((license) => [license, Object.values(images).filter((image) => image.license === license).length]));
console.log(`Image audit: ${Object.keys(images).length} total, ${Object.values(images).filter((image) => image.status === 'cleared').length} cleared, ${errors.length} errors, ${warnings.length} warnings`);
console.log(`By license: ${Object.entries(counts).map(([license, count]) => `${license}=${count}`).join(', ')}`);
if (errors.length) { console.error('\nErrors:\n- ' + errors.join('\n- ')); }
if (warnings.length) console.warn('\nWarnings:\n- ' + warnings.join('\n- '));
process.exitCode = errors.length ? 1 : 0;
