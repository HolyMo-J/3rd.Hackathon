export function SummaryCard({ label, value, tone = "default" }) {
  const toneClass =
    tone === "income"
      ? "text-[var(--success)]"
      : tone === "expense"
        ? "text-[var(--danger)]"
        : "text-[var(--foreground)]";

  return (
    <article className="glass-panel rounded-[1.5rem] p-5">
      <p className="text-muted text-sm">{label}</p>
      <strong className={`mt-3 block text-2xl sm:text-3xl ${toneClass}`}>
        {value}
      </strong>
    </article>
  );
}
