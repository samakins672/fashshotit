import { Link, useSearchParams } from "react-router";
import { useBasePath } from "./BookingApp";
import BookingForm, { WaitlistForm } from "./BookingForm";
import { isPreview } from "./api";
import { useSettings } from "./useSettings";
import { BookingFooter, BookingHeader, PreviewBanner, SettingsGate } from "./Shell";

export default function Checkout() {
  const base = useBasePath();
  const [params, setParams] = useSearchParams();
  const { settings, error } = useSettings();

  if (!settings) return <SettingsGate error={error} />;

  const sizes = settings.packages.map((p) => p.size);
  const requested = Number(params.get("size"));
  const size = sizes.includes(requested) ? requested : sizes[0];
  const full = settings.slotsFilled >= settings.slotTarget;

  // Keep the chosen size in the URL so a refresh or back button lands on the same package
  const onSizeChange = (n: number) =>
    setParams(
      (p) => {
        p.set("size", String(n));
        return p;
      },
      { replace: true },
    );

  return (
    <div className="bk">
      {isPreview() && <PreviewBanner />}
      <BookingHeader />

      <main className="bk-wrap bk-checkout">
        <div className="bk-checkout-intro">
          <Link to={`${base}/unilag`} className="bk-back">
            <span aria-hidden="true">←</span> Back to packages
          </Link>
          <h1>{full ? "Join the waitlist" : "Book your slot"}</h1>
          <p className="bk-lead">
            {full
              ? "All slots are taken. Leave your details and we'll message you first if we open more."
              : `UNILAG Convocation · ${settings.shootPeriod}. Pay half now, the rest on shoot day.`}
          </p>
        </div>

        {full ? (
          <div className="bk-checkout-narrow">
            <WaitlistForm />
          </div>
        ) : (
          <BookingForm settings={settings} size={size} onSizeChange={onSizeChange} />
        )}
      </main>

      <BookingFooter />
    </div>
  );
}
