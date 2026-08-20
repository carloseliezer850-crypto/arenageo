type RoutePageProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function RoutePage({ title, description, children }: RoutePageProps) {
  return (
    <main className="container page-shell">
      <section className="content-panel">
        <div className="page-header">
          <p className="eyebrow">ArenaGeo</p>
          <h1>{title}</h1>
          {description ? <p className="page-description">{description}</p> : null}
        </div>
        {children}
      </section>
    </main>
  );
}
