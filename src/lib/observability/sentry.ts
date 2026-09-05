import "server-only";

import * as Sentry from "@sentry/nextjs";

type SafeContext = Record<string, string | number | boolean | null | undefined>;

/** Capture operational failures with a deliberately small, non-customer context. */
export function captureServerException(
  error: unknown,
  context: { operation: string; route?: string; dependency?: string; extra?: SafeContext },
) {
  Sentry.withScope((scope) => {
    scope.setTag("operation", context.operation);
    if (context.route) scope.setTag("route", context.route);
    if (context.dependency) scope.setTag("dependency", context.dependency);
    if (context.extra) {
      for (const [key, value] of Object.entries(context.extra)) {
        if (value !== undefined) scope.setExtra(key, value);
      }
    }
    Sentry.captureException(error);
  });
}

