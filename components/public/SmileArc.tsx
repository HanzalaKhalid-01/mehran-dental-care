export function SmileArc({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 200"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 20 C 150 180, 450 180, 600 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
