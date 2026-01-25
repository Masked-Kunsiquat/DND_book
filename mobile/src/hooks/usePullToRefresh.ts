import { useCallback, useEffect, useRef, useState } from 'react';

export interface PullToRefreshState {
  refreshing: boolean;
  onRefresh: () => void;
}

export function usePullToRefresh(delayMs = 400): PullToRefreshState {
  const [refreshing, setRefreshing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setRefreshing(false);
    }, delayMs);
  }, [delayMs, refreshing]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { refreshing, onRefresh };
}
