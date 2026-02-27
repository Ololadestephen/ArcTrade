// ArcTrade — CustomCursor (app/components/common)
import { useRef } from "react";
import { useCursor } from "../../hooks/useCursor";

export function CustomCursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const trailRef = useRef(null);

  useCursor({ dotRef, ringRef, trailRef });

  return (
    <>
      {/* Layer 1 — slowest: blurry ghost trail dot */}
      <div id="arc-trail" ref={trailRef} className="hidden" />

      {/* Layer 2 — middle: hollow ring that lags behind with crosshairs on hover */}
      <div id="arc-ring" ref={ringRef} className="hidden" />

      {/* Layer 3 — fastest: solid cyan dot that snaps to exact mouse position */}
      <div id="arc-cursor" ref={dotRef} className="hidden" />
    </>
  );
}

