import { Link } from "react-router";
import { contact } from "../data/site";
import { useBasePath } from "./BookingApp";
import { isPreview } from "./api";
import { useSettings } from "./useSettings";
import { formatNaira, occasions, services } from "./data";
import { BookingFooter, BookingHeader, Icon, PreviewBanner } from "./Shell";

const quoteLink = (service: string) =>
  `${contact.whatsapp}?text=${encodeURIComponent(`Hi Fash Shot It, I'd like a quote for a ${service.toLowerCase()}.`)}`;

export default function BookingsHome() {
  const base = useBasePath();
  // If the booking API is down the card still links through; the UNILAG page explains the outage
  const { settings: unilag } = useSettings();

  const left = unilag ? unilag.slotTarget - Math.min(unilag.slotsFilled, unilag.slotTarget) : null;

  return (
    <div className="bk">
      {isPreview() && <PreviewBanner />}
      <BookingHeader />

      <section className="bk-hero bk-hero--home">
        <div className="bk-wrap bk-hero-inner">
          <p className="bk-eyebrow">Fash Shot It bookings</p>
          <h1>Book your shoot.</h1>
          <p className="bk-hero-sub">
            Photoshoots, video coverage and drone shoots for {occasions.slice(0, -1).join(", ").toLowerCase()} and{" "}
            {occasions[occasions.length - 1].toLowerCase()}, across Lagos.
          </p>
        </div>
      </section>

      <section className="bk-section">
        <div className="bk-wrap">
          <h2 className="bk-h2">Open for booking</h2>
          <p className="bk-lead">Group shoots with set dates and prices. Book a slot and pay a deposit online.</p>

          <Link to={`${base}/unilag`} className="bk-event">
            <img src="/images/media/portraits/FSI_7628.jpg" alt="" />
            <div className="bk-event-body">
              <span className="bk-event-tag">UNILAG Convocation · {unilag?.shootPeriod ?? "March 2027"}</span>
              <h3>Your convocation, shot beautifully</h3>
              <p>Photos, headshots, gown and props on the day. Book alone or as a group of up to 6.</p>
              <div className="bk-event-meta">
                {unilag && (
                  <>
                    <span>From {formatNaira(Math.min(...unilag.packages.map((p) => p.total)))}</span>
                    <span>{left ? `${left} of ${unilag.slotTarget} slots left` : "Waitlist open"}</span>
                  </>
                )}
              </div>
              <span className="bk-btn bk-btn--primary">
                See packages <Icon name="arrow" size={18} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="bk-section bk-section--alt">
        <div className="bk-wrap">
          <h2 className="bk-h2">Book for your own event</h2>
          <p className="bk-lead">
            Tell us your date and what you're celebrating, and we'll send you a quote on WhatsApp.
          </p>
          <div className="bk-services">
            {services.map((s) => (
              <article key={s.title}>
                <img src={s.image} alt="" loading="lazy" decoding="async" />
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <a className="bk-btn bk-btn--outline bk-btn--block" href={quoteLink(s.title)} target="_blank" rel="noreferrer">
                    Get a quote
                  </a>
                </div>
              </article>
            ))}
          </div>
          <ul className="bk-occasions" aria-label="Occasions we cover">
            {occasions.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      </section>

      <BookingFooter />
    </div>
  );
}
