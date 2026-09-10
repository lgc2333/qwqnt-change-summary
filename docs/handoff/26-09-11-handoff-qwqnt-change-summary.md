# Handoff — qwqnt-change-summary 原生移植

日期：2026-09-11
工作区：`D:/Programs/QwQNT/qwqnt-storage/plugins/qwqnt-change-summary`
目标仓库（上游）：`https://github.com/WJZ-P/LiteLoaderQQNT-Change-Summary`

> **代码结构未定，也不在本文件中预设。** 下个 agent 应先用 `codebase-design` skill 决定模块划分与 seam 位置，再动手。本文件只给**约束、需求与已查明的事实**。

---

## 1. 背景与目标

上游是一个 LiteLoaderQQNT 插件：改写本机用户**发出的**图片与表情消息在聊天气泡之外的「外显」文本（会话列表 / 合并转发摘要里替代 `[图片]`、`[动画表情]` 的简短文本）。

本仓库要把它**原生移植**成 QwQNT 插件（TypeScript + vite，QwQNT 通过 `package.json` 的 `qwqnt.inject` 注入三段入口）。

移植不是优化，是唯一可行路径：用户已确认（ground truth）**上游经 QwQNT 的 LiteLoader 兼容层 `qwqnt-liteloaderqqnt-adapter` 无法被正确加载使用**。用户已自行删除原先挂在 `plugins/` 下的上游目录 `Change-Summary-3.0.0`（连同其 `config.json`），所以现在不存在双写冲突。

术语以仓库根的 `CONTEXT.md` 为准（`外显` / `外显文本` / `图片消息` / `表情包` / `动画表情` / `商城表情`）。决策背景见 `docs/adr/`。

---

## 2. 已定决策（不要再回头讨论）

| 议题     | 结论                                                                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 移植方式 | 原生重写，不依赖兼容层 → `docs/adr/0001-native-rewrite-over-compat-layer.md`                                                                               |
| 拦截位置 | 主进程**接收侧**，`IpcInterceptor.interceptIpcReceiveEvents('nodeIKernelMsgService/sendMsg', …)` → `docs/adr/0002-intercept-sendmsg-via-ipcinterceptor.md` |
| 配置范围 | **只做两个主配置**：`picOutsideText`、`memeOutsideText`。随机文本 API 整块砍掉（含 5 个相关键与设置页「附加配置」「插件信息」两段）                        |
| 元素覆盖 | `elementType 2`（图片 / 表情包）+ `elementType 11`（商城表情）都改                                                                                         |
| 依赖     | `qwqnt-hako ^1.0.2` + `qwqnt-ipc-interceptor ^1.2.1`，写进 `package.json` 的 `qwqnt.dependencies`                                                          |
| 许可证   | EPL-2.0（用户已替换 `LICENSE`）；**不写 ADR**（用户明确要求）                                                                                              |
| 图标     | **不放**，用 hako 默认（用户要求）。因此不设 `qwqnt.icon`                                                                                                  |
| 元数据   | `package.json` 的 name / author / description / version **由用户手改**，不要动                                                                             |
| 上游目录 | 已由用户删除，无需处理                                                                                                                                     |

---

## 3. 已完成

- `LICENSE` → EPL-2.0（用户操作）
- `package.json` → 增加 `contributors: ["WJZ_P"]`（用户操作）
- `AGENTS.md` → 增加一条 Rules：参考源码放 `private/references/`（用户操作）
- `CONTEXT.md` → 新建，6 词术语表，使用 `_Also_` / `_Avoid_` 约定
- `docs/adr/0001-native-rewrite-over-compat-layer.md`、`docs/adr/0002-intercept-sendmsg-via-ipcinterceptor.md` → 新建
- 用户已 `git init` 且已 `pnpm install`（`node_modules/` 存在）

### 遗留物（需清理，但先由 codebase-design 决定最终布局再动）

- `static/` → **空目录**，早先误建（原为放图标，现已决定不放）。若最终方案需要 `static/settings.html` 之类的静态资源则应保留并利用
- `temp/asar/` → 读 QQ asar 的扫描脚本与输出。`temp/` 已在 `.gitignore` 内。结论是 **asar 载荷加密、此路不通**（§5.7），除非要做解密否则可整体删除
- `temp/references/LiteLoaderQQNT-Change-Summary/` → **空目录**，clone 未完成。若需要上游源码作参照，请补全（或改用 raw.githubusercontent.com 直接读）

---

## 4. 需求（**不是**文件清单）

结构由下个 agent 决定。以下是必须成立的**可观察结果**，按验收口径写：

