"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DebugRuntimeProbe() {
  const pathname = usePathname();

  useEffect(() => {
    const runId = `run_${Date.now()}`;
    const portalCount = typeof document !== "undefined" ? document.querySelectorAll("nextjs-portal").length : 0;

    // #region agent log
    fetch("http://127.0.0.1:7752/ingest/cb263419-a4c8-413d-beba-702a940871fa", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "44a1c0" }, body: JSON.stringify({ sessionId: "44a1c0", runId, hypothesisId: "H4", location: "components/DebugRuntimeProbe.tsx:14", message: "client_mount", data: { pathname, userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "n/a", nextjsPortalCount: portalCount }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion

    const onError = (event: ErrorEvent) => {
      // #region agent log
      fetch("http://127.0.0.1:7752/ingest/cb263419-a4c8-413d-beba-702a940871fa", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "44a1c0" }, body: JSON.stringify({ sessionId: "44a1c0", runId, hypothesisId: "H1", location: "components/DebugRuntimeProbe.tsx:20", message: "window_error", data: { message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno }, timestamp: Date.now() }) }).catch(() => {});
      // #endregion
    };

    const onUnhandled = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
      // #region agent log
      fetch("http://127.0.0.1:7752/ingest/cb263419-a4c8-413d-beba-702a940871fa", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "44a1c0" }, body: JSON.stringify({ sessionId: "44a1c0", runId, hypothesisId: "H3", location: "components/DebugRuntimeProbe.tsx:28", message: "unhandled_rejection", data: { reason }, timestamp: Date.now() }) }).catch(() => {});
      // #endregion
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandled);

    const originalError = console.error;
    const originalWarn = console.warn;
    console.error = (...args: unknown[]) => {
      // #region agent log
      fetch("http://127.0.0.1:7752/ingest/cb263419-a4c8-413d-beba-702a940871fa", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "44a1c0" }, body: JSON.stringify({ sessionId: "44a1c0", runId, hypothesisId: "H5", location: "components/DebugRuntimeProbe.tsx:40", message: "console_error", data: { args: args.map((a) => (a instanceof Error ? a.message : String(a))).slice(0, 5) }, timestamp: Date.now() }) }).catch(() => {});
      // #endregion
      originalError(...args);
    };
    console.warn = (...args: unknown[]) => {
      // #region agent log
      fetch("http://127.0.0.1:7752/ingest/cb263419-a4c8-413d-beba-702a940871fa", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "44a1c0" }, body: JSON.stringify({ sessionId: "44a1c0", runId, hypothesisId: "H5", location: "components/DebugRuntimeProbe.tsx:47", message: "console_warn", data: { args: args.map((a) => String(a)).slice(0, 5) }, timestamp: Date.now() }) }).catch(() => {});
      // #endregion
      originalWarn(...args);
    };

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandled);
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [pathname]);

  return null;
}
