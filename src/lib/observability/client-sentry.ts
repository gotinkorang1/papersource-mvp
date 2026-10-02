import * as Sentry from "@sentry/nextjs";

/** Report a UI boundary failure without attaching customer or form data. */
export function captureClientBoundaryError(error: unknown, boundary: string, digest?: string) {
  Sentry.withScope((scope) => {
    scope.setTag("error_boundary", boundary);
    if (digest) scope.setTag("digest", digest);
    Sentry.captureException(error);
  });
}
