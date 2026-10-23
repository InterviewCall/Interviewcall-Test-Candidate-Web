"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The server owns the clock. Each response says what time it thinks it is, and we remember how far
 * that was from this device's clock when it arrived. From then on "now" means the server's now,
 * so a device with the wrong time can't make the test shorter or longer.
 */
export function serverOffsetMs(serverTimeIso: string, receivedAtMs: number): number {
  return Date.parse(serverTimeIso) - receivedAtMs;
}

/** The server's current time in milliseconds, re-read every `everyMs`. */
export function useServerNow(offsetMs: number, everyMs = 1000): number {
  const offset = useRef(offsetMs);
  const [now, setNow] = useState(() => Date.now() + offsetMs);
  useEffect(() => {
    offset.current = offsetMs;
    const id = window.setInterval(() => setNow(Date.now() + offset.current), everyMs);
    return () => window.clearInterval(id);
  }, [offsetMs, everyMs]);
  return now;
}
