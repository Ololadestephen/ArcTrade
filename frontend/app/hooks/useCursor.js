// ArcTrade — useCursor (app/hooks)
import { useEffect, useRef } from "react";

export function useCursor({ dotRef, ringRef, trailRef }) {
  const mouse = useRef({ x: -200, y: -200 });
  const ring  = useRef({ x: -200, y: -200 });
  const trail = useRef({ x: -200, y: -200 });

  const rafId = useRef(null);

  const RING_EASE  = 0.13;
  const TRAIL_EASE = 0.07;

  const INTERACTIVE =
    'a, button, [role="button"], input, select, textarea, label, .tab, .toggle, tr';

  useEffect(() => {
    const dot     = dotRef.current;
    const ringEl  = ringRef.current;
    const trailEl = trailRef.current;
    if (!dot || !ringEl || !trailEl) return;

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      dot.classList.remove("hidden");
      ringEl.classList.remove("hidden");
      trailEl.classList.remove("hidden");
    };

    const onOver = (e) => {
      if (e.target.closest(INTERACTIVE)) {
        dot.classList.add("hovering");
        ringEl.classList.add("hovering");
      }
    };

    const onOut = (e) => {
      if (e.target.closest(INTERACTIVE)) {
        dot.classList.remove("hovering");
        ringEl.classList.remove("hovering");
      }
    };

    const onDown = () => {
      dot.classList.add("clicking");
      ringEl.classList.add("clicking");
    };

    const onUp = () => {
      dot.classList.remove("clicking");
      ringEl.classList.remove("clicking");
    };

    const onLeave = () => {
      dot.classList.add("hidden");
      ringEl.classList.add("hidden");
      trailEl.classList.add("hidden");
    };

    const onEnter = () => {
      dot.classList.remove("hidden");
      ringEl.classList.remove("hidden");
      trailEl.classList.remove("hidden");
    };

    const loop = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * RING_EASE;
      ring.current.y += (mouse.current.y - ring.current.y) * RING_EASE;
      ringEl.style.transform =
        `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%,-50%)`;

      trail.current.x += (mouse.current.x - trail.current.x) * TRAIL_EASE;
      trail.current.y += (mouse.current.y - trail.current.y) * TRAIL_EASE;
      trailEl.style.transform =
        `translate(${trail.current.x}px, ${trail.current.y}px) translate(-50%,-50%)`;

      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout",  onOut,  { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout",  onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

