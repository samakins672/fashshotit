import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useBasePath } from "./BookingApp";
import { isPreview } from "./api";
import { useSettings } from "./useSettings";
import { formatDate, formatNaira, included, partners, peopleLabel, steps, type BookingSettings } from "./data";
import { BookingFooter, BookingHeader, Icon, PhotoHero, PreviewBanner, SettingsGate } from "./Shell";

/** Filled/target bar, shared with the bookings home card. */
export function SlotsBar({ settings, note }: { settings: BookingSettings; note?: boolean }) {
  const shown = Math.min(settings.slotsFilled, settings.slotTarget);
  const pct = settings.slotTarget ? (shown / settings.slotTarget) * 100 : 0;
  const left = settings.slotTarget - shown;
  return (
    <div className="bk-slots">
      <div className="bk-slots-head">
        <span>
          {shown} of {settings.slotTarget} slots filled
        </span>
        <span className="bk-slots-left">{left > 0 ? `${left} left` : "Full"}</span>
      </div>
      <div
        className="bk-slots-bar"
        role="progressbar"
        aria-label="Slots filled"
        aria-valuemin={0}
        aria-valuemax={settings.slotTarget}
        aria-valuenow={shown}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
      {note && (
        <p className="bk-slots-note">
          The shoot goes ahead at {settings.slotTarget} people. If we don't get there by{" "}
          {formatDate(settings.refundDeadline)}, everyone gets a full refund.
        </p>
      )}
    </div>
  );
}

export const faqs = (s: BookingSettings) => [
  {
    q: "What if the shoot doesn't happen?",
    a: `If we don't reach ${s.slotTarget} people by ${formatDate(s.refundDeadline)}, the shoot won't go ahead and every deposit is refunded in full, including processing fees, to your original payment method within 10 working days.`,
  },
  {
    q: "When and where is the shoot?",
    a: `On the UNILAG campus during convocation, ${s.shootPeriod}. We'll send the exact date, time and meeting point on WhatsApp once the shoot is confirmed.`,
  },
  {
    q: "How do group bookings work?",
    a: "One person pays the deposit for the whole group and gets one group tag. Everyone in the group is shot together, and the balance is paid as a group on the day.",
  },
  {
    q: "Can friends or family help pay?",
    a: "Yes. After booking you can create a free Wrapp gift page. Friends and family send gifts to you, to your own Wrapp account. Fash Shot It doesn't receive or hold them. You pay your balance on shoot day as normal.",
  },
  {
    q: "Can I cancel after I pay?",
    a: "Once the shoot is confirmed your deposit isn't refundable, but you can pass your booking to another student by messaging us with your group tag at least 7 days before the shoot. If Fash Shot It cancels or reschedules, you get a full refund or can move to the new date.",
  },
  // {
  //   q: "What is an ambassador code?",
  //   a: "If a Fash ambassador told you about the shoot, enter their code so they get credit. It doesn't change your price.",
  // },
];

/** True while the element is on screen (used to hide the sticky bar over the closing call to action). */
function useOnScreen<T extends Element>(ready: boolean) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting), { rootMargin: "0px 0px -20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ready]);
  return [ref, on] as const;
}

