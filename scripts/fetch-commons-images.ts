import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

type Request = { destinationId: string; query: string; count: number };
type Page = { title: string; pageid: number; imageinfo?: Array<Record<string, any>> };
type Rejected = { query: string; title: string; rule: string };

const root = process.cwd();
const requests = JSON.parse(fs.readFileSync(path.join(root, 'data/image-requests.json'), 'utf8')) as Request[];
const registryPath = path.join(root, 'data/images.ts');
let registry = fs.readFileSync(registryPath, 'utf8');
const csvPath = path.join(root, 'image-credits.csv');
const fetched: string[] = [];
const rejected: Rejected[] = [];
const contactEmail = process.env.COMMONS_CONTACT_EMAIL;
const contactUrl = process.env.COMMONS_CONTACT_URL ?? 'https://example.invalid/dzonga';
if (!contactEmail) throw new Error('COMMONS_CONTACT_EMAIL is required; no Wikimedia requests were made.');
const headers = { 'User-Agent': `DZONGA-image-fetcher/0.1 (${contactUrl}; contact: ${contactEmail}) node-fetch` };
const cacheDir = path.join(root, '.cache', 'commons'); fs.mkdirSync(cacheDir, { recursive: true });
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;
const maxRequestsArg = args.includes('--max-requests') ? Number(args[args.indexOf('--max-requests') + 1]) : 30;
let requestsMade = 0;
let lastRequestAt = 0;
let lastDownloadAt = 0;
const clean = (v: string) => v.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const slug = (v: string) => v.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const csv = (v: string) => `"${v.replace(/"/g, '""')}"`;

