# pi-auto-retry-all

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Pi Extension](https://img.shields.io/badge/Pi-Extension-green.svg)](https://pi.dev)

适用于 [Pi Coding Agent](https://github.com/earendil-works/pi) 的自动无缝重试扩展。彻底解决流式响应断连（如 `unexpected EOF`、套接字挂起、网络超时等）导致的请求中断问题，**全程不产生任何多余的用户重试消息**。

[English Documentation](README.md)

---

## 🌟 核心特性

- **零消息产生（无感重试）**：不同于在对话历史中插入“请重新处理...”等无用提示消息的简单扩展，`pi-auto-retry-all` 在运行时通过对 `AgentSession.prototype._isRetryableError` 进行原型劫持，完全复用 Pi 原生的重试恢复回路（`_prepareRetry` -> `_omitRecoveryAttempt` -> `continue()`），原地点续 LLM 调用。
- **全错误捕获**：覆盖并重写了默认严格的错误正则过滤规则，只要是以 `stopReason === "error"` 结尾的任何报错（包括 Node 的 undici/fetch 抛出的 `unexpected EOF`、网关/代理重置等），均会自动判定为可重试。
- **干净的上下文历史**：失败的尝试会被 Pi 原生机制从 LLM 上下文投影中隐式屏蔽，对话历史保持 100% 干净连贯。
- **配置灵活**：完美兼容 Pi 原生 `settings.json` 的重试次数、指数退避延迟及 TUI 倒计时指示器。

---

## 🚀 快速开始

### 安装插件

使用 GitHub 仓库地址直接安装至 Pi：

```bash
pi install git:github.com/ptbsare/pi-auto-retry-all.git
```

或者临时测试一次：

```bash
pi -e git:github.com/ptbsare/pi-auto-retry-all.git
```

---

## ⚙️ 配置说明

在 `~/.pi/agent/settings.json` 中配置你期望的重试预算：

```json
{
  "retry": {
    "enabled": true,
    "maxRetries": 7,
    "baseDelayMs": 2000,
    "maxAgentDelayMs": 60000
  }
}
```

- `maxRetries`：单个错误 Turn 的最大重试次数（例如 `7`）。
- `baseDelayMs`：退避重试的初始等待毫秒数（支持指数递增）。
- `maxAgentDelayMs`：退避等待的最大时间上限。

---

## 🛠️ 工作原理

1. **为什么原生会放弃重试 `unexpected EOF`**：Node.js 的 `undici`/`fetch` 在网络 TCP 被 RST 或断开时抛出 `unexpected EOF`，Pi 内置的 `isRetryableAssistantError` 正则未匹配该文案，直接判为不可重试。
2. **原型劫持**：`pi-auto-retry-all` 被 `jiti` 加载时，动态补丁 `AgentSession.prototype._isRetryableError`。
3. **原生无缝恢复**：只要 `stopReason === "error"`，Pi 内部的 Agent 循环即可执行退避等待、屏蔽失败上下文，并重新发起当前 Assistant 请求。

---

## 📜 开源协议

本项目基于 [GPLv3 协议](LICENSE) 开源。