function PartnersStrip() {
  // Two copies side by side so the -50% scroll loops without a jump
  const row = [...partners, ...partners];
  return (
    <section className="bk-section bk-partners" aria-labelledby="bk-partners-title">
      <div className="bk-wrap bk-partners-inner">
        <div>
          <span className="bk-kicker">Our partners</span>
          <h2 id="bk-partners-title" className="bk-h2">
            Brought to you with
          </h2>
        </div>
        <div className="bk-marquee">
          <ul className="bk-marquee-track">
            {row.map((p, i) => (
              <li
                key={i}
                aria-hidden={i >= partners.length}
                className={`${p.logo ? "" : "is-empty"}${p.hideName ? " is-standalone" : ""}`}
              >
                {p.logo ? (
                  <>
                    <img src={p.logo} alt={p.hideName ? p.name : ""} />
                    {!p.hideName && <span>{p.name}</span>}
                  </>
                ) : (
                  "Partner logo"
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function UnilagPage() {
  const base = useBasePath();
  const { settings, error } = useSettings();
  const [ctaRef, ctaOnScreen] = useOnScreen<HTMLAnchorElement>(settings !== null);

  if (!settings) return <SettingsGate error={error} />;

  const full = settings.slotsFilled >= settings.slotTarget;
  const minDeposit = Math.min(...settings.packages.map((p) => p.deposit));
  const ctaLabel = full ? "Join the waitlist" : "Book your slot";
  const checkout = (size?: number) => `${base}/unilag/checkout${size ? `?size=${size}` : ""}`;
  // The middle package gets the "Popular" badge
  const popular = settings.packages[Math.floor((settings.packages.length - 1) / 2)]?.size;

  return (
    <div className="bk">
      {isPreview() && <PreviewBanner />}
      <BookingHeader />

      <PhotoHero
        image="/images/media/portraits/FSI_7628.webp"
        imagePosition="center 22%"
        eyebrow={`${settings.shootPeriod} · UNILAG`}
        title="Your convocation, shot beautifully."
        aside={
          <div className="bk-hero-card">
            <SlotsBar settings={settings} note />
          </div>
        }
      >
        <p className="bk-hero-sub">Photos, a headshot, your gown and props, all on the day. Book alone or with up to 5 friends.</p>
        <div className="bk-hero-actions bk-hero-actions--wide">
          <Link to={checkout()} className="bk-btn bk-btn--accent">
            {ctaLabel}
          </Link>
          <a href="#packages" className="bk-btn bk-btn--ghost">
            See packages
          </a>
        </div>
      </PhotoHero>

      <section id="packages" className="bk-section">
        <div className="bk-wrap bk-split">
          <div className="bk-split-intro">
            <h2 className="bk-h2">Pick your package</h2>
            <p className="bk-lead">The bigger the group, the less each person pays. Pay half now to hold your slot, and the rest on shoot day.</p>
            <Link to={checkout()} className="bk-btn bk-btn--primary bk-only-wide">
              {ctaLabel} <Icon name="arrow" size={18} />
            </Link>
          </div>
          <ul className="bk-packages">
            {settings.packages.map((p) => (
              <li key={p.size}>
                <Link to={checkout(p.size)} className={`bk-pkg${p.size === popular ? " is-popular" : ""}`}>
                  <span className="bk-pkg-name">
                    <strong>{p.size === 1 ? "Just me" : peopleLabel(p.size)}</strong>
                    {p.size > 1 && <small>{formatNaira(Math.round(p.total / p.size))} each</small>}
                  </span>
                  <span className="bk-pkg-deposit">{formatNaira(p.deposit)} deposit</span>
                  <strong className="bk-pkg-total">{formatNaira(p.total)}</strong>
                  <Icon name="arrow" size={18} />
                </Link>
              </li>
            ))}
          </ul>
          <Link to={checkout()} className="bk-btn bk-btn--primary bk-btn--block bk-only-narrow">
            {ctaLabel} <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>

      <section className="bk-section bk-section--flush-top">
        <div className="bk-wrap">
          <h2 className="bk-h2">Every package includes</h2>
          <div className="bk-included">
            {included.map((item) => (
              <article key={item.title}>
                <img src={item.image} alt="" loading="lazy" decoding="async" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="bk-section bk-dark">
        <div className="bk-wrap">
          <h2 className="bk-h2">How it works</h2>
          <ol className="bk-steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="bk-step-num">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PartnersStrip />

      <section id="faq" className="bk-section bk-section--last">
        <div className="bk-wrap bk-faq-wrap">
          <div>
            <h2 className="bk-h2">Questions</h2>
            <div id="refunds" className="bk-faq">
              {faqs(settings).map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>
                    {f.q}
                    <Icon name="plus" size={20} />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <Link ref={ctaRef} to={checkout()} className="bk-btn bk-btn--primary bk-faq-cta">
            {full ? "Join the waitlist" : `${ctaLabel} · from ${formatNaira(minDeposit)} today`}
          </Link>
        </div>
      </section>

      <BookingFooter />

      <div className={`bk-sticky${ctaOnScreen ? " is-hidden" : ""}`} aria-hidden={ctaOnScreen}>
        <span>
          {full ? (
            "All slots taken"
          ) : (
            <>
              Deposit from <strong>{formatNaira(minDeposit)}</strong>
            </>
          )}
        </span>
        <Link to={checkout()} className="bk-btn bk-btn--accent bk-btn--sm" tabIndex={ctaOnScreen ? -1 : 0}>
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
