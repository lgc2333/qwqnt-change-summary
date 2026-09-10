import {
  DEFAULT_OUTSIDE_TEXT_CONFIG,
  normalizeOutsideTextConfig,
  rewriteOutsideText,
} from '../shared/outside-text'

/** 框架在加载 main 入口时传入的插件上下文。 */
interface PluginContext {
  meta: { namespace: string }
}

export function onLoad(plugin: PluginContext): void {
  const configId = plugin.meta.namespace

  // 归一化后的接收侧 4 元组：`[event, isSession, channel, [requestMeta, { payload: [msg, null] }]]`。
  // 回调必须同步完成——IpcInterceptor 不 await 返回值，返回 undefined 即放行。
  IpcInterceptor.interceptIpcReceiveEvents(
    'nodeIKernelMsgService/sendMsg',
    (...args: unknown[]) => {
      const command = (args[3] as [unknown, { payload?: unknown[] }] | undefined)?.[1]

      rewriteOutsideText(
        command?.payload?.[0],
        normalizeOutsideTextConfig(
          PluginSettings.main.readConfig(configId, DEFAULT_OUTSIDE_TEXT_CONFIG),
        ),
      )
    },
  )
}
