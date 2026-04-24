export function PageShell({ eyebrow, title, description, children, aside }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="glass-panel fade-up rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
        <span className="pill">{eyebrow}</span>
        <h2 className="display-font mt-4 text-5xl leading-none sm:text-6xl">
          {title}
        </h2>
        <p className="text-muted mt-4 max-w-3xl text-base leading-7 sm:text-lg">
          {description}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-6">{children}</div>
        <aside className="grid gap-6">{aside}</aside>
      </section>
    </main>
  );
}
