import { clientLogos } from "../data/site";

export default function ClientLogos() {
  // Rendered twice so the CSS marquee can loop seamlessly
  const loop = [...clientLogos, ...clientLogos];
  return (
    <section className="section section-tight" aria-label="Clients">
      <div className="container">
        <div className="logo-marquee">
          <ul className="logo-track">
            {loop.map((logo, i) => (
              <li key={i} aria-hidden={i >= clientLogos.length}>
                <img src={logo.src} alt={logo.alt} loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
