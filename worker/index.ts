interface ContactPayload {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  // Honeypot: real visitors never fill this in
  company?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function handleContact(request: Request, env: Env): Promise<Response> {
  let data: ContactPayload;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Silently accept bot submissions so they don't retry
  if (typeof data.company === "string" && data.company.trim() !== "") {
    return json({ ok: true });
  }

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";

  if (!name || name.length > 200) {
    return json({ ok: false, error: "Please enter your name." }, 422);
  }
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return json({ ok: false, error: "Please enter a valid email address." }, 422);
  }
  if (message.length < 5 || message.length > 5000) {
    return json({ ok: false, error: "Please enter a message (at least 5 characters)." }, 422);
  }

  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return json({ ok: false, error: "Messaging is temporarily unavailable. Please reach us on WhatsApp." }, 503);
  }

  const to = env.CONTACT_TO.split(",").map((s) => s.trim()).filter(Boolean);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to,
      reply_to: `${name.replace(/[<>"\r\n]/g, "")} <${email}>`,
      subject: `New Booking from ${name.replace(/[\r\n]/g, " ")}`,
      html: `<h3>New message from the website</h3>
<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Message:</strong></p>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return json({ ok: false, error: "Message could not be sent. Please try again later." }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed." }, 405);
      }
      return handleContact(request, env);
    }

    return json({ ok: false, error: "Not found." }, 404);
  },
} satisfies ExportedHandler<Env>;
