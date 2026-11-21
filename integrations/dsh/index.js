import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const name = 'postgraduate-english-i';
export const inject = ['skills', 'webServer'];

const root = fileURLToPath(new URL('../../', import.meta.url));
const skillDir = join(root, 'skills', 'micro-reading');
const unitsDir = join(root, 'data', 'units');

/** Read every unit JSON, sorted by file name. */
function readUnits() {
  return readdirSync(unitsDir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => JSON.parse(readFileSync(join(unitsDir, file), 'utf8')));
}

export function apply(ctx) {
  const path = join(skillDir, 'SKILL.md');
  const raw = readFileSync(path, 'utf8');
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/u);
  if (!match) throw new Error('micro-reading SKILL.md frontmatter missing');
  const name = match[1].match(/^name:\s*(.+)$/mu)?.[1]?.trim();
  const description = match[1].match(/^description:\s*(.+)$/mu)?.[1]?.trim();
  if (!name || !description) throw new Error('micro-reading SKILL.md frontmatter incomplete');
  const content = [
    `Postgraduate-English-I unit directory (absolute path): ${unitsDir}`,
    'Each unit is one JSON file (passage + vocab + quiz). Read it with the file-read tool.',
    '',
    match[2].trim(),
  ].join('\n');
  ctx.effect(() => ctx.skills.register({
    name, description, content, path,
    source: 'bundled',
    resourceBase: { kind: 'directory', path: skillDir },
  }));

  // Serve the unit data to the browser card. The Web GUI is same-origin, so the
  // client fetches this path for the passage + quiz it pins above the composer.
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/postgraduate-english-i/units',
    resource: async () => new Response(JSON.stringify({ units: readUnits() }), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    }),
  }));
}
