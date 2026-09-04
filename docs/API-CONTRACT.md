# API 契约

## JSON 包络

新接口统一返回：

```json
{ "success": true, "data": {}, "error": null }
```

错误返回：

```json
{
  "success": false,
  "data": null,
  "error": { "code": "UNAUTHORIZED", "message": "认证失败，请重新登录" }
}
```

迁移期间 UI 兼容历史裸数组、裸对象以及 `{ sessions }`、`{ messages }`。新 API 不应继续扩散旧结构。

## 鉴权与刷新

- 受保护接口使用 `Authorization: Bearer <access_token>`。
- 收到 401 后，前端使用保存的 `refresh_token` 调用 `POST /api/v1/auth/refresh`，成功后仅重试原请求一次。
- refresh 失败或重试仍为 401 时清除本地会话并返回登录页。
- history、删除、创建、列表和流式消息使用相同鉴权路径。

## SSE 与危机响应

标准流式事件：

```text
data: {"type":"message_start","message_id":"...","reply_id":"..."}
data: {"type":"delta","text":"..."}
data: {"type":"done"}
```

前端同时支持危机安全路径的 JSON 或 SSE 事件：

```json
{ "type": "crisis", "message": "安全支持与求助资源" }
```

流式错误使用 `{ "type": "error", "message": "..." }`；兼容期也接受 `error` 字段。

## 状态码

| 状态 | 语义 |
| --- | --- |
| 200/201 | 成功 |
| 400 | 参数或状态迁移不合法 |
| 401 | token 缺失、过期或无效 |
| 403 | 已认证但无权执行 |
| 404 | 资源不存在或不属于当前用户 |
| 409 | 状态冲突 |
| 500 | 服务端错误 |
| 502/503 | 模型供应商不可用 |
