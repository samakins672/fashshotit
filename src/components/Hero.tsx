import { useState } from "react";
import { heroVideo } from "../data/site";
import { usePrefersReducedMotion } from "../hooks";
import Reveal from "./Reveal";

export default function Hero() {
  const reducedMotion = usePrefersReducedMotion();
  const [videoReady, setVideoReady] = useState(false);
  const { id, start, end } = heroVideo;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: id,
    start: String(start),
    end: String(end),
    playsinline: "1",
    modestbranding: "1",
    rel: "0",
    disablekb: "1",
    iv_load_policy: "3",
  });

  return (
    <section className="hero" id="home">
      <div className="hero-media" aria-hidden="true">
        {!reducedMotion && (
          <iframe
            className={`hero-video${videoReady ? " is-ready" : ""}`}
            src={`https://www.youtube-nocookie.com/embed/${id}?${params}`}
            title="Showreel background video"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
            // Give the player a moment to start so the poster image shows instead of a black frame
            onLoad={() => setTimeout(() => setVideoReady(true), 1200)}
          />
        )}
      </div>
      <div className="container hero-content">
        <h1 className="hero-heading">
          <Reveal as="span" variant="wipe">
            Take your shots
          </Reveal>
        </h1>
        <p className="hero-subheading">
          <Reveal as="span" variant="wipe" delay={200}>
            Bring your moments to life through photos, films &amp; drone shots that go <strong>Beyond Imagination.</strong>
          </Reveal>
        </p>
      </div>
      <a href="#portfolio" className="scroll-cue">
        <span className="mouse" aria-hidden="true">
          <span className="wheel" />
        </span>
        <span className="scroll-label">Scroll</span>
      </a>
    </section>
  );
}
