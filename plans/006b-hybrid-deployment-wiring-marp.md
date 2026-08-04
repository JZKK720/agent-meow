---
marp: true
theme: default
paginate: false
size: 16:9
---

# 计划 006b

## 在线/离线混合语音部署接线

---

## 问题

006 安装了 QAA 网关 + DashScope，但只验证了 QAA 自带 Web UI。

未解释：

1. agent-meow 浏览器如何连接 QAA 网关
2. 在线/离线如何同时配置
3. 用户如何切换模式
4. Vite 代理如何转发 WebSocket

---

## 混合架构

```
浏览器 (:5173)
  → Vite 代理 (/api → :3101, ws:true)
    → QAA 网关 (:3101)
      ├─ 在线默认 → DashScope 云端 (~0 秒)
      ├─ 离线备选 → 本地 S2S (:8765, 90s→8s)
      └─ Path B  → Hermes (:8642, 工具调用)
```

---

## 在线模式（DashScope 云端，默认）

- **零预热**：常驻云端，~0 秒冷启动
- **端到端 S2S**：STT + LLM + TTS 一个 WebSocket
- **中文原生**：`qwen-audio-3.0-realtime-flash`
- **成本**：90 天免费，之后 ~¥0.20/分钟
- **配置**：`QWEN_AUDIO_REALTIME_PROVIDER=dashscope`

---

## 离线模式（本地 S2S，备选）

- **完全本地**：无需互联网，零成本
- **预热**：90 秒（Plan 008 优化后 ~8 秒或 ~0 秒）
- **组件**：faster-whisper + Hermes + Kokoro
- **配置**：`QWEN_AUDIO_REALTIME_PROVIDER=speech-to-speech`

---

## 部署步骤

1. **配置两个提供商** — QAA config.env 同时设 DashScope 密钥 + S2S URL
2. **Vite 代理** — `web/vite.config.ts` 中 `/api` 转发到 `:3101`，`ws: true`
3. **启动顺序** — QAA 网关 → (可选) S2S → Vite
4. **切换** — 仪表盘 ☁️/🏠 切换器，QAA 自动重连
5. **自动回退** — DashScope 不可用时自动切离线

---

## Vite 代理配置

```typescript
// web/vite.config.ts — server.proxy 中添加:
'/api': {
  target: 'http://127.0.0.1:3101',
  changeOrigin: true,
  ws: true,  // 关键：WebSocket 代理
},
```

浏览器通过同源 `ws://127.0.0.1:5173/api/realtime` 连接 QAA，避免跨域。

---

## 启动顺序

```powershell
# 1. Hermes Docker（已运行）
# 2. QAA 网关
.\scripts\start-qaa-gateway.ps1
# 3. 本地 S2S（离线模式才需要）
.\scripts\start-s2s-detached.ps1   # 可选
# 4. Vite
cd web; npm run dev
```

离线 S2S 无需一直运行——仅在切换到离线模式时需要。

---

## 在线/离线切换

| 操作             | 效果                                         |
| ---------------- | -------------------------------------------- |
| 点击 ☁️ 在线     | `provider = dashscope` → 连接 DashScope 云端 |
| 点击 🏠 离线     | `provider = speech-to-speech` → 连接本地 S2S |
| DashScope 不可用 | 自动回退到离线模式                           |
| 网络恢复         | 自动切回在线模式                             |

选择持久化在 `localStorage`。QAA 自动断开重连。

---

## Path B 后端代理（可选，Plan 009）

```dotenv
AGENT_PROTOCOL=acp
QWEN_AUDIO_AGENT_BACKEND_URL=ws://127.0.0.1:<端口>/acp/realtime
```

Hermes 在在线和离线模式下都可用——本地 Docker，与语音提供商无关。
