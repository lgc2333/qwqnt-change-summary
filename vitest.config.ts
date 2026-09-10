import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // alias: {
    //   '@': resolve(import.meta.dirname, './src'),
    // },
  },
  test: {
    environment: 'node',
    // 渲染进程相关测试需要 DOM 环境时, 在文件顶部添加 // @vitest-environment jsdom
  },
})
