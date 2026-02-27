// ArcTrade — useToast (app/hooks)
import { useState, useCallback, useRef } from "react";

export function useToast(duration = 3500) {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((msg) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(null), duration);
  }, [duration]);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(null);
  }, []);

  return { message, show, dismiss };
}

