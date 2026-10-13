import { createContext, useContext, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import BookingsHome from "./BookingsHome";
import Checkout from "./Checkout";
import Confirmation from "./Confirmation";
import { Privacy, Terms } from "./Legal";
import UnilagPage from "./UnilagPage";
import "./booking.css";

/**
 * On bookings.fashshotit.com the bookings pages are the whole site (base "").
 * On fashshotit.com they live under /bookings.
 */
const BasePath = createContext("");
export const useBasePath = () => useContext(BasePath);

export default function BookingApp({ base }: { base: string }) {
  const { pathname, hash } = useLocation();

  // Start each page at the top, or at its #section when the link has one
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  useEffect(() => {
    document.body.classList.add("bk-body");
    const prevTitle = document.title;
    document.title = "Bookings — Fash Shot It";
    return () => {
      document.body.classList.remove("bk-body");
      document.title = prevTitle;
    };
  }, []);

  return (
    <BasePath.Provider value={base}>
      <Routes>
        <Route index element={<BookingsHome />} />
        <Route path="unilag" element={<UnilagPage />} />
        <Route path="unilag/checkout" element={<Checkout />} />
        <Route path="unilag/confirmed" element={<Confirmation />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<BookingsHome />} />
      </Routes>
    </BasePath.Provider>
  );
}
