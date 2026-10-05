import { useMemo, useState } from "react";
import { Link } from "react-router";
import { categories, portfolio, type Category, type MediaItem, type PortfolioItem } from "../data/site";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";

function ItemBody({ item }: { item: PortfolioItem }) {
  const icon = item.project ? "↗" : item.media?.type === "youtube" ? "▶" : "+";
  return (
    <>
      <img src={item.thumb} alt={item.title} loading="lazy" decoding="async" />
      <span className="portfolio-overlay">
        <span className="portfolio-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="portfolio-caption">
          <span className="portfolio-title">{item.title}</span>
          <span className="portfolio-tags">{item.tags}</span>
        </span>
      </span>
    </>
  );
}

export default function Portfolio() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => portfolio.filter((p) => filter === "all" || p.categories.includes(filter)),
    [filter],
  );
  // Lightbox cycles through the visible items that open media (not project pages)
  const media = useMemo(() => visible.flatMap((p) => (p.media ? [p.media] : [])), [visible]);

  return (
    <section className="section" id="portfolio">
      <div className="container">
        <div className="portfolio-header">
          <h2 className="heading-h2">
            <Reveal as="span" variant="wipe">
              Portfolio
            </Reveal>
          </h2>
          <button
            type="button"
            className="filter-toggle"
            aria-expanded={filtersOpen}
            aria-controls="portfolio-filters"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            Filter
          </button>
          <div id="portfolio-filters" className={`filters${filtersOpen ? " is-open" : ""}`} role="group" aria-label="Filter portfolio">
            {categories.map((c) => (
              <button
                key={c.value}
                type="button"
                className={filter === c.value ? "is-active" : ""}
                aria-pressed={filter === c.value}
                onClick={() => {
                  setFilter(c.value);
                  setFiltersOpen(false);
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="portfolio-grid">
          {visible.map((item, i) => (
            <Reveal key={item.title} variant="wipe" delay={(i % 3) * 120} className="portfolio-cell">
              {item.project ? (
                <Link to={`/work/${item.project}`} className="portfolio-item">
                  <ItemBody item={item} />
                </Link>
              ) : (
                <button
                  type="button"
                  className="portfolio-item"
                  onClick={() => setLightboxIndex(media.indexOf(item.media as MediaItem))}
                >
                  <ItemBody item={item} />
                </button>
              )}
            </Reveal>
          ))}
        </div>
      </div>
      <Lightbox items={media} index={lightboxIndex} onChange={setLightboxIndex} />
    </section>
  );
}
