import type { ReactNode } from "react";
import { Link } from "react-router";
import { contact, socials } from "../data/site";
import { useBasePath } from "./BookingApp";

export function BookingHeader({ subtitle = "Bookings", cta }: { subtitle?: string; cta?: ReactNode }) {
  const base = useBasePath();
  return (
    <header className="bk-header">
      <div className="bk-wrap bk-header-inner">
        <Link to={base || "/"} className="bk-brand" aria-label="Fash Shot It bookings home">
          <img src="/images/logo-tr.png" alt="" width="40" height="40" />
          <span>
            <strong>Fash Shot It</strong>
            <small>{subtitle}</small>
          </span>
        </Link>
        {cta}
      </div>
    </header>
  );
}

export function PreviewBanner() {
  return (
    <div className="bk-preview" role="status">
      Preview: payments aren't connected yet, so no money is taken and bookings aren't saved.
    </div>
  );
}

/** Shown when the booking API is down, in place of the page content. */
export function Unavailable({ message }: { message: string }) {
  return (
    <div className="bk-wrap bk-confirm-wait" role="alert">
      <h1>Bookings are unavailable right now</h1>
      <p>{message} If it keeps happening, message us on WhatsApp.</p>
      <button type="button" className="bk-btn bk-btn--outline" onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  );
}

export function PartnerLockup({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className={`bk-lockup bk-lockup--${size}`}>
      <img src="/images/partners/finz.png" alt="FinZ" className="bk-lockup-finz" />
      <span aria-hidden="true">×</span>
      <img src="/images/partners/celebrate-me.svg" alt="Celebrate Me" className="bk-lockup-cm" />
    </span>
  );
}

export function BookingFooter() {
  return (
    <footer className="bk-footer">
      <div className="bk-wrap bk-footer-inner">
        <div>
          <img src="/images/logo-tr.png" alt="Fash Shot It" width="56" height="56" className="bk-footer-logo" />
          <p>Photography, video and drone coverage in Lagos.</p>
        </div>
        <div>
          <h3>Questions?</h3>
          <p>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp {contact.phoneDisplay}
            </a>
            <br />
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
          <p className="bk-footer-small">Quote your group tag for anything about your booking.</p>
        </div>
        <div>
          <h3>Follow</h3>
          <ul className="bk-footer-links">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bk-wrap bk-footer-base">
        <span>© {new Date().getFullYear()} Fash Shot It Media</span>
        <span>Payments secured by Paystack · Gift pages by FinZ</span>
      </div>
    </footer>
  );
}

const paths = {
  check: "M5 12.5l4.5 4.5L19 7.5",
  copy: "M9 9h10v10H9zM5 15V5h10",
  arrow: "M5 12h14M13 6l6 6-6 6",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3",
  gift: "M4 10h16v4H4zM6 14h12v6H6zM12 10v10M12 10c-1.5-3-5-3.5-5-1.2C7 10 9.5 10 12 10zm0 0c1.5-3 5-3.5 5-1.2 0 1.2-2.5 1.2-5 1.2z",
  users: "M9 11a3 3 0 100-6 3 3 0 000 6zM3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5M16 5.5a3 3 0 010 5.5M17.5 14c1.6.7 2.7 2.5 3 5",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
} as const;

export function Icon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
