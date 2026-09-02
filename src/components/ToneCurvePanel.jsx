import React, { useState, useRef, useCallback, useEffect } from 'react';
import PanelSection from './PanelSection';

const CHANNELS = [
  { key: 'curveRGB', label: 'RGB', color: '#e5e7eb' },
  { key: 'curveRed', label: 'Red', color: '#ef4444' },
  { key: 'curveGreen', label: 'Green', color: '#22c55e' },
  { key: 'curveBlue', label: 'Blue', color: '#3b82f6' },
];

const SIZE = 220;
const PAD = 8;

export default function ToneCurvePanel({ settings, onChange }) {
  const [activeChannel, setActiveChannel] = useState(0);
  const svgRef = useRef(null);
  const [draggingIdx, setDraggingIdx] = useState(null);

  const channel = CHANNELS[activeChannel];
  const points = settings[channel.key];

  const toSVG = (p) => ({
    sx: PAD + p.x * (SIZE - PAD * 2),
    sy: PAD + (1 - p.y) * (SIZE - PAD * 2),
  });

  const fromSVG = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - PAD) / (SIZE - PAD * 2);
    const y = 1 - (clientY - rect.top - PAD) / (SIZE - PAD * 2);
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    };
  };

  const buildPath = useCallback(() => {
    if (points.length < 2) return '';
    // Catmull-Rom'u SVG path'e dönüştür (basitleştirilmiş)
    const sorted = [...points].sort((a, b) => a.x - b.x);
    let d = '';

    for (let t = 0; t <= 1; t += 0.005) {
      // Segmenti bul
      let i = 0;
      while (i < sorted.length - 1 && sorted[i + 1].x < t) i++;
      if (i >= sorted.length - 1) i = sorted.length - 2;

      const p0 = sorted[Math.max(0, i - 1)];
      const p1 = sorted[i];
      const p2 = sorted[Math.min(sorted.length - 1, i + 1)];
      const p3 = sorted[Math.min(sorted.length - 1, i + 2)];

      const dx = p2.x - p1.x;
      if (dx < 0.001) continue;

      const s = (t - p1.x) / dx;
      const s2 = s * s;
      const s3 = s2 * s;

      const val = 0.5 * (
        2 * p1.y +
        (-p0.y + p2.y) * s +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3
      );

      const clampedVal = Math.max(0, Math.min(1, val));
      const sx = PAD + t * (SIZE - PAD * 2);
      const sy = PAD + (1 - clampedVal) * (SIZE - PAD * 2);

      d += (d === '' ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`);
    }
    return d;
  }, [points]);

  const handleMouseDown = (idx) => (e) => {
    e.preventDefault();
    setDraggingIdx(idx);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (draggingIdx === null) return;
      const { x, y } = fromSVG(e.clientX, e.clientY);
      const newPoints = [...points];

      if (draggingIdx === 0) {
        newPoints[0] = { x: 0, y: Math.max(0, Math.min(1, y)) };
      } else if (draggingIdx === points.length - 1) {
        newPoints[draggingIdx] = { x: 1, y: Math.max(0, Math.min(1, y)) };
      } else {
        newPoints[draggingIdx] = {
          x: Math.max(0.01, Math.min(0.99, x)),
          y: Math.max(0, Math.min(1, y)),
        };
      }
      onChange(channel.key, newPoints);
    },
    [draggingIdx, points, channel.key, onChange],
  );

  const handleMouseUp = useCallback(() => {
    setDraggingIdx(null);
  }, []);

  useEffect(() => {
    if (draggingIdx !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingIdx, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = (e) => {
    const { x, y } = fromSVG(e.clientX, e.clientY);
    // Yakın bir kontrol noktası varsa sil, yoksa yeni ekle
    const threshold = 0.05;
    const closeIdx = points.findIndex(
      (p, i) => i > 0 && i < points.length - 1 && Math.abs(p.x - x) < threshold && Math.abs(p.y - y) < threshold,
    );

    if (closeIdx !== -1) {
      const newPoints = points.filter((_, i) => i !== closeIdx);
      onChange(channel.key, newPoints);
    } else {
      const newPoints = [...points, { x, y }].sort((a, b) => a.x - b.x);
      onChange(channel.key, newPoints);
    }
  };

  const handleReset = () => {
    onChange(channel.key, [
      { x: 0, y: 0 },
      { x: 0.25, y: 0.25 },
      { x: 0.75, y: 0.75 },
      { x: 1, y: 1 },
    ]);
  };

  return (
    <PanelSection title="Tone Curve">
      {/* Kanal Seçici */}
      <div className="flex gap-1 mb-3">
        {CHANNELS.map((ch, i) => (
          <button
            key={ch.key}
            onClick={() => setActiveChannel(i)}
            className={`flex-1 text-xs py-1.5 rounded transition-colors font-medium ${
              i === activeChannel
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
            style={i === activeChannel ? { color: ch.color } : undefined}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Eğri Editörü */}
      <div className="relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700/50">
        <svg
          ref={svgRef}
          width={SIZE}
          height={SIZE}
          className="w-full h-auto cursor-crosshair select-none"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          onDoubleClick={handleDoubleClick}
        >
          {/* Grid çizgileri */}
          {[0.25, 0.5, 0.75].map((v) => {
            const pos = PAD + v * (SIZE - PAD * 2);
            return (
              <g key={v}>
                <line x1={PAD} y1={pos} x2={SIZE - PAD} y2={pos} stroke="#333" strokeWidth={0.5} />
                <line x1={pos} y1={PAD} x2={pos} y2={SIZE - PAD} stroke="#333" strokeWidth={0.5} />
              </g>
            );
          })}

          {/* Diyagonal referans çizgisi */}
          <line
            x1={PAD} y1={SIZE - PAD}
            x2={SIZE - PAD} y2={PAD}
            stroke="#444" strokeWidth={0.5} strokeDasharray="4,4"
          />

          {/* Eğri */}
          <path d={buildPath()} fill="none" stroke={channel.color} strokeWidth={2} />

          {/* Kontrol noktaları */}
          {points.map((p, i) => {
            const { sx, sy } = toSVG(p);
            return (
              <circle
                key={i}
                cx={sx} cy={sy} r={5}
                fill={draggingIdx === i ? channel.color : '#1a1a1a'}
                stroke={channel.color}
                strokeWidth={2}
                className="cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown(i)}
              />
            );
          })}
        </svg>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-1 transition-colors"
      >
        Reset Channel
      </button>
    </PanelSection>
  );
}
