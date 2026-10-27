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

function downloadReceiptHtml(booking: Booking) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${booking.reference} - Fash Shot It</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #faf8f5; color: #111; margin: 0; padding: 40px 20px; }
    .receipt { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e7e2d6; }
    .header { text-align: center; border-bottom: 2px dashed #eee; padding-bottom: 24px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; margin: 0 0 6px; }
    .header p { margin: 0; color: #666; font-size: 13px; }
    .tag-box { background: #111; color: #fff; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 24px; }
    .tag-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; }
    .tag-code { font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #e6b800; font-family: monospace; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
    td { padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    td:last-child { text-align: right; font-weight: 600; }
    .total-row td { border-bottom: none; font-size: 16px; font-weight: 800; padding-top: 16px; }
    .paid-badge { background: #e8f5e9; color: #1e7e34; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 6px; }
    .footer { text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; }
    @media print { body { background: #fff; padding: 0; } .receipt { box-shadow: none; border: 1px solid #ddd; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>FASH SHOT IT MEDIA</h1>
      <p>Convocation Booking Receipt &bull; ${booking.shootPeriod}</p>
    </div>
    <div class="tag-box">
      <div class="tag-label">Group Tag</div>
      <div class="tag-code">${booking.reference}</div>
      <div style="font-size: 11px; color: #aaa;">Quote this tag on shoot day</div>
    </div>
    <table>
      <tr><td>Client Name</td><td>${booking.name}</td></tr>
      <tr><td>Email</td><td>${booking.email}</td></tr>
      ${booking.phone ? `<tr><td>Phone</td><td>${booking.phone}</td></tr>` : ""}
      <tr><td>Package</td><td>${peopleLabel(booking.packageSize)}</td></tr>
      <tr><td>Total Cost</td><td>${formatNaira(booking.total)}</td></tr>
      <tr><td>Deposit Paid (50%)</td><td>${formatNaira(booking.depositPaid)} <span class="paid-badge">PAID</span></td></tr>
      <tr class="total-row"><td>Balance Due on Shoot Day</td><td>${formatNaira(booking.balance)}</td></tr>
    </table>
    <div class="footer">
      <p>Questions? Reach us on WhatsApp at +234 706 187 4236 or media@fashshotit.com</p>
      <p>&copy; 2026 Fash Shot It Media. All rights reserved.</p>
    </div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `FashShotIt-Receipt-${booking.reference}.html`;
    a.click();
  }
}

/** Floating Wrapp celebration component docked at bottom-right */
function FloatingWrappKit({
  giftUrl,
  balance,
}: {
  giftUrl: string;
  balance: number;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside className="bk-floating-wrapp" aria-label="Wrapp Celebration Page">
      <div className="bk-floating-wrapp-header">
        <WrappMark size="sm" />
        <button
          type="button"
          className="bk-floating-close"
          onClick={() => setDismissed(true)}
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <div className="bk-floating-body">
        <h4>Cover your balance with gifts</h4>
        <p>
          Let friends & family gift towards your <strong>{formatNaira(balance)}</strong> balance directly on Wrapp.
        </p>

        <div className="bk-floating-actions">
          <a
            href={giftUrl}
            target="_blank"
            rel="noreferrer"
            className="bk-btn bk-btn--accent bk-btn--sm"
          >
            Create gift page &rarr;
          </a>
        </div>
      </div>
    </aside>
  );
}

export default function Confirmation() {
  const base = useBasePath();
  const [params] = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const [state, setState] = useState<State>({ kind: "loading" });
  const [showWrappModal, setShowWrappModal] = useState(true);

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
            <div className="bk-confirm-inner">
              <div className="bk-confirm-head">
                <span className="bk-confirm-icon">
                  <Icon name="check" size={32} />
                </span>
                <h1>You're booked, {state.booking.name.split(" ")[0]}!</h1>
                <p>
                  Your slot for UNILAG Convocation ({state.booking.shootPeriod}) is locked in. Full receipt
                  has been sent to <strong>{state.booking.email}</strong>.
                </p>
              </div>

              {/* Clean, Focused Booking Pass */}
              <article className="bk-pass">
                {/* Official Tag Stub */}
                <div className="bk-pass-stub">
                  <div className="bk-pass-stub-head">
                    <span className="bk-pass-tag-label">Official Group Tag</span>
                    <CopyButton text={state.booking.reference} />
                  </div>
                  <div className="bk-pass-tag-code">{state.booking.reference}</div>
                  <p className="bk-pass-tag-note">Quote this tag on shoot day and in any message to us.</p>
                </div>

                {/* Clean Receipt Breakdown */}
                <div className="bk-pass-body">
                  <div className="bk-card-title">
                    <h2>Receipt Summary</h2>
                    <span className="bk-status-pill">Deposit Paid</span>
                  </div>

                  <dl className="bk-dl">
                    <div>
                      <dt>Package</dt>
                      <dd>{peopleLabel(state.booking.packageSize)}</dd>
                    </div>
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

                  <div className="bk-receipt-actions">
                    <button
                      type="button"
                      className="bk-btn bk-btn--outline bk-btn--block"
                      onClick={() => downloadReceiptHtml(state.booking)}
                    >
                      <Icon name="download" size={17} /> Download Receipt
                    </button>
                  </div>
                </div>

                {/* What Happens Next */}
                <div className="bk-pass-steps">
                  <h3>What happens next</h3>
                  <ol className="bk-steps-list">
                    <li>
                      <strong>Check your email</strong> &mdash; receipt sent to {state.booking.email}.
                    </li>
                    <li>
                      <strong>WhatsApp coordination</strong> &mdash; we will message you with the campus meeting point.
                    </li>
                    <li>
                      <strong>Shoot day on campus</strong> &mdash; quote your tag and settle the remaining {formatNaira(state.booking.balance)} balance.
                    </li>
                  </ol>
                </div>
              </article>

              {/* Back to bookings navigation */}
              <div className="bk-confirm-support">
                <p>
                  Questions? Chat with Fash on WhatsApp at{" "}
                  <a href={contact.whatsapp} target="_blank" rel="noreferrer">
                    {contact.phoneDisplay}
                  </a>.
                </p>
                <Link to={base || "/"} className="bk-btn bk-btn--ghost bk-btn--sm">
                  &larr; Back to bookings
                </Link>
              </div>
            </div>

            {/* Floating Wrapp Component docked at bottom-right */}
            <FloatingWrappKit
              giftUrl={giftUrl}
              balance={state.booking.balance}
            />

            {/* Post-Payment Wrapp Celebration Page Prompt Modal */}
            {showWrappModal && (
              <div className="bk-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="bk-wrapp-modal-title">
                <div className="bk-modal">
                  <div className="bk-modal-header">
                    <WrappMark size="sm" />
                    <button
                      type="button"
                      className="bk-modal-close"
                      onClick={() => setShowWrappModal(false)}
                      aria-label="Close"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="bk-modal-body">
                    <h3 id="bk-wrapp-modal-title">Cover your shoot balance with gifts</h3>
                    <p>
                      Your convocation shoot is locked in! You paid a 50% deposit of{" "}
                      <strong>{formatNaira(state.booking.depositPaid)}</strong>. Your remaining balance is{" "}
                      <strong>{formatNaira(state.booking.balance)}</strong> on shoot day.
                    </p>
                    <div className="bk-modal-callout">
                      Would you like to auto-create a free <strong>Wrapp celebration page</strong>?
                      Friends and family can send you gifts directly to your own account to help cover your balance.
                    </div>
                  </div>

                  <div className="bk-modal-actions">
                    <a
                      href={giftUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bk-btn bk-btn--accent bk-btn--block"
                      onClick={() => setShowWrappModal(false)}
                    >
                      Yes, create my gift page &rarr;
                    </a>
                    <button
                      type="button"
                      className="bk-btn bk-btn--ghost bk-btn--block"
                      onClick={() => setShowWrappModal(false)}
                    >
                      No thanks, view my receipt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <BookingFooter />
    </div>
  );
}
