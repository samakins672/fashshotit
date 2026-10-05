import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import Lightbox from "../components/Lightbox";
import Reveal from "../components/Reveal";
import { projects, type MediaItem } from "../data/site";
import NotFound from "./NotFound";

export default function ProjectPage() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const media = useMemo<MediaItem[]>(
    () => project?.images.map((src) => ({ type: "image", src, caption: project.title })) ?? [],
    [project],
  );

  useEffect(() => {
    if (project) document.title = `${project.title} — Fash Shot It`;
  }, [project]);

  if (!project) return <NotFound />;

  const idx = projects.indexOf(project);
  const next = projects[(idx + 1) % projects.length];

  return (
    <article className="section project">
      <div className="container">
        <Link to="/#portfolio" className="back-link">
          <span aria-hidden="true">←</span> Back to Portfolio
        </Link>
        <h1 className="project-title">
          <Reveal as="span" variant="wipe">
            {project.title}
          </Reveal>
        </h1>

        <div className="project-grid">
          <div className="project-gallery">
            {project.images.map((src, i) => (
              <Reveal key={src} variant="wipe" delay={i * 120}>
                <button type="button" className="project-image" onClick={() => setLightboxIndex(i)} aria-label={`View image ${i + 1} of ${project.images.length}`}>
                  <img src={src} alt={`${project.title} — image ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} />
                </button>
              </Reveal>
            ))}
          </div>

          <aside className="project-sidebar">
            <div className="project-sticky">
              <Reveal className="detail">
                <span className="detail-label">Project Description</span>
                {project.description.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </Reveal>
              {project.details.map((d, i) => (
                <Reveal key={d.label} className="detail" delay={(i + 1) * 80}>
                  <span className="detail-label">{d.label}</span>
                  <span className="detail-value">{d.value}</span>
                </Reveal>
              ))}
            </div>
          </aside>
        </div>

        {project.testimonial && (
          <Reveal className="project-testimonial">
            <figure className="testimonial">
              <div className="testimonial-bubble">
                <span className="quote-mark" aria-hidden="true">
                  &ldquo;
                </span>
                <blockquote>{project.testimonial.quote}</blockquote>
              </div>
              <figcaption>
                {project.testimonial.avatar && <img src={project.testimonial.avatar} alt="" width={60} height={60} />}
                <strong>{project.testimonial.name}</strong>
                <span>{project.testimonial.role}</span>
              </figcaption>
            </figure>
          </Reveal>
        )}

        <nav className="project-next" aria-label="Next project">
          <span className="detail-label">Next Project</span>
          <Link to={`/work/${next.slug}`}>
            {next.title} <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
      <Lightbox items={media} index={lightboxIndex} onChange={setLightboxIndex} />
    </article>
  );
}
