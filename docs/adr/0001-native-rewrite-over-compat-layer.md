# 以原生重写替代 LiteLoader 兼容层

上游 `WJZ-P/LiteLoaderQQNT-Change-Summary` 经 QwQNT 的 LiteLoader 兼容层（`qwqnt-liteloaderqqnt-adapter`）无法被正确加载使用，因此本仓库以它为参照原生重写，而不是依赖或修补兼容层。代价是放弃跟随上游更新，并自行承担 QQ 协议变更的维护成本。
