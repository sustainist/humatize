import { logger } from "firebase-functions/logger";

const LEVEL = process.env.FUNCTION_LOG_LEVEL?.toLowerCase() || "error";
function shouldLog(level: "debug" | "info" | "warn" | "error") {
  const order = { debug: 0, info: 1, warn: 2, error: 3 };
  return order[level] >= order[LEVEL as keyof typeof order];
}

export function debug(...arg: any[]) {
  if (shouldLog("debug")) logger.debug(...arg);
}
export function info(...args: any[]) {
  if (shouldLog("info")) logger.info(...args);
}
export function warn(...args: any[]) {
  if (shouldLog("warn")) logger.warn(...args);
}
export function error(...args: any[]) {
  if (shouldLog("error")) logger.error(...args);
}

/* 
// Testing logger
import { onRequest } from "firebase-functions/v2/https";
export const loggerTest = onRequest((req, res) => {
  debug("Debug message");
  info("Info message");
  warn("Warn message");
  error("Error message");
  res.status(200).send(`<a href="http://localhost:4000/logs">http://localhost:4000/logs</a>`);
});
// index.ts: export { loggerTest } from "./logger";
*/
