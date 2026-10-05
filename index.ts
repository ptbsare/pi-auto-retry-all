/**
 * pi-auto-retry-all
 *
 * 自动重试所有 LLM 错误扩展
 *
 * 原理：
 * 通过原型劫持 `AgentSession.prototype._isRetryableError`，
 * 将 `stopReason === "error"` 的所有消息判定为可重试。
 *
 * 优势：
 * - 不增加任何额外用户消息
 * - 完全复用原生重试机制（_prepareRetry + _omitRecoveryAttempt + continue()）
 * - 上下文保持完整连贯，用户无感
 * - 零副作用，零侵入
 *
 * 重试次数上限由 settings.json 的 `retry.maxRetries` 控制（已设为 7）。
 *
 * 参考：
 * - Pi 扩展开发文档：https://pi.dev/extensions.md
 * - 官方示例：https://github.com/fyeeme/pi-packages (pi-todo)
 * - GPLv3 协议：https://www.gnu.org/licenses/gpl-3.0.html
 */

import { AgentSession } from "@earendil-works/pi-coding-agent";

// `_isRetryableError` 是类私有方法，通过类型断言访问原型以进行运行时劫持。
const proto = AgentSession.prototype as unknown as {
  _isRetryableError: (message: unknown) => boolean;
};

const originalIsRetryable = proto._isRetryableError;

proto._isRetryableError = function (message: any) {
  if (originalIsRetryable.call(this, message)) return true;
  // 一切 error 都重试，不挑错误类型
  if (message?.stopReason === "error") return true;
  return false;
};

export default function autoRetryExtension() {
  // 只需加载即生效，无需注册任何事件
}