/**
 * Fix behavioral data context strings
 * Converts category-only contexts into proper descriptive sentences
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '../data/cultural/behavioral');

for (const file of readdirSync(DIR).filter(f => f.endsWith('.json'))) {
  const path = join(DIR, file);
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  const pts = data.dataPoints || [];
  let fixed = 0;

  for (const p of pts) {
    // If context is just a category name (no spaces or very short), rebuild it
    const isCategory = !p.context.includes(' was ') && !p.context.includes(' in ') && !p.context.includes('%') && p.context.length < 80;

    if (isCategory && p.metric && p.value !== undefined) {
      const metricLabel = p.metric.replace(/_/g, ' ');
      const unit = p.unit && p.unit !== 'number' ? ` ${p.unit}` : '';
      const yearStr = p.year ? ` in ${p.year}` : '';
      const sourceStr = p.source ? `. Source: ${p.source}` : '';
      p.context = `${p.country} ${metricLabel}${yearStr} was ${p.value}${unit}${sourceStr}.`;
      fixed++;
    }
  }

  if (fixed > 0) {
    writeFileSync(path, JSON.stringify(data, null, 2));
    console.log(`${file}: fixed ${fixed}/${pts.length} contexts`);
  } else {
    console.log(`${file}: all contexts OK`);
  }
}
