import { useEffect, useState } from "react";
import { testimonials } from "../data/site";
import { usePrefersReducedMotion } from "../hooks";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const count = testimonials.length;

  useEffect(() => {
    if (paused || reducedMotion) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % count), 7000);
    return () => clearTimeout(t);
  }, [active, paused, reducedMotion, count]);

  const go = (i: number) => setActive((i + count) % count);

  return (
    <section className="section" id="testimonials">
      <div className="container">
        <SectionHeading title="My Happy Clients" />
        <Reveal>
          <div
            className="carousel"
            role="region"
            aria-roledescription="carousel"
            aria-label="Client testimonials"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div className="carousel-track" style={{ transform: `translateX(-${active * 100}%)` }}>
              {testimonials.map((t, i) => (
                <figure
                  key={t.name}
                  className="testimonial"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={i !== active}
                >
                  <div className="testimonial-bubble">
                    <span className="quote-mark" aria-hidden="true">
                      &ldquo;
                    </span>
                    <blockquote>{t.quote}</blockquote>
                  </div>
                  <figcaption>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="carousel-controls">
              <button type="button" className="carousel-arrow" aria-label="Previous testimonial" onClick={() => go(active - 1)}>
                ‹
              </button>
              <div className="carousel-dots">
                {testimonials.map((t, i) => (
                  <button
                    key={t.name}
                    type="button"
                    className={i === active ? "is-active" : ""}
                    aria-label={`Show testimonial ${i + 1}`}
                    aria-current={i === active}
                    onClick={() => go(i)}
                  />
                ))}
              </div>
              <button type="button" className="carousel-arrow" aria-label="Next testimonial" onClick={() => go(active + 1)}>
                ›
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
