import { useState, type FormEvent, type ReactNode } from "react";
import { contact } from "../data/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

type Status = { state: "idle" } | { state: "sending" } | { state: "sent" } | { state: "error"; message: string };

type Fields = { name: string; email: string; message: string };

function validate({ name, email, message }: Fields): string | null {
  if (!name.trim()) return "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
  if (message.trim().length < 5) return "Please enter a message (at least 5 characters).";
  return null;
}

function Field({ id, label, children, filled }: { id: string; label: string; children: ReactNode; filled: boolean }) {
  return (
    <div className={`field${filled ? " is-filled" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export default function Contact() {
  const [fields, setFields] = useState<Fields>({ name: "", email: "", message: "" });
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const set = (key: keyof Fields) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const error = validate(fields);
    if (error) {
      setStatus({ state: "error", message: error });
      return;
    }
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, company }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        setStatus({ state: "sent" });
      } else {
        setStatus({ state: "error", message: data?.error ?? "Something went wrong. Please try again." });
      }
    } catch {
      setStatus({ state: "error", message: "Something went wrong. Please try again." });
    }
  }

  return (
    <section className="section" id="contact">
      <div className="container">
        <SectionHeading title="Get In Touch" />
        <div className="contact-grid">
          <div>
            {status.state === "sent" ? (
              <p className="form-success" role="status">
                Your message was sent, thank you!
              </p>
            ) : (
              <Reveal>
                <form className="contact-form" onSubmit={onSubmit} noValidate>
                  <div className="form-row">
                    <Field id="name" label="Name" filled={!!fields.name}>
                      <input id="name" name="name" type="text" autoComplete="name" required value={fields.name} onChange={set("name")} />
                    </Field>
                    <Field id="email" label="Email" filled={!!fields.email}>
                      <input id="email" name="email" type="email" autoComplete="email" required value={fields.email} onChange={set("email")} />
                    </Field>
                  </div>
                  <Field id="message" label="Write your message..." filled={!!fields.message}>
                    <textarea id="message" name="message" rows={7} required minLength={5} value={fields.message} onChange={set("message")} />
                  </Field>
                  {/* Honeypot field, hidden from people and assistive tech */}
                  <div className="hp" aria-hidden="true">
                    <label htmlFor="company">Company</label>
                    <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn" disabled={status.state === "sending"}>
                      {status.state === "sending" ? "Sending…" : "Send Message"}
                    </button>
                  </div>
                  {status.state === "error" && (
                    <p className="form-error" role="alert">
                      {status.message}
                    </p>
                  )}
                </form>
              </Reveal>
            )}
          </div>

          <div className="contact-info">
            <Reveal>
              <span className="contact-label">Email</span>
              <a href={`mailto:${contact.email}`} className="contact-value">
                {contact.email}
              </a>
            </Reveal>
            <Reveal delay={100}>
              <span className="contact-label">Phone / WhatsApp</span>
              <a href={`tel:${contact.phone}`} className="contact-value">
                {contact.phoneDisplay}
              </a>
            </Reveal>
            <Reveal delay={200}>
              <span className="contact-label">Address</span>
              <address className="contact-value">
                {contact.address[0]}
                <br />
                {contact.address[1]}
              </address>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