1. **拦截生效**：本机用户发送含图片 / 动画表情 / 商城表情的消息时，该消息元素的 `picElement.summary` / `marketFaceElement.faceName` 在被原生层序列化前被改写为配置的文本。
2. **改写是同步的**：拦截回调内不得有异步等待（硬约束，§5.2）。
3. **不改写其它元素**：`elementType` 既非 2 也非 11 的元素必须原样穿过；缺失 `msgElements` / 缺失对应子对象的输入不得抛错。
4. **子类型分流**：`picSubType === 1` 用表情包文本，其余值用图片文本（沿用上游语义，§5.3）。
5. **配置可读写**：两个键通过 hako 的 `PluginSettings` 持久化，落在 `qwqnt-storage/configs/<id>/config.json`。
6. **设置页可用**：QwQNT 设置界面出现本插件条目，含两个文本输入框，改动即保存、重开后回显（§5.5 契约）。
7. **测试**：上述第 3、4 条（元素分发与子类型分流）需有确定性单测覆盖；其余不作测试要求。
8. **无遗留脚手架**：起点仓库里的示例代码（`QwqntTemplate` 系列、示例 IPC 握手）必须清除干净。
9. **文档同步**：`README.md`（现仅 23 字节）需重写为功能 / 两个配置项 / 构建与安装 / 上游署名 / 子类型语义说明；`AGENTS.md` 的结构与命令段需与最终实现一致。

**已知需要处理的元数据不一致**：`package.json` 的 `"license"` 仍是 `"MIT"`，与已替换为 EPL-2.0 的 `LICENSE` 冲突（§2 已定用上游许可证）。该文件归用户手改，改动前须与用户协调。

---

## 5. 关键技术事实（昂贵调研所得，未落在其它 artifact 里）

### 5.1 sendMsg 包结构

主进程接收侧经 `IpcInterceptor` 归一化后，回调收到 **4 元组**：

```
args[0] = event
args[1] = isSession
args[2] = channel
args[3] = [requestMeta, cmdData]
           cmdData = { cmdName, cmdType: 'invoke', payload: [msg, null] }
           msg     = { msgId, peer, msgElements, msgAttributeInfos }
```

- **取消息对象用 `args[3]?.[1]?.payload?.[0]`**（`payload` 是数组，`[1]` 是尾随 `null`）。
- **不要硬编码 `args[3][1]`**：发射签名随 QQ 版本变过（上游 PR #16 的 `qqVer>=32000` 分支即为此），交给 `IpcInterceptor` 的归一化。
- 上游那段三段式回退（`Array.isArray(...) ? ... : args[3][1].payload` → `!payload.msgElements` → `payload[0]`）是绕开归一化时代的补丁，移植后**只需一行**。
- 传输是 `ipcRenderer.send('RM_IPCFROM_RENDERER'+id, meta, packet)`，**不是** Electron `invoke/handle`。

### 5.2 回调必须同步（硬约束）

`IpcInterceptor` **不 await** 回调返回值。返回 Promise 会被判为「放行」，且原生处理会在异步体完成**之前**继续。→ 处理期间无法做任何异步工作（这正是砍掉随机文本 API 的原因之一，已记入 ADR 0002）。

- 原地改 + **返回 `undefined`**（= pass）。不要 `block`，不要 `replace`（`{action:'replace'}` 在所有已发布 QwQNT 插件中出现次数为 **0**）。

### 5.3 元素类型与子类型

- `elementType`：`1` Text、`2` Pic、`11` MarketFace（本插件只关心 2 与 11）
- `picSubType`：`0 KNORMAL`、`1 KCUSTOM`(动画表情)、`2 KHOT`、`3`、`4 KSMART`、`5`、`6 KUNKNOW`、`7 KRELATED`
- **沿用上游语义**：仅 `picSubType === 1` 视为**动画表情**，其余（含 2~7）一律视为**图片消息**。需在 README 写明
- 写值位置：`picElement.summary`（elementType 2）、`marketFaceElement.faceName`（elementType 11）

### 5.4 该字段确实被链路采纳（已证，非推测）

- **QAuxiliary** `app/src/main/java/cc/microblock/hook/ImageCustomSummary.kt` hook `IKernelMsgService$CppProxy.sendMsg`，写的正是 `picElement.summary` / `marketFaceElement["faceName"]`，功能即「自定义消息列表中 [图片][动画表情] 等内容」，maintained
- **NapCat** `packet/message/element.ts`：`PacketMsgPicElement.toPreview(){return this.summary}`（回退 `[图片]`/`[动画表情]`）；`marketFace.faceName` 被编码进 protobuf → **结构字段，非装饰性残留**
- **Little100 fork**（`github.com/Little100/LiteLoaderQQNT-Change-Summary`，commit e8fcba1）在 QQ build **49738** 上被确认可用
- 历史失效原因是**包结构/接口变更**，不是下游覆盖（上游 issue #17、#18）

**仍未证**：本机 QQ `9.9.23-42086` 上的运行结果（见 §7）。

### 5.5 hako 设置页契约

- `PluginSettings.renderer.registerPluginSettings(packageJson)` 返回**空的** `HTMLDivElement`（class `tab-view <name>`），由插件自己填：`view.innerHTML = await (await fetch(storageUrl)).text()`
- hako 只读 packageJson 的 `name`、`qwqnt.name`、`qwqnt.icon` 三个字段
- `readConfig` / `writeConfig` 在 renderer 是 **`sendSync` 同步**的，**不要 `await`**
- 配置落在 `qwqnt-storage/configs/<id>/config.json`，`<id>` = `packageJson.name`
- 属性用 `is-disabled` / `is-active`，**没有** `disabled`
- `setting-switch` 无自带事件，用 `click` + `toggleAttribute('is-active')`
- 原生元素标签：`setting-section` / `panel` / `list` / `item` / `select` / `option` / `switch` / `button` / `text` / `link` / `divider` / `modal`
- 参照实现：`qwqnt-more-materials`（`src/renderer/index.ts` + `src/pages/settings.html`）、`qwqnt-quick-reply`

