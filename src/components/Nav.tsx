import { useEffect, useState } from "react";
import { Link } from "react-router";
import { navLinks } from "../data/site";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 150);
      // Hide when scrolling down past the hero, reveal when scrolling up
      setHidden(y > 350 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const left = navLinks.slice(0, 3);
  const right = navLinks.slice(3);
  const close = () => setMenuOpen(false);

  return (
    <>
      <header className={`site-nav${scrolled ? " is-scrolled" : ""}${hidden && !menuOpen ? " is-hidden" : ""}`}>
        <nav className="container site-nav-inner" aria-label="Main">
          <ul className="nav-list nav-list-left">
            {left.map((l) => (
              <li key={l.id}>
                <Link to={`/#${l.id}`}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <Link to="/" className="site-logo" aria-label="Fash Shot It — home">
            <img src="/images/logo.png" alt="Fash Shot It" width={90} height={90} />
          </Link>
          <ul className="nav-list nav-list-right">
            {right.map((l) => (
              <li key={l.id}>
                <Link to={`/#${l.id}`}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
        </nav>
      </header>

      <div className={`mobile-menu-backdrop${menuOpen ? " is-open" : ""}`} onClick={close} aria-hidden="true" />
      <nav id="mobile-menu" className={`mobile-menu${menuOpen ? " is-open" : ""}`} aria-label="Mobile" aria-hidden={!menuOpen}>
        <button type="button" className="mobile-menu-close" onClick={close} tabIndex={menuOpen ? 0 : -1}>
          Close <span className="close-x" aria-hidden="true" />
        </button>
        <ul>
          <li>
            <Link to="/" onClick={close} tabIndex={menuOpen ? 0 : -1}>
              Home
            </Link>
          </li>
          {navLinks.map((l) => (
            <li key={l.id}>
              <Link to={`/#${l.id}`} onClick={close} tabIndex={menuOpen ? 0 : -1}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
