import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

const directory = path.resolve('.github/workflows');
const files = (await fs.readdir(directory)).filter((file) => /\.ya?ml$/i.test(file));
if (!files.length) throw new Error('No GitHub workflow files found');

for (const file of files) {
  const document = parse(await fs.readFile(path.join(directory, file), 'utf8')) as Record<string, unknown>;
  if (!document.name || !document.on || !document.jobs)
    throw new Error(`${file} must define name, on, and jobs`);
  const jobs = document.jobs as Record<string, unknown>;
  if (!Object.keys(jobs).length) throw new Error(`${file} has no jobs`);
  console.log(
    `Validated ${file} (${Object.keys(jobs).length} job${Object.keys(jobs).length === 1 ? '' : 's'}).`,
  );
}
