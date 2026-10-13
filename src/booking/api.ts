import { defaultSettings, melodyWhatsapp, type BookingSettings } from "./data";

/**
 * Client for the UNILAG convocation booking API (served by the Worker under
 * /api/bookings/unilag).
 *
 * Until those endpoints exist the settings call returns 404, and the page runs
 * in preview mode: it shows a banner, uses the default settings, and checkout
 * creates a pretend booking in this tab instead of opening Paystack.
 */

export interface CheckoutRequest {
  packageSize: number;
  name: string;
  phone: string;
  email: string;
  faculty: string;
  department: string;
  members: string[];
  ambassadorCode: string;
  consent: boolean;
  marketingOptIn: boolean;
  /** Unticked by default: share booking details with FinZ so Melody can set up a Celebrate Me gift page */
  finzOptIn: boolean;
}

export interface Booking {
  /** Group tag, also the Paystack reference, e.g. FSM-ADEYEMI-012 */
  reference: string;
  /** "pending" until Paystack's webhook confirms the deposit */
  status: "pending" | "confirmed";
  name: string;
  email: string;
  packageSize: number;
  members: string[];
  total: number;
  depositPaid: number;
  balance: number;
  shootPeriod: string;
  finzOptIn: boolean;
  /** Melody's WhatsApp chat link FinZ returns when the payer opted in */
  giftPageUrl?: string;
}

export interface WaitlistRequest {
  name: string;
  phone: string;
  email: string;
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const PREVIEW_KEY = "fsm-preview-bookings";

let previewMode = false;
export const isPreview = () => previewMode;

async function request<T>(path: string, init?: RequestInit): Promise<Result<T> & { status?: number }> {
  try {
    const res = await fetch(`/api/bookings/unilag${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, error: body.error ?? "Something went wrong. Please try again." };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: "We couldn't reach the server. Check your connection and try again." };
  }
}

/** Throws when the API is there but failing, so an outage never falls back to pretend bookings. */
export async function getSettings(): Promise<BookingSettings> {
  const res = await request<BookingSettings>("/settings");
  if (res.ok) {
    previewMode = false;
    return res.data;
  }
  if (res.status !== 404) {
    throw new Error(res.error);
  }
  previewMode = true;
  const params = new URLSearchParams(window.location.search);
  // ?full shows the waitlist state, ?filled=N sets the tracker (preview only)
  const filled = params.has("full") ? defaultSettings.slotTarget : Number(params.get("filled") ?? 32);
  return { ...defaultSettings, slotsFilled: Math.min(filled, defaultSettings.slotTarget) };
}

/** Returns the URL to send the payer to: Paystack checkout, or the confirmation page in preview mode. */
export async function startCheckout(
  req: CheckoutRequest,
  settings: BookingSettings,
  confirmPath: string,
): Promise<Result<{ url: string }>> {
  if (!previewMode) {
    const res = await request<{ authorizationUrl: string }>("/checkout", {
      method: "POST",
      body: JSON.stringify(req),
    });
    return res.ok ? { ok: true, data: { url: res.data.authorizationUrl } } : res;
  }

  const pkg = settings.packages.find((p) => p.size === req.packageSize)!;
  const surname = (req.name.trim().split(/\s+/).pop() ?? "GUEST").toUpperCase().replace(/[^A-Z]/g, "") || "GUEST";
  const reference = `FSM-${surname}-${String(Math.floor(Math.random() * 900) + 100)}`;
  const booking: Booking = {
    reference,
    status: "confirmed",
    name: req.name.trim(),
    email: req.email.trim(),
    packageSize: req.packageSize,
    members: req.members.filter(Boolean),
    total: pkg.total,
    depositPaid: pkg.deposit,
    balance: pkg.total - pkg.deposit,
    shootPeriod: settings.shootPeriod,
    finzOptIn: req.finzOptIn,
    giftPageUrl: req.finzOptIn ? melodyWhatsapp : undefined,
  };
  try {
    const all = JSON.parse(sessionStorage.getItem(PREVIEW_KEY) ?? "{}");
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify({ ...all, [reference]: booking }));
  } catch {
    // Storage blocked: the confirmation page will show "not found", which is fine for a preview
  }
  await new Promise((r) => setTimeout(r, 900));
  return { ok: true, data: { url: `${confirmPath}?reference=${encodeURIComponent(reference)}` } };
}

export async function getBooking(reference: string): Promise<Result<Booking>> {
  const res = await request<Booking>(`/bookings/${encodeURIComponent(reference)}`);
  if (res.ok || res.status !== 404) return res;
  try {
    const preview = JSON.parse(sessionStorage.getItem(PREVIEW_KEY) ?? "{}")[reference];
    if (preview) {
      previewMode = true;
      return { ok: true, data: preview };
    }
  } catch {
    // fall through
  }
  return { ok: false, error: "We couldn't find that booking." };
}

export async function joinWaitlist(req: WaitlistRequest): Promise<Result<{ ok: true }>> {
  if (previewMode) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, data: { ok: true } };
  }
  return request("/waitlist", { method: "POST", body: JSON.stringify(req) });
}
