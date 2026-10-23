import { cn } from "@/lib/cn";

type CellState = "answered" | "current" | "empty";

const layout: { q: number; r: number; state: CellState; label: string }[] = [
  { q: 0, r: 0, state: "current", label: "4" },
  { q: 1, r: 0, state: "answered", label: "5" },
  { q: 0, r: 1, state: "answered", label: "8" },
  { q: -1, r: 1, state: "empty", label: "7" },
  { q: -1, r: 0, state: "answered", label: "3" },
  { q: 0, r: -1, state: "answered", label: "1" },
  { q: 1, r: -1, state: "empty", label: "2" },
  { q: 2, r: -1, state: "answered", label: "6" },
  { q: 1, r: 1, state: "empty", label: "9" },
];

/**
 * A honeycomb of question cells, the same shapes as the exam's question map.
 * Decoration only: it shows what the test will look like, not real progress.
 */
export function HexCluster({ className, size = 54 }: { className?: string; size?: number }) {
  const gap = 5;
  const w = Math.sqrt(3) * size;
  const points = (cx: number, cy: number, r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    }).join(" ");

  const cells = layout.map((c) => ({
    ...c,
    x: (w + gap) * (c.q + c.r / 2),
    y: (size * 1.5 + gap * 0.87) * c.r,
  }));
  const minX = Math.min(...cells.map((c) => c.x)) - w / 2;
  const maxX = Math.max(...cells.map((c) => c.x)) + w / 2;
  const minY = Math.min(...cells.map((c) => c.y)) - size;
  const maxY = Math.max(...cells.map((c) => c.y)) + size;

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      aria-hidden="true"
      className={cn("h-auto w-full", className)}
      style={{ maxWidth: maxX - minX }}
    >
      {cells.map((c) => (
        <g key={c.label}>
          <polygon
            points={points(c.x, c.y, size)}
            strokeLinejoin="round"
            strokeWidth={3}
            className={
              c.state === "current"
                ? "fill-highlighter stroke-highlighter"
                : c.state === "answered"
                  ? "fill-white/20 stroke-white/55"
                  : "fill-transparent stroke-white/30"
            }
          />
          <text
            x={c.x}
            y={c.y}
            textAnchor="middle"
            dominantBaseline="central"
            className={cn("font-display text-[22px] font-semibold", c.state === "current" ? "fill-on-highlighter" : "fill-white")}
            opacity={c.state === "empty" ? 0.65 : 1}
          >
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
