# QwQNT-Change-Summary

改写本机用户发出的图片与表情消息在聊天界面之外的「外显」文本——会话列表与合并转发摘要中替代 `[图片]`、`[动画表情]` 的简短文本。

## 配置

安装后在「设置 → 插件 → 修改图片概要」中配置，改动即保存：

| 配置项         | 作用                                                                  | 留空             |
| -------------- | --------------------------------------------------------------------- | ---------------- |
| 图片外显文本   | 图片消息的外显，QQ 默认显示 `[图片]`                                  | 保持 QQ 原生显示 |
| 表情包外显文本 | 动画表情（默认 `[动画表情]`）与商城表情（默认显示表情自身名称）的外显 | 保持 QQ 原生显示 |

## 安装

需要先安装 `qwqnt-hako` 与 `qwqnt-ipc-interceptor` 两个依赖插件。

从 Releases 下载 `qwqnt-change-summary.zip`，解压到 `qwqnt-storage/plugins/qwqnt-change-summary/`，重启 QQ 即可。

## 许可证与署名

本项目以 EPL-2.0 许可发布。移植自 [WJZ-P/LiteLoaderQQNT-Change-Summary](https://github.com/WJZ-P/LiteLoaderQQNT-Change-Summary)（作者 WJZ_P）；上游的随机文本 API 与「附加配置」「插件信息」两段设置未移植。
