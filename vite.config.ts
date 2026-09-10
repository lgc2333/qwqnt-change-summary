import { cpSync, copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { builtinModules } from 'node:module'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'
import viteZipPack from 'unplugin-zip-pack/vite'
import Plugin from './package.json'

const SRC_DIR = resolve(__dirname, './src')
const OUTPUT_DIR = resolve(__dirname, './dist')
const PACK_DIR = resolve(__dirname, './temp/pack')

const external = ['electron', ...builtinModules.flatMap((m) => [m, `node:${m}`])]

// 由 scripts/build.mjs 按 `--pack` 设置：打包时把 package.json 与 dist/ 暂存成发布目录结构再压缩。
const shouldPack = process.env.QWQNT_PACK === '1'

const BaseConfig = defineConfig({
  root: __dirname,
})

const configs = {
  main: defineConfig({
    ...BaseConfig,
    plugins: [],
    build: {
      minify: true,
      outDir: resolve(OUTPUT_DIR, './main'),
      lib: {
        entry: resolve(SRC_DIR, './main/index.ts'),
        formats: ['es'],

        fileName: () => 'index.js',
      },
      rolldownOptions: {
        external,
      },
      target: 'node23',
    },
  }),

  renderer: defineConfig({
    ...BaseConfig,
    plugins: [
      viteZipPack({
        enabled: shouldPack,
        in: PACK_DIR,
        out: resolve(__dirname, `./${Plugin.name}.zip`),
        hooks: {
          pre: () => {
            if (!shouldPack) return

            rmSync(PACK_DIR, { recursive: true, force: true })
            mkdirSync(PACK_DIR, { recursive: true })
            copyFileSync(
              resolve(__dirname, 'package.json'),
              resolve(PACK_DIR, 'package.json'),
            )
            cpSync(OUTPUT_DIR, resolve(PACK_DIR, 'dist'), { recursive: true })
          },
        },
      }),
    ],
    build: {
      minify: true,
      outDir: resolve(OUTPUT_DIR, './renderer'),
      lib: {
        entry: resolve(SRC_DIR, './renderer/index.ts'),
        formats: ['es'],
        fileName: () => 'index.js',
      },
      rolldownOptions: {
        external,
      },
    },
  }),
}

export default defineConfig(({ mode }) => configs[mode as keyof typeof configs])
