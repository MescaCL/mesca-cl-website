interface StatsProps {
  projects: number;
  posts: number;
  milestones: number;
  yearsActive: number;
}

export function Stats({ projects, posts, milestones, yearsActive }: StatsProps) {
  const stats = [
    { value: projects, label: 'Projects shipped', suffix: '' },
    { value: posts, label: 'Articles written', suffix: '' },
    { value: milestones, label: 'Milestones reached', suffix: '' },
    { value: yearsActive, label: 'Years building', suffix: '+' },
  ];

  return (
    <section className="container py-16 md:py-20">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/80 bg-card px-5 py-7 text-center shadow-sm transition-colors hover:border-primary/30"
          >
            <p className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {stat.value}
              <span className="text-primary">{stat.suffix}</span>
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}