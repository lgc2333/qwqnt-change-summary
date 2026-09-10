import process from 'node:process'
import { build } from 'vite'

// `--pack` 额外产出 qwqnt-change-summary.zip；不带则只编译到 dist/。
process.env.QWQNT_PACK = process.argv.includes('--pack') ? '1' : ''

for (const mode of ['main', 'renderer']) {
  await build({ mode })
}
