/**
 * Logger đơn giản cho API layer.
 * Wraps console.info/error với prefix timestamp + level.
 * Dùng logger.info() / logger.error() thay vì console.log() trực tiếp.
 */

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, ...args: unknown[]): void {
    console.info(`[${timestamp()}] INFO  ${message}`, ...args);
  },

  error(message: string, ...args: unknown[]): void {
    console.error(`[${timestamp()}] ERROR ${message}`, ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${timestamp()}] WARN  ${message}`, ...args);
  },
};
