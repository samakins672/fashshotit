import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import NotFound from "./pages/NotFound";

// Loaded on its own so the booking page stays light on slow mobile connections
const BookingApp = lazy(() => import("./booking/BookingApp"));

/** bookings.fashshotit.com serves only the booking page, at its root */
const isBookingHost = () => window.location.hostname.startsWith("bookings.");

export default function App() {
  if (isBookingHost()) {
    return (
      <Suspense>
        <BookingApp base="" />
      </Suspense>
    );
  }

  return (
    <Routes>
      <Route
        path="book/*"
        element={
          <Suspense>
            <BookingApp base="/book" />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="work/:slug" element={<ProjectPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
