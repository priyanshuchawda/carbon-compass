import { redactError } from "@/lib/carbon/redaction";

type LogContext = {
  requestId?: string;
  details?: unknown;
};

export function logError(message: string, error: unknown, context: LogContext = {}): void {
  if (process.env.NODE_ENV === "test") return;

  const safeError = redactError(error);
  const suffix = context.requestId ? ` [ReqID: ${context.requestId}]` : "";
  console.error(`${message}${suffix}:`, {
    ...safeError,
    details: context.details,
  });
}
