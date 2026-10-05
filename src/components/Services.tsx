import { services } from "../data/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <SectionHeading title="My Services" />
        <div className="services-grid">
          {services.map((s, i) => (
            <Reveal key={s.title.join(" ")} className="service" delay={(i % 3) * 100}>
              <img src={s.icon} alt="" width={45} height={45} />
              <h3>
                {s.title[0]}
                <br />
                {s.title[1]}
              </h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
