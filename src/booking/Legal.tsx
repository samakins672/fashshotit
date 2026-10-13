import { Link } from "react-router";
import { contact } from "../data/site";
import { useBasePath } from "./BookingApp";
import { BookingFooter, BookingHeader } from "./Shell";

type Section = { title: string; text: string };

// TODO: have Fash (and a lawyer) review both pages before launch.
const UPDATED = "13 October 2026";

const privacy: Section[] = [
  {
    title: "What we collect",
    text: "Your name, WhatsApp number, email, faculty and department, and the names of the people in your group. Paystack handles your card or bank details; we never see them.",
  },
  {
    title: "Why we collect it",
    text: "To manage your booking, contact you about the shoot, keep payment records and deliver your photos.",
  },
  {
    title: "Who we share it with",
    text: "Paystack, to process your payment. FinZ Africa, only if you tick the Celebrate Me box, so Melody can set up your gift page. We never sell your data.",
  },
  {
    title: "Marketing",
    text: "We only send offers and updates if you ask us to, and you can opt out at any time.",
  },
  {
    title: "How long we keep it",
    text: "Booking and payment records are kept for as long as Nigerian law requires. You can ask us to delete anything we don't need to keep.",
  },
  {
    title: "Your rights",
    text: `You can ask to see, correct or delete your data, or withdraw your consent, by emailing ${contact.email}. This policy follows the Nigeria Data Protection Act, 2023.`,
  },
  {
    title: "Contact",
    text: `Fash Shot It Media, Lagos. ${contact.email} · WhatsApp ${contact.phoneDisplay}`,
  },
];

const terms: Section[] = [
  {
    title: "Booking and deposit",
    text: "Your slot is confirmed once Paystack confirms your 50% deposit. We'll email you a group tag; quote it for anything about your booking.",
  },
  {
    title: "Balance",
    text: "The remaining 50% is paid on shoot day. Gifts from your Celebrate Me page are paid straight to Fash Shot It and come off your balance.",
  },
  {
    title: "Minimum numbers",
    text: "Group shoots like UNILAG Convocation go ahead only if the target is reached by the deadline on the booking page. If not, every deposit is refunded in full, including processing fees, to your original payment method within 10 working days.",
  },
  {
    title: "Cancellations",
    text: "If Fash Shot It cancels or reschedules, you get a full refund or can move your booking to the new date. If you cancel after the shoot is confirmed, your deposit isn't refundable, but you can pass your booking to another student by messaging us with your group tag at least 7 days before the shoot.",
  },
  {
    title: "On the day",
    text: "Arrive at your time slot with your group tag. If you don't show up, the deposit is forfeited and no balance is due.",
  },
  {
    title: "Gown and props",
    text: "Gowns and props belong to Fash Shot It and must be returned before you leave the shoot.",
  },
  {
    title: "Contact",
    text: `Questions about these terms: ${contact.email} · WhatsApp ${contact.phoneDisplay}`,
  },
];

function LegalPage({ title, intro, sections, other }: { title: string; intro: string; sections: Section[]; other: "privacy" | "terms" }) {
  const base = useBasePath();
  return (
    <div className="bk">
      <BookingHeader />
      <main className="bk-wrap bk-legal">
        <span className="bk-pill">Last updated {UPDATED}</span>
        <h1>{title}</h1>
        <p className="bk-lead">{intro}</p>
        {sections.map((s, i) => (
          <section key={s.title}>
            <h2>
              {i + 1}. {s.title}
            </h2>
            <p>{s.text}</p>
          </section>
        ))}
        <Link to={`${base}/${other}`} className="bk-back">
          {other === "terms" ? "Read the terms of booking" : "Read the privacy policy"} <span aria-hidden="true">→</span>
        </Link>
      </main>
      <BookingFooter />
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="How Fash Shot It Media collects, uses and protects your personal data, in line with the Nigeria Data Protection Act, 2023."
      sections={privacy}
      other="terms"
    />
  );
}

export function Terms() {
  return (
    <LegalPage
      title="Terms of booking"
      intro="The terms that apply when you book a shoot with Fash Shot It Media."
      sections={terms}
      other="privacy"
    />
  );
}
