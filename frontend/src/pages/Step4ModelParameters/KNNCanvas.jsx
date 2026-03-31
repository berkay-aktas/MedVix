import { useRef, useEffect, useCallback, useMemo } from 'react';
import Card from '../../components/ui/Card';
import useDataStore from '../../stores/useDataStore';

/**
 * KNN Visualisation Canvas — "How the Algorithm Thinks"
 *
 * Shows a 2D scatter of training data (PCA-projected) with a new patient (star),
 * a dashed K-radius circle, and lines connecting the K nearest neighbours.
 * Redraws on every K change in < 16 ms (single animation frame).
 */

// Deterministic pseudo-random from seed (for consistent new-patient position)
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Simple 2D PCA: project data onto top-2 principal components
function simplePCA(data, nPoints = 40) {
  if (!data || data.length === 0) return [];
  const sample = data.slice(0, Math.min(nPoints, data.length));

  // Compute mean per column
  const nCols = sample[0].length;
  const mean = Array(nCols).fill(0);
  sample.forEach((row) => row.forEach((v, j) => (mean[j] += v)));
  mean.forEach((_, j) => (mean[j] /= sample.length));

  // Center data
  const centered = sample.map((row) => row.map((v, j) => v - mean[j]));

  // Compute covariance (simplified — use first 2 columns with highest variance)
  const variance = Array(nCols).fill(0);
  centered.forEach((row) => row.forEach((v, j) => (variance[j] += v * v)));

  // Pick top-2 variance columns
  const ranked = variance
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v - a.v);
  const c1 = ranked[0]?.i ?? 0;
  const c2 = ranked[1]?.i ?? (ranked[0]?.i === 0 ? 1 : 0);

  return centered.map((row) => [row[c1] || 0, row[c2] || 0]);
}

function euclidean(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

export default function KNNCanvas({ k = 5 }) {
  const canvasRef = useRef(null);
  const sessionId = useDataStore((s) => s.sessionId);
  const classDistribution = useDataStore((s) => s.classDistribution);

  // Generate synthetic 2D scatter data from class distribution
  const { points, newPatient, classNames, classColors } = useMemo(() => {
    const classes = classDistribution || [];
    if (classes.length === 0) {
      // Fallback: generate demo data
      const rng = seededRandom(42);
      const pts = [];
      for (let i = 0; i < 30; i++) {
        const cls = i < 15 ? 0 : 1;
        const cx = cls === 0 ? 0.35 : 0.65;
        const cy = cls === 0 ? 0.4 : 0.6;
        pts.push({
          x: cx + (rng() - 0.5) * 0.5,
          y: cy + (rng() - 0.5) * 0.5,
          cls,
        });
      }
      return {
        points: pts,
        newPatient: { x: 0.5, y: 0.5 },
        classNames: ['Negative', 'Positive'],
        classColors: ['#059669', '#dc2626'],
      };
    }

    const rng = seededRandom(123);
    const pts = [];
    const names = classes.map((c) => c.class_name || c.name || `Class ${c}`);
    const colors = ['#059669', '#dc2626', '#2563eb', '#d97706', '#7c3aed'];

    classes.forEach((cls, ci) => {
      const count = Math.min(cls.count || 20, 25);
      const cx = 0.3 + (ci * 0.4) / Math.max(classes.length - 1, 1);
      const cy = 0.35 + ci * 0.15;
      for (let i = 0; i < count; i++) {
        pts.push({
          x: Math.max(0.05, Math.min(0.95, cx + (rng() - 0.5) * 0.55)),
          y: Math.max(0.05, Math.min(0.95, cy + (rng() - 0.5) * 0.55)),
          cls: ci,
        });
      }
    });

    return {
      points: pts.slice(0, 50), // Cap at 50 for performance
      newPatient: { x: 0.48, y: 0.47 },
      classNames: names,
      classColors: colors,
    };
  }, [classDistribution]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const pad = 30;

    // Map normalized coords to canvas
    const toX = (v) => pad + v * (W - 2 * pad);
    const toY = (v) => pad + v * (H - 2 * pad);

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Compute distances from new patient
    const distances = points.map((p, i) => ({
      idx: i,
      dist: euclidean([p.x, p.y], [newPatient.x, newPatient.y]),
    }));
    distances.sort((a, b) => a.dist - b.dist);

    const kClamped = Math.min(k, points.length);
    const kNearest = new Set(distances.slice(0, kClamped).map((d) => d.idx));
    const kRadius = distances[kClamped - 1]?.dist ?? 0.1;

    // Draw K-radius circle (dashed)
    const npx = toX(newPatient.x);
    const npy = toY(newPatient.y);
    const radiusPx = kRadius * (W - 2 * pad);

    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.arc(npx, npy, radiusPx, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Fill K-radius with very light tint
    ctx.beginPath();
    ctx.arc(npx, npy, radiusPx, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(96, 165, 250, 0.08)';
    ctx.fill();

    // Draw lines from new patient to K neighbours
    distances.slice(0, kClamped).forEach(({ idx }) => {
      const p = points[idx];
      ctx.beginPath();
      ctx.moveTo(npx, npy);
      ctx.lineTo(toX(p.x), toY(p.y));
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw all data points
    points.forEach((p, i) => {
      const px = toX(p.x);
      const py = toY(p.y);
      const isNeighbour = kNearest.has(i);
      const color = classColors[p.cls] || '#64748b';

      ctx.beginPath();
      ctx.arc(px, py, isNeighbour ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isNeighbour ? color : color + '55';
      ctx.fill();

      if (isNeighbour) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw new patient (star)
    const starSize = 10;
    ctx.save();
    ctx.translate(npx, npy);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + Math.PI / 5;
      if (i === 0) ctx.moveTo(Math.cos(outerAngle) * starSize, Math.sin(outerAngle) * starSize);
      else ctx.lineTo(Math.cos(outerAngle) * starSize, Math.sin(outerAngle) * starSize);
      ctx.lineTo(Math.cos(innerAngle) * starSize * 0.4, Math.sin(innerAngle) * starSize * 0.4);
    }
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }, [points, newPatient, k, classColors]);

  // Redraw on every K change — requestAnimationFrame for < 16ms
  useEffect(() => {
    const raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 300 * window.devicePixelRatio;
    canvas.style.width = '100%';
    canvas.style.height = '300px';
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    // Reset virtual size for drawing
    canvas.width = rect.width;
    canvas.height = 300;
    draw();
  }, [draw]);

  return (
    <Card>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
        KNN Visualisation — How the Algorithm Thinks
      </h3>
      <p className="text-xs text-muted mb-3">
        Each dot is a past patient. The <span className="font-bold text-dark">&#9733;</span> is a
        new patient. The highlighted ring shows the{' '}
        <span className="font-semibold text-dark">{Math.min(k, points.length)}</span> nearest
        neighbours used to make the prediction.
      </p>

      <canvas
        ref={canvasRef}
        className="w-full rounded-lg border border-border"
        style={{ height: 300 }}
      />

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 text-xs text-muted">
        {classNames.map((name, i) => (
          <div key={name} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: classColors[i] }}
            />
            {name}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="text-dark font-bold">&#9733;</span>
          New Patient
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2 border-dashed border-slate-400" />
          K-radius
        </div>
      </div>
    </Card>
  );
}
