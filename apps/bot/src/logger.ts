import pino from "pino";

// Structured logging. In a container we emit JSON so logs are easy to ship and
// aggregate; locally we pretty-print for readability. The level is overridable
// via LOG_LEVEL (defaults to "info").
const isContainer = process.env.ENV === "CONTAINER";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(isContainer
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        },
      }),
});
