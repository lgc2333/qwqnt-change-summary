import { describe, expect, it } from 'vitest'

import { DEFAULT_OUTSIDE_TEXT_CONFIG, rewriteOutsideText } from './outside-text'
import type { OutsideTextConfig } from './outside-text'

const OUTSIDE_TEXT: OutsideTextConfig = {
  picOutsideText: '自定义图片外显',
  memeOutsideText: '自定义表情外显',
}

describe('rewriteOutsideText', () => {
  describe('元素分发', () => {
    it('改写图片元素的 summary', () => {
      const element = {
        elementType: 2,
        picElement: { picSubType: 0, summary: '[图片]' },
      }

      rewriteOutsideText({ msgElements: [element] }, OUTSIDE_TEXT)

      expect(element.picElement.summary).toBe('自定义图片外显')
    })

    it('改写商城表情的 faceName', () => {
      const element = { elementType: 11, marketFaceElement: { faceName: '原表情名' } }

      rewriteOutsideText({ msgElements: [element] }, OUTSIDE_TEXT)

      expect(element.marketFaceElement.faceName).toBe('自定义表情外显')
    })

    it('原样穿过其它类型的元素', () => {
      const text = { elementType: 1, textElement: { content: '你好' } }
      const ark = { elementType: 10, arkElement: { bytesData: '{}' } }

      rewriteOutsideText({ msgElements: [text, ark] }, OUTSIDE_TEXT)

      expect(text).toEqual({ elementType: 1, textElement: { content: '你好' } })
      expect(ark).toEqual({ elementType: 10, arkElement: { bytesData: '{}' } })
    })

    it('缺失 msgElements 或子对象时不抛错', () => {
      const bare = [
        { elementType: 2 },
        { elementType: 11 },
        { elementType: 2, picElement: null },
        { elementType: 11, marketFaceElement: null },
      ]

      expect(() => rewriteOutsideText({}, OUTSIDE_TEXT)).not.toThrow()
      expect(() =>
        rewriteOutsideText({ msgElements: null }, OUTSIDE_TEXT),
      ).not.toThrow()
      expect(() =>
        rewriteOutsideText({ msgElements: bare }, OUTSIDE_TEXT),
      ).not.toThrow()
      expect(bare).toEqual([
        { elementType: 2 },
        { elementType: 11 },
        { elementType: 2, picElement: null },
        { elementType: 11, marketFaceElement: null },
      ])
    })
  })

  describe('子类型分流', () => {
    it('picSubType === 1 用表情包外显文本', () => {
      const element = {
        elementType: 2,
        picElement: { picSubType: 1, summary: '[动画表情]' },
      }

      rewriteOutsideText({ msgElements: [element] }, OUTSIDE_TEXT)

      expect(element.picElement.summary).toBe('自定义表情外显')
    })

    it('其余 picSubType 一律用图片外显文本', () => {
      const elements = [0, 2, 4, 7, undefined].map((picSubType) => ({
        elementType: 2,
        picElement: { picSubType, summary: '默认' },
      }))

      rewriteOutsideText({ msgElements: elements }, OUTSIDE_TEXT)

      expect(elements.map((element) => element.picElement.summary)).toEqual([
        '自定义图片外显',
        '自定义图片外显',
        '自定义图片外显',
        '自定义图片外显',
        '自定义图片外显',
      ])
    })
  })

  it('对应外显文本为空时保留原生值', () => {
    const element = { elementType: 2, picElement: { picSubType: 0, summary: '[图片]' } }

    rewriteOutsideText({ msgElements: [element] }, DEFAULT_OUTSIDE_TEXT_CONFIG)

    expect(element.picElement.summary).toBe('[图片]')
  })
})
