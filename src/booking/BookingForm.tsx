import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useBasePath } from "./BookingApp";
import { joinWaitlist, startCheckout, type CheckoutRequest } from "./api";
import { formatNaira, peopleLabel, type BookingSettings } from "./data";
import { Icon, PartnerLockup } from "./Shell";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Accepts 0803…, 803…, 234803… or +234 803… and returns +234XXXXXXXXXX, or null. */
export function normalisePhone(input: string) {
  const digits = input.replace(/[^\d]/g, "");
  const local = digits.startsWith("234") ? digits.slice(3) : digits.replace(/^0/, "");
  return /^[789]\d{9}$/.test(local) ? `+234${local}` : null;
}

type Errors = Partial<Record<keyof CheckoutRequest, string>>;

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className={`bk-field${error ? " has-error" : ""}`}>
      <span className="bk-label">{label}</span>
      {children}
      {error ? <span className="bk-error">{error}</span> : hint ? <span className="bk-hint">{hint}</span> : null}
    </label>
  );
}

export function PackagePicker({
  settings,
  value,
  onChange,
}: {
  settings: BookingSettings;
  value: number;
  onChange: (size: number) => void;
}) {
  return (
    <div className="bk-picker" role="radiogroup" aria-label="Group size">
      {settings.packages.map((p) => (
        <button
          type="button"
          key={p.size}
          role="radio"
          aria-checked={value === p.size}
          className={`bk-picker-opt${value === p.size ? " is-on" : ""}`}
          onClick={() => onChange(p.size)}
        >
          <strong>{p.size}</strong>
          <span>{p.size === 1 ? "person" : "people"}</span>
        </button>
      ))}
    </div>
  );
}

