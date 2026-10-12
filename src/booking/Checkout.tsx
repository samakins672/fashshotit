import { Link, useSearchParams } from "react-router";
import { useBasePath } from "./BookingApp";
import BookingForm, { WaitlistForm } from "./BookingForm";
import { isPreview } from "./api";
import { useSettings } from "./useSettings";
import { formatDate } from "./data";
import { BookingFooter, BookingHeader, Icon, PreviewBanner, Unavailable } from "./Shell";

export default function Checkout() {
  const base = useBasePath();
  const [params, setParams] = useSearchParams();
  const { settings, error } = useSettings();

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
      <BookingHeader subtitle="UNILAG Convocation" />

      <main className="bk-section bk-checkout">
        <div className="bk-wrap bk-book">
          <div className="bk-book-intro">
            <Link to={`${base}/unilag`} className="bk-back">
              <span aria-hidden="true">←</span> Back to packages
            </Link>
            <h1 className="bk-h2">{full ? "Join the waitlist" : "Book your slot"}</h1>
            <p className="bk-lead">
              {full
                ? "All slots are taken. Leave your details and we'll message you first if we open more."
                : "Pay a 50% deposit to lock in your slot. Your booking is confirmed as soon as Paystack confirms your payment."}
            </p>
            {!full && (
              <ul className="bk-assure">
                <li>
                  <Icon name="lock" size={18} /> Secure payment by Paystack
                </li>
                <li>
                  <Icon name="clock" size={18} /> Balance is paid on shoot day, {settings.shootPeriod}
                </li>
                <li>
                  <Icon name="check" size={18} />
                  <span>
                    Full refund if we don't reach {settings.slotTarget} people by {formatDate(settings.refundDeadline)}.{" "}
                    <Link to={`${base}/unilag#refunds`}>Refund policy</Link>
                  </span>
                </li>
              </ul>
            )}
          </div>

          <div>
            {full ? <WaitlistForm /> : <BookingForm settings={settings} size={size} onSizeChange={onSizeChange} />}

            <details id="privacy" className="bk-privacy">
              <summary>Privacy notice</summary>
              <p>
                Fash Shot It Media collects your name, WhatsApp number, email, faculty and department, and your group
                members' names, to manage your booking, contact you about the shoot and keep payment records. Payments
                are processed by Paystack; we never see your card details. We keep booking records for as long as the
                law requires and don't sell your data. We only send offers if you ask us to, and only share your details
                with FinZ Africa if you tick the Celebrate Me box. You can ask to see, correct or delete your data at any
                time by emailing media@fashshotit.com. This notice follows the Nigeria Data Protection Act, 2023.
              </p>
            </details>
          </div>
        </div>
      </main>

      <BookingFooter />
    </div>
  );
}
