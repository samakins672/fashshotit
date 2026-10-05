import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Nav from "./Nav";
import Footer from "./Footer";

/** Scrolls to `#hash` targets after navigation, or to the top on page change. */
function useScrollRestoration() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    // Wait a frame so the target section has rendered after a route change
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
}

export default function Layout() {
  useScrollRestoration();

  return (
    <>
      <div className="grid-lines" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <Nav />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
