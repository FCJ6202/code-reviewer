import { useEffect, useState } from 'react';

/** Milliseconds since the component mounted, updated every `intervalMs`. */
export function useElapsedTime(intervalMs = 500): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - start), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return elapsed;
}
