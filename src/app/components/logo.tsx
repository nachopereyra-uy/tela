export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`font-display text-ink relative inline-flex items-baseline ${className ?? ""}`}
      style={{ fontSize: 30, lineHeight: 1 }}
    >
      Tela
      <span
        className="absolute rounded-full bg-blue"
        style={{ width: 7, height: 7, top: 4, right: -10 }}
        aria-hidden="true"
      />
    </span>
  );
}
