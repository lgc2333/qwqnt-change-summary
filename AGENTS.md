# AGENTS.md

## 项目结构

```text
src/
  main/
    global.d.ts         仅含引用：hako 主进程类型 + qwqnt-ipc-interceptor 的源码声明
    index.ts            主进程入口：导出 onLoad，注册 sendMsg 拦截
  renderer/
    global.d.ts         仅含引用：vite 客户端类型 + hako 渲染进程类型
    index.ts            渲染进程入口：用 settings.html 填充 hako 的设置容器
    settings.html       设置页标记，经 `?raw` 内联进 bundle
  shared/
    outside-text.ts     配置 schema、默认值与改写规则；被测模块
scripts/
  build.mjs             依次执行各 mode 构建；`--pack` 额外产出发布用 zip
vite.config.ts          按 mode 构建：main | renderer；zip 步骤会先暂存 temp/pack/
dist/                   构建产物，由框架原地注入读取
```

QwQNT 经 `package.json` 的 `qwqnt.inject` 注入两个入口（`dist/main/index.js`、`dist/renderer/index.js`）。
`qwqnt.dependencies` 声明 `qwqnt-hako`（配置持久化、设置页）与 `qwqnt-ipc-interceptor`（IPC 拦截），
框架按拓扑序先加载依赖。`package.json` 为 `"type": "module"`，框架因此用 `import()` 装载
`dist/main/index.js` 并调用其 `onLoad(plugin)`。

## 命令

```bash
pnpm install
pnpm lint          # eslint .
pnpm lint:fix
pnpm typecheck     # tsc -b --noEmit
pnpm format        # prettier -cw . (写入文件)
pnpm test:run      # vitest run
pnpm build         # main + renderer -> dist/（框架原地读取）
pnpm build:pack    # 构建 + qwqnt-change-summary.zip，供 GitHub Releases
```

`dist/` 是被原地注入的，所以本仓库**就是**已安装的插件目录：`pnpm build` 后在 QwQNT 内重载插件即可，
无需拷贝。只有 `pnpm build:pack` 会把 `package.json` 与 `dist/` 暂存到 `temp/pack/` 再压缩，
使发布包与本仓库目录结构一致。

无 dev/watch 脚本。本仓库不是独立 Electron 应用，拦截链路只能靠在 QQ 里真实发一条消息来完成端到端验证。

## 规则

- 改写规则只落在 `src/shared/outside-text.ts`；两个入口只做接线（取消息、读配置、绑定输入）。
- `nodeIKernelMsgService/sendMsg` 的拦截回调必须同步完成：`IpcInterceptor` 不 await 回调返回值，
  回调里不要出现 `await`，返回 `undefined` 即放行。
- 配置 id 取 `plugin.meta.namespace`（渲染进程侧为 `__self.meta.namespace`），不硬编码包名。
- 第三方类型一律经 `global.d.ts` 的 `/// <reference>` 引用（hako 用 `@qwqnt-community/hako-types`，
  拦截器用其仓库源码声明），不在插件侧复制声明；升级 `pnpm-workspace.yaml` 里 `allowBuilds` 对应
  的依赖 pin 时，同步替换其内含 commit 的 key。
- 参考源码放 `private/references/`。需要 git 仓库作参照时，做深度 1 的 clone。
- 做改动时同步更新相关文档（如各类 `AGENTS.md`）。
- 改代码后先并行跑 typecheck 与 lint，再 format；只改文档时跑 format。

## Commit

Use English conventional commit messages:

```text
type(optional scope): description

- List of change descriptions, focus one point per row

Optional footer(s)
```
