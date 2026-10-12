import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useBasePath } from "./BookingApp";
import { getBooking, isPreview, type Booking } from "./api";
import { formatNaira, peopleLabel } from "./data";
import { BookingFooter, BookingHeader, Icon, PartnerLockup, PreviewBanner } from "./Shell";

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
    <div className="bk-tag">
      <span className="bk-tag-label">Your group tag</span>
      <span className="bk-tag-value">{tag}</span>
      <button type="button" className="bk-tag-copy" onClick={copy}>
        <Icon name={copied ? "check" : "copy"} size={16} /> {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function CelebrateMe({ booking }: { booking: Booking }) {
  const isGroup = booking.packageSize > 1;
  if (!booking.finzOptIn) {
    return (
      <section className="bk-cm bk-cm--soft">
        <PartnerLockup size="sm" />
        <h2>Want friends and family to chip in?</h2>
        <p>
          Create a free Celebrate Me gift page. Share it, and people can send wishes and gifts, and help pay your{" "}
          {formatNaira(booking.balance)} balance.
        </p>
        <a className="bk-btn bk-btn--outline" href="https://celebrate.ink" target="_blank" rel="noreferrer">
          Find out more
        </a>
      </section>
    );
  }
  return (
    <section className="bk-cm">
      <PartnerLockup />
      <h2>Your free gift page is almost ready</h2>
      <p>
        Open Melody on WhatsApp to finish your Celebrate Me page. It takes about a minute. Share it, and friends and
        family can send wishes and gifts towards your {formatNaira(booking.balance)} balance. Gifts go straight to Fash
        Shot It under your group tag.
      </p>
      <a className="bk-btn bk-btn--whatsapp bk-btn--block" href={booking.giftPageUrl} target="_blank" rel="noreferrer">
        <Icon name="gift" /> Create my gift page on WhatsApp
      </a>
      {isGroup && booking.podUrl && (
        <div className="bk-cm-pod">
          <h3>
            <Icon name="users" /> Save the balance together
          </h3>
          <p>
            Your group's savings pod is set up in the FinZ app, with {formatNaira(booking.balance)} as the goal and shoot
            day as the end date. Start it and share the invite link with your group.
          </p>
          <a className="bk-btn bk-btn--outline bk-btn--block" href={booking.podUrl} target="_blank" rel="noreferrer">
            Open the FinZ app
          </a>
        </div>
      )}
    </section>
  );
}

export default function Confirmation() {
  const base = useBasePath();
  const [params] = useSearchParams();
  // Paystack appends ?reference= (and ?trxref=) to the callback URL
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
      <BookingHeader subtitle="UNILAG Convocation" />
      <main className="bk-wrap bk-confirm">
        {(state.kind === "loading" || state.kind === "pending") && (
          <div className="bk-confirm-wait" aria-live="polite">
            <span className="bk-spinner" />
            <h1>Confirming your payment…</h1>
            <p>This usually takes a few seconds. Please don't pay again or close this page.</p>
          </div>
        )}

        {state.kind === "slow" && (
          <div className="bk-confirm-wait">
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
          <div className="bk-confirm-wait">
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
                <Icon name="check" size={32} />
              </span>
              <h1>You're booked, {state.booking.name.split(" ")[0]}!</h1>
              <p>
                Your deposit is paid and your slot is saved. We've emailed the details to{" "}
                <strong>{state.booking.email}</strong>.
              </p>
            </div>

            <CopyTag tag={state.booking.reference} />

            <dl className="bk-receipt">
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
              <div className="bk-receipt-strong">
                <dt>Balance on shoot day</dt>
                <dd>{formatNaira(state.booking.balance)}</dd>
              </div>
              <div>
                <dt>Shoot</dt>
                <dd>UNILAG convocation, {state.booking.shootPeriod}</dd>
              </div>
              {state.booking.members.length > 0 && (
                <div>
                  <dt>Group</dt>
                  <dd>{[state.booking.name, ...state.booking.members].join(", ")}</dd>
                </div>
              )}
            </dl>

            <CelebrateMe booking={state.booking} />

            <section className="bk-next">
              <h2>What happens next</h2>
              <ol>
                <li>We'll message you on WhatsApp with the exact date, time and meeting point.</li>
                <li>Bring your group tag on the day and pay the {formatNaira(state.booking.balance)} balance.</li>
                <li>Need to change something? Message us with your tag at least 7 days before the shoot.</li>
              </ol>
            </section>
          </>
        )}
      </main>
      <BookingFooter />
    </div>
  );
}
