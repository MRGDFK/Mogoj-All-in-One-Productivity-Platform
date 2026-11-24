/** Four quadrants: Projects, Areas, Resources, Archive. Projects (active work) is the lit one. */
export function MogojMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <rect x="1" y="1" width="8" height="8" rx="2.5" fill="var(--brand)" />
      <rect x="11" y="1" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.55" />
      <rect x="1" y="11" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.35" />
      <rect x="11" y="11" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.18" />
    </svg>
  );
}
