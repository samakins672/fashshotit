import { Link } from "react-router";
import { socials } from "../data/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link to="/" className="footer-logo">
          <img src="/images/logo-tr.png" alt="Fash Shot It" width={80} />
        </Link>
        <ul className="footer-social">
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="copyright">
          Copyright &copy; {new Date().getFullYear()} All rights reserved
          <br />
          Designed with <span aria-label="love">♥</span> by{" "}
          <a href="https://sannex.ng" target="_blank" rel="noopener noreferrer">
            Sannex Web Services
          </a>
        </p>
      </div>
    </footer>
  );
}
