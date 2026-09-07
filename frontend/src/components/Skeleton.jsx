/* ── Skeleton Loading System ──────────────────────────────────────────── */
// Reusable shimmer-animated loading placeholders.
// Uses the `skeleton-shimmer` keyframe defined in index.css.

export function SkeletonLine({ width = "100%", height = "0.75rem", className = "" }) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-panel border border-line/60 rounded-md px-5 py-4 space-y-3 ${className}`}>
      <SkeletonLine width="60%" height="0.5rem" />
      <SkeletonLine width="45%" height="2rem" />
    </div>
  );
}

export function SkeletonTableRow({ columns = 6, className = "" }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <SkeletonLine width={i === 0 ? "70%" : i === columns - 1 ? "50%" : "85%"} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonChart({ height = "260px", className = "" }) {
  return (
    <div
      className={`bg-panel border border-line/60 rounded-md p-5 ${className}`}
    >
      <SkeletonLine width="35%" height="1rem" className="mb-4" />
      <div
        className="skeleton-shimmer rounded"
        style={{ width: "100%", height }}
      />
    </div>
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 ? "60%" : "100%"}
          height="0.6rem"
        />
      ))}
    </div>
  );
}
