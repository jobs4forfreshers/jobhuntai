// ── src/hooks/useWebSocket.js ──
import { useEffect, useRef, useState, useCallback } from 'react';
import { createJobsSocket } from '../api';

export function useLiveJobs(maxItems = 10) {
  const [liveJobs, setLiveJobs]   = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = createJobsSocket((job) => {
      setLiveJobs(prev => [job, ...prev].slice(0, maxItems));
    });

    wsRef.current.onopen  = () => setConnected(true);
    wsRef.current.onclose = () => setConnected(false);

    return () => wsRef.current?.close();
  }, [maxItems]);

  const clear = useCallback(() => setLiveJobs([]), []);

  return { liveJobs, connected, clear };
}
