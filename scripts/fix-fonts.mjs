#!/usr/bin/env node
/**
 * fix-fonts.mjs
 *
 * Bumps tiny Tailwind font-size classes across `app/` and `components/` so the
 * UI is legible on small mobile screens (e.g. 375px wide).
 *
 * Mapping:
 *   text-[8px]  -> text-[11px]
 *   text-[9px]  -> text-[11px]
 *   text-[10px] -> text-xs
 *   text-[11px] -> text-[13px]
 *   text-[12px] -> text-sm
 *
 * The same mapping is applied to responsive variants (sm:/md:/lg:/xl:) so a
 * breakpoint never renders a *smaller* size than its base (which would happen
 * if only the bare class were bumped).
 *
 * Usage:
 *   node scripts/fix-fonts.mjs            # apply changes
 *   node scripts/fix-fonts.mjs --dry-run  # report only
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const DIRS = ['app', 'components']
const EXT = new Set(['.tsx', '.ts', '.jsx', '.js'])

const MAP = {
  8: 'text-[11px]',
  9: 'text-[11px]',
  10: 'text-xs',
  11: 'text-[13px]',
  12: 'text-sm',
}

// Match `text-[Npx]`, optionally prefixed by a responsive variant.
const RE = /(?:\b(?:sm|md|lg|xl):)?text-\[(8|9|10|11|12)px\]/g

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const s = statSync(full)
    if (s.isDirectory()) walk(full, out)
    else if (EXT.has(extname(full))) out.push(full)
  }
  return out
}

const dryRun = process.argv.includes('--dry-run')

let totalChanges = 0
for (const dir of DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const src = readFileSync(file, 'utf8')
    let changes = 0
    const out = src.replace(RE, (match, n) => {
      const replacement = MAP[Number(n)]
      if (!replacement) return match
      changes++
      // Replace just the `text-[Npx]` portion, keeping any `sm:` prefix.
      return match.replace(/text-\[\d+px\]/, replacement)
    })
    if (changes) {
      totalChanges += changes
      console.log(`${file.replace(ROOT, '.')}: ${changes} replacement(s)`)
      if (!dryRun) writeFileSync(file, out)
    }
  }
}

console.log(`\nTotal: ${totalChanges} replacement(s)${dryRun ? ' (dry run — no files written)' : ''}`)
if (totalChanges === 0) console.log('No changes needed.')