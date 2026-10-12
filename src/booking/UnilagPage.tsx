import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useBasePath } from "./BookingApp";
import { isPreview } from "./api";
import { useSettings } from "./useSettings";
import { formatDate, formatNaira, included, peopleLabel, steps, type BookingSettings } from "./data";
import { BookingFooter, BookingHeader, Icon, PartnerLockup, PreviewBanner, Unavailable } from "./Shell";

export function SlotsTracker({ settings }: { settings: BookingSettings }) {
  const shown = Math.min(settings.slotsFilled, settings.slotTarget);
  const pct = settings.slotTarget ? (shown / settings.slotTarget) * 100 : 0;
  const left = settings.slotTarget - shown;
  return (
    <div className="bk-tracker">
      <div className="bk-tracker-head">
        <p>
          <strong>{shown}</strong> of {settings.slotTarget} slots filled
        </p>
        <span>{left > 0 ? `${left} left` : "Full"}</span>
      </div>
      <div
        className="bk-tracker-bar"
        role="progressbar"
        aria-label="Slots filled"
        aria-valuemin={0}
        aria-valuemax={settings.slotTarget}
        aria-valuenow={shown}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="bk-tracker-note">
        The shoot goes ahead once {settings.slotTarget} people have booked. If we don't get there by{" "}
        {formatDate(settings.refundDeadline)}, every deposit is refunded in full.
      </p>
    </div>
  );
}

