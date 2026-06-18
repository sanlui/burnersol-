/**
 * Utility for managing AbortController in React components
 * Provides a clean way to cancel in-flight requests on unmount
 */
import { useRef, useEffect } from "react";

export function useAbortController() {
  const abortRef = useRef<AbortController | null>(null);

  const getSignal = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();
    return abortRef.current.signal;
  };

  const abort = () => {
    abortRef.current?.abort();
    abortRef.current = null;
  };

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { getSignal, abort };
}
