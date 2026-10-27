import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useBasePath } from "./BookingApp";
import { getBooking, isPreview, type Booking } from "./api";
import { buildWrappKitUrl, formatNaira, peopleLabel } from "./data";
import { contact } from "../data/site";
import { BookingFooter, BookingHeader, Icon, PreviewBanner, WrappMark } from "./Shell";

const POLL_MS = 2500;
const POLL_LIMIT = 24;

type State =
  | { kind: "loading" }
  | { kind: "pending"; booking?: Booking }
  | { kind: "slow" }
  | { kind: "confirmed"; booking: Booking }
  | { kind: "error"; message: string };

function CopyButton({ text, label = "Copy Tag" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };
  return (
    <button type="button" className="bk-tag-copy" onClick={copy}>
      <Icon name={copied ? "check" : "copy"} size={14} />
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}

export default function Confirmation() {
  const base = useBasePath();
  const [params] = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!reference) {
      setState({ kind: "error", message: "This link is missing a booking reference." });
      return;
    }
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

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

  const giftUrl =
    state.kind === "confirmed"
      ? state.booking.giftPageUrl || buildWrappKitUrl(state.booking.balance)
      : "";
  const shareText = `I booked my UNILAG convocation shoot with Fash Shot It. You can help me cover the balance with a gift: ${giftUrl}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

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
          <div className="bk-confirm-inner">
            <div className="bk-confirm-head">
              <span className="bk-confirm-icon">
                <Icon name="check" size={32} />
              </span>
              <h1>You're booked, {state.booking.name.split(" ")[0]}!</h1>
              <p>
                Your slot for UNILAG Convocation ({state.booking.shootPeriod}) is locked in. Full order details
                have been emailed to <strong>{state.booking.email}</strong>.
              </p>
            </div>

            {/* Unified Booking Pass & Receipt */}
            <article className="bk-pass">
              {/* Pass Header / Tag Stub */}
              <div className="bk-pass-stub">
                <div className="bk-pass-stub-head">
                  <span className="bk-pass-tag-label">Official Group Tag</span>
                  <CopyButton text={state.booking.reference} />
                </div>
                <div className="bk-pass-tag-code">{state.booking.reference}</div>
                <p className="bk-pass-tag-note">Quote this tag on shoot day and in any message to us. Share with your group.</p>
              </div>

              {/* Pass Details / Order Breakdown */}
              <div className="bk-pass-body">
                <div className="bk-card-title">
                  <h2>Order Summary</h2>
                  <span className="bk-status-pill">Deposit Paid</span>
                </div>

                <dl className="bk-dl">
                  <div>
                    <dt>Shoot Event</dt>
                    <dd>UNILAG Convocation ({state.booking.shootPeriod})</dd>
                  </div>
                  <div>
                    <dt>Package size</dt>
                    <dd>{peopleLabel(state.booking.packageSize)}</dd>
                  </div>
                  {(state.booking.faculty || state.booking.department) && (
                    <div>
                      <dt>Faculty / Dept</dt>
                      <dd>{[state.booking.faculty, state.booking.department].filter(Boolean).join(" • ")}</dd>
                    </div>
                  )}
                  {state.booking.phone && (
                    <div>
                      <dt>Contact Phone</dt>
                      <dd>{state.booking.phone}</dd>
                    </div>
                  )}
                  {state.booking.members.length > 0 && (
                    <div>
                      <dt>Group members</dt>
                      <dd>{[state.booking.name, ...state.booking.members].join(", ")}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Total package</dt>
                    <dd>{formatNaira(state.booking.total)}</dd>
                  </div>
                  <div>
                    <dt>Deposit paid (50%)</dt>
                    <dd className="bk-paid-val">
                      <span>{formatNaira(state.booking.depositPaid)}</span>
                      <span className="bk-badge-paid">Paid</span>
                    </dd>
                  </div>
                  <div className="bk-dl-total">
                    <dt>Balance on shoot day</dt>
                    <dd>{formatNaira(state.booking.balance)}</dd>
                  </div>
                </dl>
              </div>

              {/* Pass Footer / Next Steps */}
              <div className="bk-pass-steps">
                <h3>What happens next</h3>
                <ol className="bk-steps-list">
                  <li>
                    <strong>Check your email</strong> &mdash; we sent your full receipt and order summary to{" "}
                    {state.booking.email}.
                  </li>
                  <li>
                    <strong>WhatsApp coordination</strong> &mdash; our team will message{" "}
                    {state.booking.phone || "your phone"} with the exact campus meeting point and call time.
                  </li>
                  <li>
                    <strong>Show up on shoot day</strong> &mdash; quote your group tag and pay the remaining{" "}
                    {formatNaira(state.booking.balance)} balance.
                  </li>
                </ol>
              </div>
            </article>

            {/* Wrapp Celebration Kit Companion Card */}
            <section className="bk-card bk-wrapp-card">
              <div className="bk-wrapp-header">
                <WrappMark />
              </div>
              <h2>Let friends and family cover your balance.</h2>
              <p>
                Make a free Wrapp page for your convocation. Friends and family can send you graduation gifts,
                and the money goes directly to your own account, not to Fash Shot It. You pay your balance on shoot day as usual.
              </p>
              <div className="bk-wrapp-actions">
                <a className="bk-btn bk-btn--primary" href={giftUrl} target="_blank" rel="noreferrer">
                  Create your gift page
                </a>
                <a className="bk-btn bk-btn--outline" href={shareUrl} target="_blank" rel="noreferrer">
                  <Icon name="chat" size={18} /> Share on WhatsApp
                </a>
              </div>
              <p className="bk-wrapp-note">
                Friends can send gifts from 60 days before your shoot date, until a week after it.
              </p>
            </section>

            {/* Support info & Navigation */}
            <div className="bk-confirm-support">
              <p>
                Questions or changes? Chat directly with us on WhatsApp at{" "}
                <a href={contact.whatsapp} target="_blank" rel="noreferrer">
                  {contact.phoneDisplay}
                </a>{" "}
                or email <a href="mailto:media@fashshotit.com">media@fashshotit.com</a>.
              </p>
              <Link to={base || "/"} className="bk-btn bk-btn--outline bk-btn--sm">
                Back to bookings
              </Link>
            </div>
          </div>
        )}
      </main>
      <BookingFooter />
    </div>
  );
}
