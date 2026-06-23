import type { DigestSection } from './digest-service';

type DigestViewProps = {
  sections: DigestSection[];
};

export function DigestView({ sections }: DigestViewProps) {
  if (sections.length === 0) {
    return (
      <section className="dashboard-panel" aria-labelledby="digest-heading">
        <h2 id="digest-heading">Today&apos;s Digest</h2>
        <p className="muted">No digest has been generated yet.</p>
      </section>
    );
  }

  return (
    <section className="digest-list" aria-labelledby="digest-heading">
      <h2 id="digest-heading">Today&apos;s Digest</h2>
      {sections.map((section) => (
        <div className="dashboard-panel" key={section.category}>
          <h3>{section.title}</h3>
          <div className="article-list">
            {section.articles.map((article) => (
              <article key={article.url} className="article-row">
                <div>
                  <a href={article.url} target="_blank" rel="noreferrer">
                    {article.title}
                  </a>
                  {article.description ? <p>{article.description}</p> : null}
                </div>
                <span>{article.source}</span>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
