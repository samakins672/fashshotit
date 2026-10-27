import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { contact, navLinks, socials } from "../data/site";
import { useBasePath } from "./BookingApp";

/** Where the main site's pages live: the same origin under /bookings, or fashshotit.com on the bookings host. */
function useSiteRoot() {
  return useBasePath() ? "" : "https://fashshotit.com";
}

/** The main site's nav, kept solid black so it reads over photos and plain pages alike. */
export function BookingHeader() {
  const base = useBasePath();
  const site = useSiteRoot();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close the menu after navigating, and let Escape close it
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  const sections = navLinks.filter((l) => !l.to);
  const left = sections.slice(0, 3);
  const right = sections.slice(3);
  const sectionHref = (id: string) => `${site}/#${id}`;
  const bookHome = base || "/";

  return (
    <>
      <header className="bk-nav">
        <nav className="bk-nav-inner" aria-label="Main">
          <ul className="bk-nav-list bk-nav-list--left">
            {left.map((l) => (
              <li key={l.id}>
                <a href={sectionHref(l.id)}>{l.label}</a>
              </li>
            ))}
          </ul>
          <a href={`${site}/`} className="bk-nav-logo" aria-label="Fash Shot It home">
            <img src="/images/logo-tr.png" alt="Fash Shot It" width="60" height="60" />
          </a>
          <ul className="bk-nav-list">
            {right.map((l) => (
              <li key={l.id}>
                <a href={sectionHref(l.id)}>{l.label}</a>
              </li>
            ))}
            <li>
              <Link to={bookHome} className="bk-nav-book">
                Book
              </Link>
            </li>
          </ul>
          <button
            type="button"
            className="bk-menu-btn"
            aria-expanded={open}
            aria-controls="bk-menu"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" size={20} /> Menu
          </button>
        </nav>
      </header>

      <div id="bk-menu" className={`bk-menu${open ? " is-open" : ""}`} aria-hidden={!open} role="dialog" aria-label="Menu">
        <div className="bk-menu-top">
          <button type="button" className="bk-menu-btn" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            Close <Icon name="close" size={18} />
          </button>
        </div>
        <ul className="bk-menu-list">
          <li>
            <a href={`${site}/`} tabIndex={open ? 0 : -1}>
              Home
            </a>
          </li>
          {sections.map((l) => (
            <li key={l.id}>
              <a href={sectionHref(l.id)} tabIndex={open ? 0 : -1}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <Link to={bookHome} className="is-book" tabIndex={open ? 0 : -1}>
              Book
            </Link>
          </li>
        </ul>
        <div className="bk-menu-sub">
          <span>Bookings</span>
          <Link to={`${base}/unilag`} tabIndex={open ? 0 : -1}>
            UNILAG Convocation
          </Link>
          <Link to={`${base}/privacy`} tabIndex={open ? 0 : -1}>
            Privacy
          </Link>
          <Link to={`${base}/terms`} tabIndex={open ? 0 : -1}>
            Terms
          </Link>
        </div>
      </div>
    </>
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
    <div className="bk-wrap bk-state" role="alert">
      <h1>Bookings are unavailable right now</h1>
      <p>{message} If it keeps happening, message us on WhatsApp.</p>
      <button type="button" className="bk-btn bk-btn--outline" onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  );
}

/** Page frame for the UNILAG pages while settings load, or when the API is down. */
export function SettingsGate({ error }: { error: string }) {
  return (
    <div className="bk">
      <BookingHeader />
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

/** "Wrapp by FinZ": FinZ's own logo, since Wrapp is a FinZ product. */
export function WrappMark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className={`bk-cm-mark bk-cm-mark--${size}`}>
      <img src="/images/partners/finz.png" alt="" />
      <span>
        Wrapp <small>by FinZ</small>
      </span>
    </span>
  );
}

export function BookingFooter() {
  const base = useBasePath();
  return (
    <footer className="bk-footer">
      <div className="bk-wrap bk-footer-inner">
        <div>
          <img src="/images/logo-tr.png" alt="Fash Shot It" width="64" height="64" className="bk-footer-logo" />
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
        <span>
          © {new Date().getFullYear()} Fash Shot It Media · <Link to={`${base}/privacy`}>Privacy</Link> ·{" "}
          <Link to={`${base}/terms`}>Terms</Link>
        </span>
        <span>Payments secured by Paystack</span>
      </div>
    </footer>
  );
}

/** Full-bleed photo hero that fills the first screen under the nav. */
export function PhotoHero({
  image,
  imagePosition,
  eyebrow,
  title,
  children,
  aside,
}: {
  image: string;
  imagePosition?: string;
  eyebrow: string;
  title: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="bk-hero">
      <img src={image} alt="" className="bk-hero-img" style={{ objectPosition: imagePosition }} fetchPriority="high" />
      <div className="bk-wrap bk-hero-inner">
        <div className="bk-hero-copy">
          <span className="bk-pill">{eyebrow}</span>
          <h1>{title}</h1>
          {children}
        </div>
        {aside}
      </div>
    </section>
  );
}

const paths = {
  check: "M5 12.5l4.5 4.5L19 7.5",
  copy: "M9 9h10v10H9zM5 15V5h10",
  arrow: "M5 12h14M13 6l6 6-6 6",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3",
  chat: "M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-3.9-1z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