function licence(v: string): [string, string] | null {
  const x = v.toLowerCase();
  if (x.includes('cc0')) return ['cc0', 'https://creativecommons.org/publicdomain/zero/1.0/'];
  if (x.includes('public domain')) return ['public-domain', 'https://creativecommons.org/publicdomain/'];
  if (x.includes('cc by-sa')) return ['cc-by-sa', 'https://creativecommons.org/licenses/by-sa/4.0/'];
  if (x.includes('cc by')) return ['cc-by', 'https://creativecommons.org/licenses/by/4.0/'];
  return null;
}
async function getWithRetry(url: string, cacheKey?: string, download = false): Promise<Response | null> {
  const cachePath = cacheKey ? path.join(cacheDir, `${crypto.createHash('sha256').update(cacheKey).digest('hex')}.json`) : undefined;
  if (cachePath && fs.existsSync(cachePath)) return new Response(fs.readFileSync(cachePath));
  let last = '';
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const interval = download ? 2000 : 1500;
    const previous = download ? lastDownloadAt : lastRequestAt;
    const wait = interval - (Date.now() - previous); if (wait > 0) await sleep(wait);
    if (download) lastDownloadAt = Date.now();
    lastRequestAt = Date.now(); requestsMade += 1;
    try { const r = await fetch(url, { headers });
      if (r.ok) { if (cachePath) fs.writeFileSync(cachePath, Buffer.from(await r.clone().arrayBuffer())); return r; }
      if (r.status === 429 || r.status === 503) { const retry = Math.max(60000, Number(r.headers.get('retry-after') ?? 60) * 1000); if (attempt < 3) await sleep(retry); else throw new Error('Rate limited by Wikimedia; wait at least an hour before retrying'); }
      last = `HTTP ${r.status} ${r.statusText}`;
    }
    catch (e) { last = e instanceof Error ? e.message : String(e); }
    if (requestsMade >= maxRequestsArg) throw new Error(`Reached --max-requests limit (${maxRequestsArg})`);
  }
  console.error(`Download failed: ${last}`); return null;
}
function addFile(file: string) {
  const s = registry.indexOf('export const localFiles = ['), e = registry.indexOf('] as const;', s);
  if (s < 0 || e < 0) throw new Error('localFiles block not found');
  const before = registry.slice(0, e).trimEnd(); registry = `${before}${before.endsWith(',') ? '' : ','}\n  ${JSON.stringify(file)},\n${registry.slice(e)}`;
}
function addOverride(id: string, record: Record<string, string>) {
  const at = registry.indexOf('export const images:');
  if (at < 0) throw new Error('images export not found');
  registry = `${registry.slice(0, at)}imageOverrides[${JSON.stringify(id)}] = ${JSON.stringify(record)};\n\n${registry.slice(at)}`;
}
function addCsv(id: string, file: string, license: string, creator: string, sourceUrl: string, note: string) {
  if (!fs.existsSync(csvPath)) return;
  const current = fs.readFileSync(csvPath, 'utf8'); if (current.split(/\r?\n/).some((x) => x.startsWith(csv(id) + ','))) return;
  const row = [id, `/destination/${file}`, '', '', '', license, creator, sourceUrl, '', '', '', '', '', '', note].map(csv).join(',');
  fs.appendFileSync(csvPath, `${current.endsWith('\n') ? '' : '\n'}${row}\n`);
}
async function main() {
  for (const request of requests.filter((item) => !only || item.query === only)) {
    const api = new URL('https://commons.wikimedia.org/w/api.php');
    api.search = new URLSearchParams({ action: 'query', format: 'json', generator: 'search', gsrsearch: request.query, gsrnamespace: '6', gsrlimit: String(Math.max(request.count * 4, 12)), prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '2400' }).toString();
    const apiResponse = await getWithRetry(api.toString(), api.toString()); if (!apiResponse) continue;
    const data = await apiResponse.json() as { query?: { pages?: Record<string, Page> } }; let accepted = 0;
    for (const page of Object.values(data.query?.pages ?? {})) {
      if (accepted >= request.count) break;
      const info = page.imageinfo?.[0]; if (!info) { rejected.push({ query: request.query, title: page.title, rule: 'missing image metadata' }); continue; }
      const meta = info.extmetadata ?? {}; const mime = String(info.mime ?? '');
      const short = clean(String(meta.LicenseShortName?.value ?? '')); const lic = licence(short); const width = Number(info?.width ?? 0);
      const artist = clean(String(meta.Artist?.value ?? '')); const description = clean(String(meta.ImageDescription?.value ?? meta.ObjectName?.value ?? ''));
      const source = `https://commons.wikimedia.org/wiki/${page.title.replace(/ /g, '_')}`;
      if (!/^image\/(jpeg|png|webp)$/i.test(mime)) { rejected.push({ query: request.query, title: page.title, rule: 'mime' }); continue; }
      if (width < 1600) { rejected.push({ query: request.query, title: page.title, rule: 'width < 1600px' }); continue; }
      if (!lic || /\b(nc|nd|non-free|fair use)\b/i.test(short)) { rejected.push({ query: request.query, title: page.title, rule: 'licence' }); continue; }
      if (!description) { rejected.push({ query: request.query, title: page.title, rule: 'missing description' }); continue; }
      if (registry.includes(source)) { rejected.push({ query: request.query, title: page.title, rule: 'already present' }); continue; }
      const ext = mime.toLowerCase() === 'image/png' ? '.png' : mime.toLowerCase() === 'image/webp' ? '.webp' : '.jpg';
      const id = `${request.destinationId}-${slug(page.title.replace(/^File:/i, ''))}-${page.pageid}`; const relative = `${request.destinationId}/${slug(page.title.replace(/^File:/i, ''))}-${page.pageid}${ext}`;
      let image = await getWithRetry(String(info.url), `image:${info.url}`, true); let note = '';
      if (!image && info.thumburl) { image = await getWithRetry(String(info.thumburl), `image:${info.thumburl}`, true); note = image ? '2400px thumbnail used' : ''; }
      if (!image) { rejected.push({ query: request.query, title: page.title, rule: 'download error (original and thumbnail)' }); continue; }
      const target = path.join(root, 'public', 'destination', relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, Buffer.from(await image.arrayBuffer()));
      addFile(relative); const creator = /flickr account|own work|unknown/i.test(artist) ? '' : artist; const csvNote = [note, !creator ? source : ''].filter(Boolean).join('; ');
      addOverride(id, { alt: description.slice(0, 240), creator, license: lic[0], licenseUrl: lic[1], sourceUrl: source, status: 'placeholder' }); addCsv(id, relative, lic[0], creator, source, csvNote);
      fetched.push(`${id}\t${creator || '(blank; inspect Commons author)'}\t${lic[0]}\t${source}${csvNote ? `\t${csvNote}` : ''}`); accepted += 1; await sleep(1000);
    }
  }
  fs.writeFileSync(registryPath, registry, 'utf8'); console.log('\nFETCHED\n' + (fetched.join('\n') || '(none)')); console.log('\nREJECTED'); console.table(rejected); console.log(`Summary: fetched ${fetched.length}, rejected ${rejected.length}`);
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