export default function BookingForm({
  settings,
  size,
  onSizeChange,
}: {
  settings: BookingSettings;
  size: number;
  onSizeChange: (size: number) => void;
}) {
  const base = useBasePath();
  const pkg = settings.packages.find((p) => p.size === size) ?? settings.packages[0];
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    faculty: "",
    department: "",
    ambassadorCode: new URLSearchParams(window.location.search).get("ref")?.toUpperCase() ?? "",
    consent: false,
    marketingOptIn: false,
    finzOptIn: false,
  });
  const [members, setMembers] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Keep one optional name box per extra group member
  useEffect(() => {
    setMembers((m) => Array.from({ length: size - 1 }, (_, i) => m[i] ?? ""));
  }, [size]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (form.name.trim().split(/\s+/).length < 2) e.name = "Enter your first name and surname.";
    if (!normalisePhone(form.phone)) e.phone = "Enter a Nigerian WhatsApp number, like 0803 123 4567.";
    if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (!form.faculty.trim()) e.faculty = "Enter your faculty.";
    if (!form.department.trim()) e.department = "Enter your department.";
    if (!form.consent) e.consent = "Please agree to the privacy notice to continue.";
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSubmitting(true);
    setFormError("");
    const res = await startCheckout(
      {
        ...form,
        packageSize: size,
        name: form.name.trim(),
        phone: normalisePhone(form.phone)!,
        email: form.email.trim(),
        members: members.map((m) => m.trim()),
      },
      settings,
      `${base}/confirmed`,
    );
    if (!res.ok) {
      setFormError(res.error);
      setSubmitting(false);
      return;
    }
    window.location.assign(res.data.url);
  };

  const isGroup = size > 1;

  return (
    <form className="bk-form" onSubmit={onSubmit} noValidate>
      <fieldset className="bk-fieldset">
        <legend>1. Choose your package</legend>
        <PackagePicker settings={settings} value={size} onChange={onSizeChange} />
        <p className="bk-picker-note">
          {peopleLabel(pkg.size)} · {formatNaira(pkg.total)} total
          {isGroup && <> · {formatNaira(Math.round(pkg.total / pkg.size))} each</>}
        </p>
      </fieldset>

      <fieldset className="bk-fieldset">
        <legend>2. Your details</legend>
        <p className="bk-fieldset-note">
          {isGroup
            ? "You're paying for the group, so we'll send the booking to you."
            : "We'll send your booking and group tag here."}
        </p>
        <div className="bk-grid-2">
          <Field label="Full name" error={errors.name}>
            <input name="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="WhatsApp number" error={errors.phone}>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0803 123 4567"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Faculty" error={errors.faculty}>
            <input name="faculty" placeholder="e.g. Engineering" value={form.faculty} onChange={(e) => set("faculty", e.target.value)} />
          </Field>
          <Field label="Department" error={errors.department}>
            <input
              name="department"
              placeholder="e.g. Systems Engineering"
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
            />
          </Field>
          <Field label="Ambassador code (optional)" hint="If a Fash ambassador referred you. It doesn't change the price.">
            <input
              name="ambassadorCode"
              autoCapitalize="characters"
              value={form.ambassadorCode}
              onChange={(e) => set("ambassadorCode", e.target.value.toUpperCase())}
            />
          </Field>
        </div>

        {isGroup && (
          <div className="bk-members">
            <span className="bk-label">Who else is in your group? (optional)</span>
            <div className="bk-grid-2">
              {members.map((m, i) => (
                <input
                  key={i}
                  aria-label={`Group member ${i + 2} name`}
                  placeholder={`Member ${i + 2}'s name`}
                  value={m}
                  onChange={(e) => setMembers((all) => all.map((x, j) => (j === i ? e.target.value : x)))}
                />
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="bk-fieldset">
        <legend>3. Agree and pay</legend>

        <label className={`bk-check${errors.consent ? " has-error" : ""}`}>
          <input type="checkbox" name="consent" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} />
          <span>
            I agree to Fash Shot It using my details to manage this booking, as set out in the{" "}
            <a href="#privacy">privacy notice</a>.
          </span>
        </label>
        {errors.consent && <span className="bk-error bk-error--check">{errors.consent}</span>}

        <label className="bk-check">
          <input type="checkbox" checked={form.marketingOptIn} onChange={(e) => set("marketingOptIn", e.target.checked)} />
          <span>Send me Fash Shot It offers and updates. I can opt out at any time.</span>
        </label>

        <label className={`bk-check bk-check--finz${form.finzOptIn ? " is-on" : ""}`}>
          <input type="checkbox" checked={form.finzOptIn} onChange={(e) => set("finzOptIn", e.target.checked)} />
          <span>
            <PartnerLockup size="sm" />
            <strong>
              {isGroup
                ? "Set up my free Celebrate Me gift page and group savings with FinZ."
                : "Set up my free Celebrate Me gift page with FinZ."}
            </strong>{" "}
            Friends and family can send wishes and gifts, and help pay your balance. If you tick this, we share your
            name, phone, email, group tag, package and balance with FinZ Africa to set it up.
          </span>
        </label>

        <div className="bk-summary" aria-live="polite">
          <div>
            <span>Package</span>
            <span>
              {peopleLabel(pkg.size)} · {formatNaira(pkg.total)}
            </span>
          </div>
          <div>
            <span>Balance on shoot day</span>
            <span>{formatNaira(pkg.total - pkg.deposit)}</span>
          </div>
          <div className="bk-summary-total">
            <span>Pay now (50% deposit)</span>
            <span>{formatNaira(pkg.deposit)}</span>
          </div>
        </div>

        {formError && (
          <p className="bk-form-error" role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className="bk-btn bk-btn--primary bk-btn--block" disabled={submitting}>
          {submitting ? "Opening secure checkout…" : `Pay ${formatNaira(pkg.deposit)} deposit`}
        </button>
        <p className="bk-secure">
          <Icon name="lock" size={16} /> Secure payment by Paystack. Card, bank transfer or USSD.
        </p>
      </fieldset>
    </form>
  );
}

export function WaitlistForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [formError, setFormError] = useState("");

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Enter your name.";
    if (!normalisePhone(form.phone)) e.phone = "Enter a Nigerian WhatsApp number, like 0803 123 4567.";
    if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setState("sending");
    const res = await joinWaitlist({ name: form.name.trim(), phone: normalisePhone(form.phone)!, email: form.email.trim() });
    if (!res.ok) {
      setFormError(res.error);
      setState("idle");
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div className="bk-form bk-done">
        <span className="bk-done-icon">
          <Icon name="check" size={28} />
        </span>
        <h3>You're on the waitlist</h3>
        <p>If more slots open, we'll message you on WhatsApp first.</p>
      </div>
    );
  }

  return (
    <form className="bk-form" onSubmit={onSubmit} noValidate>
      <fieldset className="bk-fieldset">
        <legend>Join the waitlist</legend>
        <p className="bk-fieldset-note">All slots are taken. Leave your details and we'll reach out if more open up. We only use them to contact you about this shoot.</p>
        <div className="bk-grid-2">
          <Field label="Full name" error={errors.name}>
            <input name="name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="WhatsApp number" error={errors.phone}>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0803 123 4567"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
        </div>
        {formError && (
          <p className="bk-form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="bk-btn bk-btn--primary bk-btn--block" disabled={state === "sending"}>
          {state === "sending" ? "Adding you…" : "Join the waitlist"}
        </button>
      </fieldset>
    </form>
  );
}
