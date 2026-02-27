// ArcTrade — Sparkline (app/components/common)
export function Sparkline({ data, color = "var(--cyan)", width = 120, height = 40 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toPoint = (v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height,
  });

  const points = data.map(toPoint);
  const lineStr  = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaStr  = [`0,${height}`, ...points.map((p) => `${p.x},${p.y}`), `${width},${height}`].join(" ");
  const gradId   = `sg_${color.replace(/[^a-z]/gi, "")}`;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <polyline points={areaStr} fill={`url(#${gradId})`} stroke="none" />
      <polyline points={lineStr}  fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

