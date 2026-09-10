# 在主进程接收侧经 IpcInterceptor 拦截 sendMsg

改写发生在主进程接收侧，通过 `IpcInterceptor.interceptIpcReceiveEvents('nodeIKernelMsgService/sendMsg', …)` 拿到的已归一化参数元组进行，而不是像上游那样自行代理 `webContents._events['-ipc-message']`。上游的做法重复实现了参数归一化、与 `qwqnt-ipc-interceptor` 自身的 Proxy 互相嵌套，并需要硬编码随 QQ 版本变动过的发射签名。

## Consequences

拦截回调是同步的——`IpcInterceptor` 不 await 回调的返回值，返回 Promise 会被当作「放行」且原生处理会在异步体完成前继续——因此处理期间无法执行任何异步工作：想要在发送时按需请求随机文本接口，就必须改用别的挂载方式。
