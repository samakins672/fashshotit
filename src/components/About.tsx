import { contact } from "../data/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <SectionHeading title="About Me" />
        <div className="about-grid">
          <Reveal variant="wipe" className="about-figure">
            <img src="/images/about_me.png" alt="Festus of Fash Shot It" loading="lazy" />
          </Reveal>
          <div className="about-copy">
            <h3 className="heading-h3">
              <Reveal as="span" variant="wipe">
                Capturing Life, One Shot at a Time
              </Reveal>
            </h3>
            <Reveal as="p" className="lead">
              Hey! I'm Festus — a passionate Photographer, Creative Videographer, and Licensed Drone Operator. I help
              people and brands tell their stories through stunning visuals.
            </Reveal>
            <Reveal as="p" delay={100}>
              Whether it's a wedding, a music video, a business promo, or a scenic drone shoot, I bring every shot to life
              with precision and heart. Let's work together to create something unforgettable — truly{" "}
              <strong>Beyond Imagination.</strong>
            </Reveal>
            <Reveal as="p" delay={200}>
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="btn">
                Book A Session
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
