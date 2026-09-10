/**
 * 消息外显文本（会话列表 / 合并转发摘要中替代 `[图片]`、`[动画表情]` 的文本）。
 *
 * 这里集中了配置 schema 与改写规则：调用方只负责把消息对象与配置交进来，
 * 元素类型分发、子类型语义、结构容错都在模块内部完成。
 */

export interface OutsideTextConfig {
  /** 图片消息使用的外显文本 */
  picOutsideText: string
  /** 动画表情与商城表情使用的外显文本 */
  memeOutsideText: string
}

export const DEFAULT_OUTSIDE_TEXT_CONFIG: OutsideTextConfig = {
  picOutsideText: '',
  memeOutsideText: '',
}

/** 待改写消息元素中本模块会用到的字段；来自 IPC，运行时不可信。 */
interface MsgElementLike {
  elementType?: number
  picElement?: { picSubType?: number; summary?: string } | null
  marketFaceElement?: { faceName?: string } | null
}

/** 把配置文件里的任意值收敛成完整配置，缺键或类型不对时回落到默认值。 */
export function normalizeOutsideTextConfig(raw: unknown): OutsideTextConfig {
  const stored = (raw ?? {}) as Partial<Record<keyof OutsideTextConfig, unknown>>

  return {
    picOutsideText:
      typeof stored.picOutsideText === 'string' ? stored.picOutsideText : '',
    memeOutsideText:
      typeof stored.memeOutsideText === 'string' ? stored.memeOutsideText : '',
  }
}

/**
 * 原地改写消息中图片 / 表情元素的外显文本。
 *
 * - `elementType 2`（图片 / 表情包）：`picSubType === 1` 用表情包文本，其余值用图片文本
 * - `elementType 11`（商城表情）：用表情包文本
 * - 其它元素原样穿过；结构缺失不抛错
 * - 对应外显文本为空串时保留原生值
 */
export function rewriteOutsideText(message: unknown, config: OutsideTextConfig): void {
  if (typeof message !== 'object' || message === null) return

  const { msgElements } = message as { msgElements?: unknown }
  if (!Array.isArray(msgElements)) return

  for (const element of msgElements) {
    if (typeof element !== 'object' || element === null) continue

    const { elementType, picElement, marketFaceElement } = element as MsgElementLike

    if (elementType === 2 && typeof picElement === 'object' && picElement !== null) {
      const text =
        picElement.picSubType === 1 ? config.memeOutsideText : config.picOutsideText
      if (text) picElement.summary = text
    } else if (
      elementType === 11 &&
      typeof marketFaceElement === 'object' &&
      marketFaceElement !== null &&
      config.memeOutsideText
    ) {
      marketFaceElement.faceName = config.memeOutsideText
    }
  }
}
