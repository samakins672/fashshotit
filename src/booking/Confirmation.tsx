import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useBasePath } from "./BookingApp";
import { getBooking, isPreview, type Booking } from "./api";
import { formatNaira, melodyWhatsapp, peopleLabel } from "./data";
import { BookingFooter, BookingHeader, CelebrateMeMark, Icon, PreviewBanner } from "./Shell";

const POLL_MS = 2500;
const POLL_LIMIT = 24; // about a minute

type State =
  | { kind: "loading" }
  | { kind: "pending"; booking?: Booking }
  | { kind: "slow" }
  | { kind: "confirmed"; booking: Booking }
  | { kind: "error"; message: string };

function CopyTag({ tag }: { tag: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the tag is still on screen to copy by hand
    }
  };
  return (
    <section className="bk-tag">
      <span className="bk-kicker">Your group tag</span>
      <div className="bk-tag-row">
        <strong className="bk-tag-value">{tag}</strong>
        <button type="button" className="bk-tag-copy" onClick={copy}>
          <Icon name={copied ? "check" : "copy"} size={16} /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p>Quote this on shoot day and in any message to us. Share it with your group so everyone has it.</p>
    </section>
  );
}

/** Pops up over the confirmation for payers who ticked the Celebrate Me box. */
function MelodyModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.classList.add("menu-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
    };
  }, [onClose]);

  return (
    <div className="bk-modal" onClick={onClose}>
      <div
        ref={ref}
        className="bk-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bk-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="bk-modal-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={20} />
        </button>
        <CelebrateMeMark />
        <h2 id="bk-modal-title">Finish your gift page with Melody</h2>
        <p>
          Melody from FinZ is messaging you on WhatsApp now. Reply to finish your account and celebration page, then
          share it so friends and family can chip in. Gifts go straight to Fash Shot It and come off your{" "}
          {formatNaira(booking.balance)} balance.
        </p>
        <a className="bk-btn bk-btn--primary bk-btn--block" href={booking.giftPageUrl ?? melodyWhatsapp} target="_blank" rel="noreferrer">
          <Icon name="chat" size={18} /> Open chat with Melody
        </a>
        <button type="button" className="bk-modal-later" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

export default function Confirmation() {
  const base = useBasePath();
  const [params] = useSearchParams();
  // Paystack appends ?reference= (and ?trxref=) to the callback URL
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const [state, setState] = useState<State>({ kind: "loading" });
  const [showMelody, setShowMelody] = useState(false);
  const closeMelody = useCallback(() => setShowMelody(false), []);

  // Pop the Melody card up once, as soon as an opted-in booking is confirmed
  const optedIn = state.kind === "confirmed" && state.booking.finzOptIn;
  useEffect(() => {
    if (optedIn) setShowMelody(true);
  }, [optedIn]);

  useEffect(() => {
    if (!reference) {
      setState({ kind: "error", message: "This link is missing a booking reference." });
      return;
    }
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    // The browser redirect never confirms a booking on its own: wait for the webhook to mark it confirmed
    const check = async () => {
      const res = await getBooking(reference);
      if (cancelled) return;
      if (!res.ok) {
        setState({ kind: "error", message: res.error });
        return;
      }
      if (res.data.status === "confirmed") {
        setState({ kind: "confirmed", booking: res.data });
        return;
      }
      tries += 1;
      if (tries >= POLL_LIMIT) {
        setState({ kind: "slow" });
        return;
      }
      setState({ kind: "pending", booking: res.data });
      timer = setTimeout(check, POLL_MS);
    };
    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reference]);

  return (
    <div className="bk">
      {isPreview() && <PreviewBanner />}
      <BookingHeader />
      <main className="bk-wrap bk-confirm">
        {(state.kind === "loading" || state.kind === "pending") && (
          <div className="bk-state" aria-live="polite">
            <span className="bk-spinner" />
            <h1>Confirming your payment…</h1>
            <p>This usually takes a few seconds. Please don't pay again or close this page.</p>
          </div>
        )}

        {state.kind === "slow" && (
          <div className="bk-state">
            <span className="bk-confirm-icon bk-confirm-icon--wait">
              <Icon name="clock" size={30} />
            </span>
            <h1>Still waiting for Paystack</h1>
            <p>
              If you were charged, your booking will be confirmed and emailed to you shortly. Please don't pay again.
              Your reference is <strong>{reference}</strong>.
            </p>
            <button type="button" className="bk-btn bk-btn--outline" onClick={() => window.location.reload()}>
              Check again
            </button>
          </div>
        )}

        {state.kind === "error" && (
          <div className="bk-state">
            <h1>We couldn't find that booking</h1>
            <p>{state.message} If you've paid, message us on WhatsApp with your Paystack receipt.</p>
            <Link to={`${base}/unilag`} className="bk-btn bk-btn--outline">
              Back to booking
            </Link>
          </div>
        )}

        {state.kind === "confirmed" && (
          <>
            <div className="bk-confirm-head">
              <span className="bk-confirm-icon">
                <Icon name="check" size={36} />
              </span>
              <h1>You're booked, {state.booking.name.split(" ")[0]}.</h1>
              <p>
                Your slot for UNILAG Convocation, {state.booking.shootPeriod}, is locked in. We've emailed your receipt
                to <strong>{state.booking.email}</strong>.
              </p>
            </div>

            <div className="bk-confirm-grid">
              <CopyTag tag={state.booking.reference} />

              <section className="bk-receipt">
                <h2>Receipt</h2>
                <dl>
                  <div>
                    <dt>Package</dt>
                    <dd>{peopleLabel(state.booking.packageSize)}</dd>
                  </div>
                  <div>
                    <dt>Total</dt>
                    <dd>{formatNaira(state.booking.total)}</dd>
                  </div>
                  <div>
                    <dt>Deposit paid</dt>
                    <dd>{formatNaira(state.booking.depositPaid)}</dd>
                  </div>
                  {state.booking.members.length > 0 && (
                    <div>
                      <dt>Group</dt>
                      <dd>{[state.booking.name, ...state.booking.members].join(", ")}</dd>
                    </div>
                  )}
                  <div className="bk-receipt-strong">
                    <dt>Balance on shoot day</dt>
                    <dd>{formatNaira(state.booking.balance)}</dd>
                  </div>
                </dl>
              </section>

              <section className="bk-next">
                <h2>What happens next</h2>
                <ol>
                  <li>
                    <strong>Check your email</strong> for the receipt and your tag.
                  </li>
                  <li>
                    <strong>We'll confirm the date on WhatsApp</strong> with the time and meeting point.
                  </li>
                  <li>
                    <strong>Show up on shoot day</strong>, quote your tag and pay the {formatNaira(state.booking.balance)}{" "}
                    balance.
                  </li>
                </ol>
                {state.booking.finzOptIn && (
                  <button type="button" className="bk-link-btn" onClick={() => setShowMelody(true)}>
                    <Icon name="chat" size={18} /> Finish your gift page with Melody
                  </button>
                )}
              </section>
            </div>

            <div className="bk-confirm-back">
              <Link to={base || "/"} className="bk-btn bk-btn--outline">
                Back to bookings
              </Link>
            </div>

            {showMelody && <MelodyModal booking={state.booking} onClose={closeMelody} />}
          </>
        )}
      </main>
      <BookingFooter />
    </div>
  );
}
