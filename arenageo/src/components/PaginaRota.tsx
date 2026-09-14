type PaginaRotaProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function PaginaRota({ title, description, children }: PaginaRotaProps) {
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

