/**
 * Assembly-contract smoke test.
 *
 * This checks what can be checked without a running Harness: the three runtime
 * files parse, the theme table is structurally complete, and the published
 * identity is intact. It does NOT tell you whether a theme looks right or
 * whether the restart button actually restarts anything — those need a human.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

function fail(message) {
  failures.push(message)
}

function check(label, condition, detail) {
  if (condition) {
    console.log(`  ok   ${label}`)
  } else {
    console.log(`  FAIL ${label}${detail ? ' — ' + detail : ''}`)
    fail(label)
  }
}

/* ---------- 1. syntax ---------- */

console.log('syntax')
for (const file of ['index.js', 'client.js', 'desktop-restart.host.js']) {
  const result = spawnSync(process.execPath, ['--check', join(root, file)], { encoding: 'utf8' })
  check(file, result.status === 0, (result.stderr || '').trim().split('\n')[0])
}

/* ---------- 2. published identity ---------- */

console.log('identity')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
check('name is scoped and public-ready', /^@[a-z0-9-]+\/[a-z0-9-]+$/.test(pkg.name), pkg.name)
check('publishConfig.access = public', pkg.publishConfig?.access === 'public')
check('declares engines.dsh', typeof pkg.engines?.dsh === 'string' && pkg.engines.dsh.length > 0)
check('not marked private', pkg.private !== true)
check('bundle patch declared', pkg.dsh?.bundle?.patch === './cordis.patch.yml')
check('client half declared', pkg.dsh?.client?.platform === 'web')
for (const file of ['client.js', 'desktop-restart.host.js']) {
  check(`${file} listed in files[]`, (pkg.files || []).includes(file))
}

/* ---------- 3. theme table ---------- */

console.log('themes')
const client = readFileSync(join(root, 'client.js'), 'utf8')
const start = client.indexOf('const THEMES = [')
const end = client.indexOf('const THEME_BY_KEY = {}')
if (start === -1 || end === -1) {
  fail('theme table not found')
  console.log('  FAIL theme table not found')
} else {
  const table = client.slice(start, end)
  const keys = [...table.matchAll(/\bkey: '([a-z0-9-]+)'/g)].map((m) => m[1])
  check('theme count', keys.length > 0, `${keys.length} themes`)
  check('no duplicate theme keys', new Set(keys).size === keys.length)

  for (const key of keys) {
    const at = table.indexOf(`key: '${key}'`)
    const next = table.indexOf(`key: '`, at + 1)
    const block = table.slice(at, next === -1 ? table.length : next)
    const light = block.slice(block.indexOf('light: {'), block.indexOf('dark: {'))
    const dark = block.slice(block.indexOf('dark: {'))
    const tokens = (text) => [...text.matchAll(/'(--dsw-[a-z0-9-]+)':\s*'(#[0-9a-fA-F]{6})'/g)].map((m) => m[1])
    const l = tokens(light)
    const d = tokens(dark)
    check(`${key}: 10 light tokens`, l.length === 10, `${l.length}`)
    check(`${key}: 10 dark tokens`, d.length === 10, `${d.length}`)
    check(`${key}: light/dark token sets match`, l.slice().sort().join('|') === d.slice().sort().join('|'))
  }
}

/* ---------- 4. locale metadata ---------- */

console.log('locale')
for (const lang of ['en', 'zh']) {
  const meta = JSON.parse(readFileSync(join(root, 'locale', `${lang}.json`), 'utf8'))
  check(`${lang}: meta.title`, typeof meta.meta?.title === 'string' && meta.meta.title.length > 0)
  check(`${lang}: meta.description`, typeof meta.meta?.description === 'string' && meta.meta.description.length > 0)
  check(`${lang}: title is the package name minus scope`, meta.meta?.title === pkg.name.replace(/^@[^/]+\//, ''))
}

/* ---------- verdict ---------- */

console.log('')
if (failures.length === 0) {
  console.log('smoke: PASS — assembly contract only; behaviour still needs a human')
  process.exitCode = 0
} else {
  console.log(`smoke: FAIL — ${failures.length} problem(s)`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exitCode = 1
}
