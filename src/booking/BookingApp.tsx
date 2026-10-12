import { createContext, useContext, useEffect } from "react";
import { Route, Routes } from "react-router";
import BookingPage from "./BookingPage";
import Confirmation from "./Confirmation";
import "./booking.css";

/**
 * On bookings.fashshotit.com the booking page is the whole site (base "").
 * On fashshotit.com and in dev it lives under /book, so it can be previewed
 * before the subdomain is pointed at the Worker.
 */
const BasePath = createContext("");
export const useBasePath = () => useContext(BasePath);

export default function BookingApp({ base }: { base: string }) {
  useEffect(() => {
    document.body.classList.add("bk-body");
    const prevTitle = document.title;
    document.title = "Book your UNILAG convocation shoot — Fash Shot It";
    return () => {
      document.body.classList.remove("bk-body");
      document.title = prevTitle;
    };
  }, []);

  return (
    <BasePath.Provider value={base}>
      <Routes>
        <Route index element={<BookingPage />} />
        <Route path="confirmed" element={<Confirmation />} />
        <Route path="*" element={<BookingPage />} />
      </Routes>
    </BasePath.Provider>
  );
}