### 5.6 依赖与加载顺序

- 框架按 `package.json` 的 `qwqnt.dependencies` 做**拓扑排序**后加载；依赖缺失/版本不满足则该插件被跳过（并弹 alert）
- hako 自身已依赖 `qwqnt-ipc-interceptor ^1.2.0`，故只声明 hako 也能保证 `IpcInterceptor` 先于我们存在；但仍**两个都显式声明**
- 旧名 `ipc_interceptor` 是 1.2.0 及以下，**不要用**
- 本机已装：`qwqnt-hako` 1.0.2、`qwqnt-ipc-interceptor` 1.2.1

### 5.7 QQ 的 asar 是加密的（不要浪费时间）

`D:/Program Files/Tencent/QQNT/versions/9.9.23-42086/resources/app/application.asar` 的条目载荷为 **AES 加密**：

- 1208 个条目 size **全为 16 的倍数**（非倍数计数 0）
- 对照项 `/vbs/util.vbs`（必然是 ASCII）同样高熵 → 不是读取器的问题
- 头部条目只有 `{size, offset, integrity:{SHA256,...}}`，**不带 per-file key/iv** → 密钥在原生二进制里
- 想拿 QQ 自己的调用点只能做解密；本插件**不需要**，改为运行时 shape-tolerant 处理

---

## 6. 有用路径

| 用途                                    | 路径                                                                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 框架主进程（加载器、协议、hook）        | `D:/Programs/QwQNT/qwqnt-framework/main.js`                                                                                                                      |
| 框架类型                                | `D:/Programs/QwQNT/qwqnt-framework/{main,preload,renderer}.d.ts`；`node_modules/@qwqnt/types/`                                                                   |
| 待移植上游（若需补 clone）              | `temp/references/LiteLoaderQQNT-Change-Summary/`（当前**空**）；或以 `https://raw.githubusercontent.com/WJZ-P/LiteLoaderQQNT-Change-Summary/main/src/...` 直接读 |
| 拦截器实现（权威语义）                  | `qwqnt-ipc-interceptor` → `src/main/modules/proxyIpcMessage.ts` + `src/types/proxyIpcMessage.ts`                                                                 |
| 接收侧最佳参考实现                      | `Flartiny/qwqnt-direct-jump/main/index.js`（注释里写明 4 元组）                                                                                                  |
| sendMsg 拦截生产实例                    | `xiyuesaves/lite-tools` 分支 `dev/v5` → `src/main/modules/messages/sendMessageInterceptor/index.ts`                                                              |
| 同款功能的 Android 实现（证明字段有效） | QAuxiliary `ImageCustomSummary.kt`                                                                                                                               |
| 本机插件样本                            | `D:/Programs/QwQNT/qwqnt-storage/plugins/{qwqnt-hako,qwqnt-more-materials,qwqnt-ipc-interceptor}/`                                                               |

---

## 7. 验证计划

代理负责：`pnpm typecheck` + `pnpm lint` + `pnpm test:run` + `pnpm build`（按 `AGENTS.md`：typecheck 与 lint 并行，再 format）。

**用户负责**（用户已选此方案）：构建产物放到插件目录 → 重启 QQ → **发一条含图消息**，查看会话列表 / 合并转发里是否显示为配置的文本。这是唯一能证伪核心假设的一步（需登录态，代理无法代做）。

若实测无效，优先怀疑拦截位置/包结构而非「字段被覆盖」（§5.4 已排除后者）。

---

## 8. 建议后续会话调用的 skills

1. **`codebase-design`（先调用，且是本次首要动作）** —— 用户明确要求不预设代码结构，由下个 agent 自行决定：用该 skill 的 deep-module 词汇决定模块划分、seam 位置（例如「改写逻辑」与「拦截接线」之间），使第 4 条需求可测、接口够深
2. **`tdd`** —— 落实需求 7 的分发与分流单测时
3. **`writing-for-agents`** —— 重写 `README.md` / `AGENTS.md` 时
4. **`domain-modeling`** —— 若术语仍有变动，或需新增/修订 ADR；注意该 skill 对 ADR 有「难回退 + 无上下文会困惑 + 真有权衡」三条门槛，且 `CONTEXT.md` **只放术语、不放实现细节**
5. **`grilling`** —— 本次会话的既有模式；若仍有未定问题，沿设计树逐轮收敛

---

## 9. 工作方式注意

- 用户偏好**中文**交流
- 用户要求：动手前先给短计划并等确认
- 用户是 ground truth 的来源，其陈述优先于工具推断（本次「上游无法被兼容层正确加载使用」即由此确立）
- `package.json` 归用户手改，代理改同文件前须协调
- 提交信息用英文 conventional commit（见 `AGENTS.md`）