export const faqs = (s: BookingSettings) => [
  {
    q: "When and where is the shoot?",
    a: `On the UNILAG campus during convocation, ${s.shootPeriod}. We'll send the exact date, time and meeting point on WhatsApp once the shoot is confirmed.`,
  },
  {
    q: "How do group bookings work?",
    a: "One person pays the deposit for the whole group and gets one group tag. Everyone in the group is shot together, and the balance is paid as a group on the day.",
  },
  {
    q: "Can friends and family help pay my balance?",
    a: "Yes. Tick the Celebrate Me box when you book and you'll get a free gift page from FinZ. Anyone you share it with can send wishes and gifts towards your balance, and it goes straight to Fash Shot It against your group tag.",
  },
  {
    q: "What is an ambassador code?",
    a: "If a Fash ambassador told you about the shoot, enter their code so they get credit. It doesn't change your price.",
  },
  {
    q: "Can I change my group size after booking?",
    a: "Message us on WhatsApp with your group tag and we'll help you sort it out before the shoot.",
  },
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

export default function UnilagPage() {
  const base = useBasePath();
  const { settings, error } = useSettings();
  const [ctaRef, ctaOnScreen] = useOnScreen<HTMLElement>(settings !== null);

  if (!settings) {
    return (
      <div className="bk">
        <BookingHeader subtitle="UNILAG Convocation" />
        {error ? (
          <Unavailable message={error} />
        ) : (
          <div className="bk-loading" aria-busy="true">
            <span className="bk-spinner" />
          </div>
        )}
      </div>
    );
  }

  const full = settings.slotsFilled >= settings.slotTarget;
  const minDeposit = Math.min(...settings.packages.map((p) => p.deposit));
  const ctaLabel = full ? "Join the waitlist" : "Book your slot";

  const checkout = (size?: number) => `${base}/unilag/checkout${size ? `?size=${size}` : ""}`;

  return (
    <div className="bk">
      {isPreview() && <PreviewBanner />}
      <BookingHeader
        subtitle="UNILAG Convocation"
        cta={
          <Link to={checkout()} className="bk-btn bk-btn--primary bk-btn--sm">
            {ctaLabel}
          </Link>
        }
      />

      <section className="bk-hero">
        <div className="bk-wrap bk-hero-inner">
          <p className="bk-eyebrow">UNILAG Convocation · {settings.shootPeriod}</p>
          <h1>Your convocation, shot beautifully.</h1>
          <p className="bk-hero-sub">
            Photos, headshots, gown and props on the day, by Fash Shot It. Book alone or with up to 5 friends, and pay
            just half now.
          </p>
          <div className="bk-hero-actions">
            <Link to={checkout()} className="bk-btn bk-btn--accent">
              {ctaLabel}
            </Link>
            <a href="#packages" className="bk-btn bk-btn--ghost">
              See packages
            </a>
          </div>
        </div>
      </section>

      <div className="bk-wrap bk-tracker-wrap">
        <SlotsTracker settings={settings} />
      </div>

      <section id="packages" className="bk-section">
        <div className="bk-wrap">
          <h2 className="bk-h2">Packages</h2>
          <p className="bk-lead">One price per group. The more of you, the less each person pays.</p>
          <div className="bk-packages">
            {settings.packages.map((p) => (
              <article key={p.size} className="bk-pkg">
                <header>
                  <span className="bk-pkg-icon">
                    <Icon name={p.size === 1 ? "camera" : "users"} />
                  </span>
                  <h3>{peopleLabel(p.size)}</h3>
                </header>
                <p className="bk-pkg-total">{formatNaira(p.total)}</p>
                <p className="bk-pkg-each">
                  {p.size > 1 ? `${formatNaira(Math.round(p.total / p.size))} per person` : "Just you"}
                </p>
                <dl>
                  <div>
                    <dt>Deposit now</dt>
                    <dd>{formatNaira(p.deposit)}</dd>
                  </div>
                  <div>
                    <dt>On shoot day</dt>
                    <dd>{formatNaira(p.total - p.deposit)}</dd>
                  </div>
                </dl>
                <Link to={checkout(p.size)} className="bk-btn bk-btn--outline bk-btn--block">
                  {full ? "Join the waitlist" : `Book for ${p.size}`}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bk-section bk-section--alt">
        <div className="bk-wrap">
          <h2 className="bk-h2">What's included</h2>
          <p className="bk-lead">Every package comes with all of this, for everyone in your group.</p>
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

      <section className="bk-section">
        <div className="bk-wrap">
          <h2 className="bk-h2">How it works</h2>
          <ol className="bk-steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="bk-step-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bk-section bk-section--tight">
        <div className="bk-wrap">
          <div className="bk-partner">
            <div>
              <PartnerLockup />
              <h2>Let friends and family chip in</h2>
              <p>
                Book with Fash and get a free Celebrate Me gift page and flier from FinZ. Share it on your socials, and
                the people who love you can send wishes and gifts, and help pay your balance before the big day.
              </p>
            </div>
            <span className="bk-partner-icon">
              <Icon name="gift" size={40} />
            </span>
          </div>
        </div>
      </section>

      <section id="book" ref={ctaRef} className="bk-section bk-section--alt">
        <div className="bk-wrap bk-cta">
          <h2 className="bk-h2">{full ? "All slots are taken" : "Ready to book?"}</h2>
          <p className="bk-lead">
            {full
              ? "Join the waitlist and we'll message you first if we open more slots."
              : `Pay a 50% deposit, from ${formatNaira(minDeposit)}, to lock in your slot. It takes about two minutes.`}
          </p>
          <Link to={checkout()} className="bk-btn bk-btn--primary">
            {ctaLabel} <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>

      <section id="refunds" className="bk-section">
        <div className="bk-wrap bk-policy">
          <div>
            <h2 className="bk-h2">Refund policy</h2>
            <ul className="bk-policy-list">
              <li>
                If we don't reach {settings.slotTarget} confirmed students by {formatDate(settings.refundDeadline)}, the
                shoot won't go ahead and your deposit is refunded in full, including any processing fees, to your
                original payment method within 10 working days.
              </li>
              <li>If Fash Shot It cancels or reschedules, you get a full refund or can move your booking to the new date.</li>
              <li>
                If you cancel after the shoot is confirmed, your deposit isn't refundable, because your slot and
                preparation are already committed. You can pass your booking to another student by contacting us with
                your group tag at least 7 days before the shoot.
              </li>
              <li>If you don't show up, the deposit is forfeited and no balance is due.</li>
              <li>Your remaining 50% is paid on the day of your shoot. Quote your group tag for any request.</li>
            </ul>
          </div>
          <div>
            <h2 className="bk-h2">Questions</h2>
            <div className="bk-faq">
              {faqs(settings).map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
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
        <Link to={checkout()} className="bk-btn bk-btn--primary bk-btn--sm" tabIndex={ctaOnScreen ? -1 : 0}>
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
