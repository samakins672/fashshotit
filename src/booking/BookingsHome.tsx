import { Link } from "react-router";
import { contact } from "../data/site";
import { useBasePath } from "./BookingApp";
import { isPreview } from "./api";
import { useSettings } from "./useSettings";
import { defaultSettings, formatNaira, occasions, services } from "./data";
import { BookingFooter, BookingHeader, Icon, PhotoHero, PreviewBanner } from "./Shell";
import { SlotsBar } from "./UnilagPage";

const quoteLink = (service: string) =>
  `${contact.whatsapp}?text=${encodeURIComponent(`Hi Fash Shot It, I'd like a quote for a ${service.toLowerCase()}.`)}`;

export default function BookingsHome() {
  const base = useBasePath();
  // If the booking API is down the card still links through; the UNILAG page explains the outage
  const { settings } = useSettings();
  const unilag = settings ?? defaultSettings;
  const from = Math.min(...unilag.packages.map((p) => p.total));

  return (
    <div className="bk">
      {isPreview() && <PreviewBanner />}
      <BookingHeader />

      <PhotoHero
        image="/images/media/events/FSI (76 of 682).webp"
        eyebrow="Book Fash Shot It"
        title="Moments worth keeping, shot right."
      >
        <p className="bk-hero-sub">
          Studio sessions, video coverage and drone shoots for {occasions.slice(0, -1).join(", ").toLowerCase()} and{" "}
          {occasions[occasions.length - 1].toLowerCase()} across Lagos.
        </p>
        <div className="bk-hero-actions">
          <Link to={`${base}/unilag`} className="bk-btn bk-btn--accent">
            Book UNILAG convocation
          </Link>
          <a href="#services" className="bk-btn bk-btn--ghost">
            Plan your own shoot
          </a>
        </div>
      </PhotoHero>

      <section className="bk-section">
        <div className="bk-wrap">
          <div className="bk-section-head">
            <h2 className="bk-h2">Open now</h2>
            <span className="bk-muted">1 campaign</span>
          </div>
          <Link to={`${base}/unilag`} className="bk-event">
            <div className="bk-event-media">
              <img src="/images/media/portraits/FSI_7628.webp" alt="Graduates in convocation gowns" />
              <span className="bk-pill">{unilag.shootPeriod}</span>
            </div>
            <div className="bk-event-body">
              <span className="bk-kicker">UNILAG Convocation</span>
              <h3>Your convocation, shot beautifully</h3>
              <p>Photos, headshots, gown and props on the day. Book alone or as a group of up to 6.</p>
              {settings && <SlotsBar settings={settings} />}
              <div className="bk-event-foot">
                <span>
                  <span className="bk-event-from">From </span>
                  <strong>{formatNaira(from)}</strong>
                </span>
                <span className="bk-btn bk-btn--accent">
                  See packages <Icon name="arrow" size={18} />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section id="services" className="bk-section bk-section--last">
        <div className="bk-wrap">
          <div className="bk-section-head bk-section-head--split">
            <div>
              <h2 className="bk-h2">Book for your own event</h2>
              <p className="bk-lead">Tell us your date and what you're celebrating. We'll send a quote on WhatsApp.</p>
            </div>
            <ul className="bk-chips" aria-label="Occasions we cover">
              {occasions.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
          <div className="bk-services">
            {services.map((s) => (
              <article key={s.title}>
                <img src={s.image} alt="" loading="lazy" decoding="async" />
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <div className="bk-services-foot">
                    <span className="bk-muted">From {s.price}</span>
                    <a className="bk-btn bk-btn--outline bk-btn--sm" href={quoteLink(s.title)} target="_blank" rel="noreferrer">
                      Get a quote
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BookingFooter />
    </div>
  );
}
