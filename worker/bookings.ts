export interface BookingPackage {
  size: number;
  total: number;
  deposit: number;
}

export interface BookingSettings {
  packages: BookingPackage[];
  slotTarget: number;
  slotsFilled: number;
  refundDeadline: string;
  shootPeriod: string;
}

interface BookingRow {
  id: number;
  reference: string;
  status: "pending" | "confirmed" | "cancelled";
  name: string;
  email: string;
  phone: string;
  faculty: string | null;
  department: string | null;
  members: string | null;
  ambassador_code: string | null;
  package_size: number;
  total: number;
  deposit_paid: number;
  balance: number;
  marketing_opt_in: number;
  finz_opt_in: number;
  shoot_period: string;
  paystack_reference: string | null;
  created_at: string;
  paid_at: string | null;
}

const PACKAGES: BookingPackage[] = [
  { size: 1, total: 35_000, deposit: 17_500 },
  { size: 2, total: 50_000, deposit: 25_000 },
  { size: 3, total: 70_000, deposit: 35_000 },
  { size: 4, total: 80_000, deposit: 40_000 },
  { size: 5, total: 90_000, deposit: 45_000 },
  { size: 6, total: 100_000, deposit: 50_000 },
];

const SLOT_TARGET = 50;
const REFUND_DEADLINE = "2027-01-15";
const SHOOT_PERIOD = "March 2027";
const DEFAULT_WRAPP_KIT_URL = "https://wrapp.africa/kit/unilag";

function buildWrappKitUrl(baseUrl: string | undefined, balance: number, date?: string): string {
  const base = baseUrl || DEFAULT_WRAPP_KIT_URL;
  const sep = base.includes("?") ? "&" : "?";
  let url = `${base}${sep}amount=${balance}`;
  if (date) {
    url += `&date=${encodeURIComponent(date)}`;
  }
  return url;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/** Verify Paystack webhook HMAC-SHA512 signature */
async function verifyPaystackSignature(
  signature: string | null,
  rawBody: string,
  secretKey: string
): Promise<boolean> {
  if (!signature || !secretKey) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const hex = Array.from(new Uint8Array(sigBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex.toLowerCase() === signature.toLowerCase();
  } catch (err) {
    console.error("Signature verification error", err);
    return false;
  }
}

/** Send confirmation email to client and notification to team */
async function sendConfirmationEmails(booking: BookingRow, env: Env) {
  if (!env.RESEND_API_KEY) {
    console.warn(
      `[Resend] RESEND_API_KEY is not configured. Booking confirmation email was NOT sent to ${booking.email} (tag: ${booking.reference}).`
    );
    return;
  }

  const membersList: string[] = (() => {
    try {
      return JSON.parse(booking.members || "[]");
    } catch {
      return [];
    }
  })();

  const membersHtml =
    membersList.length > 0
      ? `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 11px 0; color: #666; font-size: 14px;">Group Members:</td>
          <td style="padding: 11px 0; font-weight: 600; text-align: right; color: #111; font-size: 14px;">
            ${escapeHtml([booking.name, ...membersList].join(", "))}
          </td>
        </tr>`
      : "";

  const facultyHtml =
    booking.faculty || booking.department
      ? `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 11px 0; color: #666; font-size: 14px;">Faculty / Dept:</td>
          <td style="padding: 11px 0; font-weight: 600; text-align: right; color: #111; font-size: 14px;">
            ${escapeHtml([booking.faculty, booking.department].filter(Boolean).join(" • "))}
          </td>
        </tr>`
      : "";

  const clientHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmed - Fash Shot It</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; -webkit-font-smoothing: antialiased;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e8e3d8; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
        
        <!-- Header -->
        <tr>
          <td style="background-color: #111111; padding: 28px 32px; text-align: center;">
            <p style="margin: 0 0 6px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #e6b800; font-weight: 800;">Fash Shot It Media</p>
            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Booking & Payment Receipt</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px 32px 24px;">
            <p style="margin: 0 0 14px; font-size: 16px; line-height: 1.5; color: #222;">
              Hi <strong>${escapeHtml(booking.name.split(" ")[0])}</strong>,
            </p>
            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #444;">
              Your convocation photography booking is confirmed! Your 50% deposit has been received and your slot for <strong>UNILAG Convocation (${escapeHtml(booking.shoot_period)})</strong> is secured.
            </p>

            <!-- Group Tag Card -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: #111111; border-radius: 12px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 20px 24px; text-align: center;">
                  <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #999; display: block; margin-bottom: 6px;">Your Official Group Tag</span>
                  <span style="font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #e6b800; display: block; font-family: 'Courier New', Courier, monospace;">${escapeHtml(booking.reference)}</span>
                  <span style="font-size: 12px; color: #aaa; display: block; margin-top: 6px;">Quote this tag on shoot day and in any message to us.</span>
                </td>
              </tr>
            </table>

            <!-- Order Breakdown -->
            <h3 style="margin: 0 0 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; font-weight: 700;">Order Details</h3>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 11px 0; color: #666; font-size: 14px;">Shoot:</td>
                <td style="padding: 11px 0; font-weight: 600; text-align: right; color: #111; font-size: 14px;">UNILAG Convocation (${escapeHtml(booking.shoot_period)})</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 11px 0; color: #666; font-size: 14px;">Package:</td>
                <td style="padding: 11px 0; font-weight: 600; text-align: right; color: #111; font-size: 14px;">${booking.package_size} ${booking.package_size === 1 ? "Person (Solo)" : "People"}</td>
              </tr>
              ${facultyHtml}
              ${membersHtml}
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 11px 0; color: #666; font-size: 14px;">Contact Phone:</td>
                <td style="padding: 11px 0; font-weight: 600; text-align: right; color: #111; font-size: 14px;">${escapeHtml(booking.phone)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 11px 0; color: #666; font-size: 14px;">Total Package:</td>
                <td style="padding: 11px 0; font-weight: 600; text-align: right; color: #111; font-size: 14px;">${formatNaira(booking.total)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 11px 0; color: #666; font-size: 14px;">Deposit Paid (50%):</td>
                <td style="padding: 11px 0; font-weight: 700; text-align: right; color: #1e7e34; font-size: 14px;">
                  ${formatNaira(booking.deposit_paid)} <span style="display: inline-block; background: #e8f5e9; color: #1e7e34; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 6px;">PAID</span>
                </td>
              </tr>
              <tr style="border-bottom: 2px solid #111;">
                <td style="padding: 14px 0; font-weight: 700; color: #111; font-size: 15px;">Balance on Shoot Day:</td>
                <td style="padding: 14px 0; font-weight: 800; text-align: right; color: #111; font-size: 17px;">${formatNaira(booking.balance)}</td>
              </tr>
            </table>

            <!-- Next Steps -->
            <h3 style="margin: 0 0 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; font-weight: 700;">What Happens Next?</h3>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background: #faf8f5; border-radius: 10px; border: 1px solid #eee9df;">
              <tr>
                <td style="padding: 18px 20px;">
                  <div style="margin-bottom: 12px; font-size: 14px; line-height: 1.5; color: #333;">
                    <strong style="color: #111;">1. Keep your group tag handy</strong><br/>
                    Share <strong>${escapeHtml(booking.reference)}</strong> with everyone in your group.
                  </div>
                  <div style="margin-bottom: 12px; font-size: 14px; line-height: 1.5; color: #333;">
                    <strong style="color: #111;">2. WhatsApp schedule confirmation</strong><br/>
                    Our team will reach out to <strong>${escapeHtml(booking.phone)}</strong> with your campus meeting point and exact call time.
                  </div>
                  <div style="font-size: 14px; line-height: 1.5; color: #333;">
                    <strong style="color: #111;">3. Shoot day on campus</strong><br/>
                    Quote your tag, take your photos, and settle the remaining balance of <strong>${formatNaira(booking.balance)}</strong>.
                  </div>
                </td>
              </tr>
            </table>

            <!-- Wrapp Gift Page Callout -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: #fbf9f4; border: 1px solid #e7e2d6; border-radius: 12px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 22px 24px;">
                  <span style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #7c3aed; margin-bottom: 6px;">Wrapp by FinZ</span>
                  <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 800; color: #111;">Let friends and family cover your balance.</h4>
                  <p style="margin: 0 0 16px; font-size: 13.5px; line-height: 1.5; color: #555;">
                    Make a free Wrapp celebration page. Friends and family can send you gifts, and the money goes directly to your own account, not to Fash Shot It. You pay your balance on shoot day as usual.
                  </p>
                  <a href="${escapeHtml(buildWrappKitUrl(env.WRAPP_KIT_URL, booking.balance))}" target="_blank" rel="noreferrer" style="display: inline-block; background-color: #111111; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                    Create your gift page &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <!-- Support -->
            <p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: #666; border-top: 1px solid #eee; padding-top: 18px;">
              Need help or want to adjust details? Chat directly with Fash on WhatsApp at <a href="https://wa.me/2347061874236" style="color: #111; font-weight: 700;">+234 706 187 4236</a> or email <a href="mailto:media@fashshotit.com" style="color: #111;">media@fashshotit.com</a>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f7f5f0; padding: 18px 32px; text-align: center; border-top: 1px solid #e8e3d8;">
            <p style="margin: 0; font-size: 12px; color: #888;">
              &copy; 2026 Fash Shot It Media. Photography, video and drone coverage in Lagos.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Send to client
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [booking.email],
      subject: `Confirmed: UNILAG Convocation Shoot (${booking.reference})`,
      html: clientHtml,
    }),
  }).catch((err) => console.error("Error sending client confirmation email", err));

  // Notify team
  const teamInboxes = env.CONTACT_TO.split(",").map((s) => s.trim()).filter(Boolean);
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: teamInboxes,
      subject: `New Confirmed Booking: ${booking.reference} (${booking.name})`,
      html: `
        <h3>New Confirmed Convocation Booking</h3>
        <p><strong>Tag:</strong> ${escapeHtml(booking.reference)}</p>
        <p><strong>Name:</strong> ${escapeHtml(booking.name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(booking.phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(booking.email)}</p>
        <p><strong>Faculty / Dept:</strong> ${escapeHtml(booking.faculty || "-")} / ${escapeHtml(booking.department || "-")}</p>
        <p><strong>Package Size:</strong> ${booking.package_size}</p>
        <p><strong>Deposit Paid:</strong> ${formatNaira(booking.deposit_paid)}</p>
        <p><strong>Balance:</strong> ${formatNaira(booking.balance)}</p>
        <p><strong>Ambassador Code:</strong> ${escapeHtml(booking.ambassador_code || "None")}</p>
      `,
    }),
  }).catch((err) => console.error("Error notifying team of booking", err));
}

export async function handleBookings(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace(/^\/api\/bookings\/unilag/, "");

  // 1. GET /api/bookings/unilag/settings
  if (path === "/settings" || path === "/settings/") {
    if (request.method !== "GET") {
      return json({ ok: false, error: "Method not allowed." }, 405);
    }

    let slotsFilled = 0;
    if (env.DB) {
      try {
        const row = await env.DB.prepare(
          "SELECT COALESCE(SUM(package_size), 0) AS total FROM bookings WHERE status = 'confirmed'"
        ).first<{ total: number }>();
        slotsFilled = row?.total ?? 0;
      } catch (err) {
        console.error("D1 error fetching slotsFilled:", err);
      }
    }

    const settings: BookingSettings = {
      packages: PACKAGES,
      slotTarget: SLOT_TARGET,
      slotsFilled: Math.min(slotsFilled, SLOT_TARGET),
      refundDeadline: REFUND_DEADLINE,
      shootPeriod: SHOOT_PERIOD,
    };
    return json(settings);
  }

  // 2. POST /api/bookings/unilag/checkout
  if (path === "/checkout" || path === "/checkout/") {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed." }, 405);
    }

    let data: any;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON request." }, 400);
    }

    const packageSize = Number(data.packageSize);
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const phone = typeof data.phone === "string" ? data.phone.trim() : "";
    const email = typeof data.email === "string" ? data.email.trim() : "";
    const faculty = typeof data.faculty === "string" ? data.faculty.trim() : "";
    const department = typeof data.department === "string" ? data.department.trim() : "";
    const members = Array.isArray(data.members)
      ? data.members.map((m: unknown) => (typeof m === "string" ? m.trim() : "")).filter(Boolean)
      : [];
    const ambassadorCode = typeof data.ambassadorCode === "string" ? data.ambassadorCode.trim().toUpperCase() : "";
    const consent = Boolean(data.consent);
    const marketingOptIn = Boolean(data.marketingOptIn);

    if (!packageSize || packageSize < 1 || packageSize > 6) {
      return json({ ok: false, error: "Please select a valid package (1-6 people)." }, 422);
    }
    if (!name || name.length > 200) {
      return json({ ok: false, error: "Please enter your name." }, 422);
    }
    if (!phone || phone.length < 7 || phone.length > 30) {
      return json({ ok: false, error: "Please enter a valid phone number." }, 422);
    }
    if (!EMAIL_RE.test(email) || email.length > 320) {
      return json({ ok: false, error: "Please enter a valid email address." }, 422);
    }
    if (!consent) {
      return json({ ok: false, error: "You must agree to the privacy policy and terms to proceed." }, 422);
    }

    const pkg = PACKAGES.find((p) => p.size === packageSize);
    if (!pkg) {
      return json({ ok: false, error: "Package not found." }, 404);
    }

    // Check capacity if DB is present
    if (env.DB) {
      try {
        const row = await env.DB.prepare(
          "SELECT COALESCE(SUM(package_size), 0) AS total FROM bookings WHERE status = 'confirmed'"
        ).first<{ total: number }>();
        const currentSlots = row?.total ?? 0;
        if (currentSlots + pkg.size > SLOT_TARGET) {
          return json(
            { ok: false, error: "All slots for this shoot are currently filled. Please join our waitlist." },
            409
          );
        }
      } catch (err) {
        console.error("D1 slot check error:", err);
      }
    }

    // Generate unique group tag e.g. FSM-ADEYEMI-123
    const surname = (name.split(/\s+/).pop() ?? "GUEST").toUpperCase().replace(/[^A-Z]/g, "") || "GUEST";
    const rand = Math.floor(100 + Math.random() * 900);
    const reference = `FSM-${surname}-${rand}`;
    const total = pkg.total;
    const depositPaid = pkg.deposit;
    const balance = total - depositPaid;

    // Save initial pending booking to D1
    if (env.DB) {
      try {
        await env.DB.prepare(`
          INSERT INTO bookings (
            reference, status, name, email, phone, faculty, department, members,
            ambassador_code, package_size, total, deposit_paid, balance,
            marketing_opt_in, finz_opt_in, shoot_period, created_at
          ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `)
          .bind(
            reference,
            name,
            email,
            phone,
            faculty || null,
            department || null,
            JSON.stringify(members),
            ambassadorCode || null,
            pkg.size,
            total,
            depositPaid,
            balance,
            marketingOptIn ? 1 : 0,
            0,
            SHOOT_PERIOD
          )
          .run();
      } catch (err) {
        console.error("D1 booking insert error:", err);
        return json({ ok: false, error: "Failed to create booking. Please try again." }, 500);
      }
    }

    const callbackUrl = `${url.origin}/bookings/unilag/confirmed?reference=${encodeURIComponent(reference)}`;

    // If Paystack is configured, initialize transaction
    if (env.PAYSTACK_SECRET_KEY) {
      const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: depositPaid * 100, // amount in kobo
          reference,
          callback_url: callbackUrl,
          metadata: {
            booking_reference: reference,
            name,
            phone,
            package_size: pkg.size,
            custom_fields: [
              { display_name: "Group Tag", variable_name: "group_tag", value: reference },
            ],
          },
        }),
      });

      const paystackData = (await paystackRes.json().catch(() => ({}))) as {
        status?: boolean;
        message?: string;
        data?: { authorization_url: string };
      };

      if (!paystackRes.ok || !paystackData.status || !paystackData.data?.authorization_url) {
        console.error("Paystack initialize error", paystackData);
        return json(
          { ok: false, error: paystackData.message ?? "Payment gateway error. Please try again." },
          502
        );
      }

      return json({ authorizationUrl: paystackData.data.authorization_url });
    }

    // In preview mode or before PAYSTACK_SECRET_KEY is set:
    // auto-confirm the booking in D1 and return the direct callback URL
    if (env.DB) {
      await env.DB.prepare(
        "UPDATE bookings SET status = 'confirmed', paid_at = datetime('now') WHERE reference = ?"
      )
        .bind(reference)
        .run()
        .catch(() => {});
    }
    return json({ authorizationUrl: callbackUrl });
  }

  // 3. POST /api/bookings/unilag/webhook (Paystack webhook)
  if (path === "/webhook" || path === "/webhook/") {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed." }, 405);
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (env.PAYSTACK_SECRET_KEY) {
      const isValid = await verifyPaystackSignature(signature, rawBody, env.PAYSTACK_SECRET_KEY);
      if (!isValid) {
        return json({ ok: false, error: "Invalid signature." }, 401);
      }
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return json({ ok: false, error: "Invalid JSON." }, 400);
    }

    if (event.event === "charge.success" && event.data?.reference) {
      const ref = String(event.data.reference);
      const paystackId = event.data.id ? String(event.data.id) : null;

      if (env.DB) {
        await env.DB.prepare(
          "UPDATE bookings SET status = 'confirmed', paid_at = datetime('now'), paystack_reference = ? WHERE reference = ?"
        )
          .bind(paystackId, ref)
          .run();

        const booking = await env.DB.prepare("SELECT * FROM bookings WHERE reference = ?")
          .bind(ref)
          .first<BookingRow>();

        if (booking) {
          await sendConfirmationEmails(booking, env);
        }
      }
    }

    return json({ ok: true });
  }

  // 4. GET /api/bookings/unilag/bookings/:reference
  if (path.startsWith("/bookings/")) {
    if (request.method !== "GET") {
      return json({ ok: false, error: "Method not allowed." }, 405);
    }

    const rawRef = path.replace(/^\/bookings\//, "").trim();
    const reference = decodeURIComponent(rawRef);

    if (!reference) {
      return json({ ok: false, error: "Reference is required." }, 400);
    }

    if (!env.DB) {
      return json({ ok: false, error: "Database not connected." }, 503);
    }

    let row = await env.DB.prepare("SELECT * FROM bookings WHERE reference = ?")
      .bind(reference)
      .first<BookingRow>();

    if (!row) {
      return json({ ok: false, error: "We couldn't find that booking." }, 404);
    }

    // Fallback: If status is still pending, verify directly with Paystack API.
    // This allows localhost testing and avoids delays if the webhook hasn't arrived yet.
    if (row.status === "pending" && env.PAYSTACK_SECRET_KEY) {
      try {
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
          {
            headers: {
              Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
            },
          }
        );
        const verifyData = (await verifyRes.json().catch(() => ({}))) as {
          status?: boolean;
          data?: {
            status?: string;
            id?: number;
          };
        };

        if (verifyData.status && verifyData.data?.status === "success") {
          const paystackId = verifyData.data.id ? String(verifyData.data.id) : null;
          await env.DB.prepare(
            "UPDATE bookings SET status = 'confirmed', paid_at = datetime('now'), paystack_reference = ? WHERE reference = ?"
          )
            .bind(paystackId, reference)
            .run();

          const updatedRow = await env.DB.prepare("SELECT * FROM bookings WHERE reference = ?")
            .bind(reference)
            .first<BookingRow>();

          if (updatedRow) {
            row = updatedRow;
            await sendConfirmationEmails(updatedRow, env);
          }
        }
      } catch (err) {
        console.error("Paystack direct verification fallback error:", err);
      }
    }

    let members: string[] = [];
    try {
      members = JSON.parse(row.members || "[]");
    } catch {
      members = [];
    }

    const giftPageUrl = buildWrappKitUrl(env.WRAPP_KIT_URL, row.balance);

    return json({
      reference: row.reference,
      status: row.status,
      name: row.name,
      email: row.email,
      phone: row.phone,
      faculty: row.faculty ?? undefined,
      department: row.department ?? undefined,
      packageSize: row.package_size,
      members,
      total: row.total,
      depositPaid: row.deposit_paid,
      balance: row.balance,
      shootPeriod: row.shoot_period,
      giftPageUrl,
    });
  }

  // 5. POST /api/bookings/unilag/waitlist
  if (path === "/waitlist" || path === "/waitlist/") {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed." }, 405);
    }

    let data: any;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON." }, 400);
    }

    const name = typeof data.name === "string" ? data.name.trim() : "";
    const phone = typeof data.phone === "string" ? data.phone.trim() : "";
    const email = typeof data.email === "string" ? data.email.trim() : "";

    if (!name) return json({ ok: false, error: "Please enter your name." }, 422);
    if (!phone) return json({ ok: false, error: "Please enter your phone number." }, 422);
    if (!EMAIL_RE.test(email)) return json({ ok: false, error: "Please enter a valid email." }, 422);

    if (env.DB) {
      try {
        await env.DB.prepare(
          "INSERT INTO waitlist (name, phone, email, created_at) VALUES (?, ?, ?, datetime('now'))"
        )
          .bind(name, phone, email)
          .run();
      } catch (err) {
        console.error("D1 waitlist error:", err);
      }
    }

    // Optionally notify team
    if (env.RESEND_API_KEY) {
      const inboxes = env.CONTACT_TO.split(",").map((s) => s.trim()).filter(Boolean);
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM,
          to: inboxes,
          subject: `New Waitlist Signup: ${name}`,
          html: `<p><strong>${escapeHtml(name)}</strong> joined the UNILAG convocation waitlist.</p>
                 <p>Phone: ${escapeHtml(phone)}<br/>Email: ${escapeHtml(email)}</p>`,
        }),
      }).catch((err) => console.error("Error sending waitlist notification", err));
    }

    return json({ ok: true });
  }

  return json({ ok: false, error: "Endpoint not found." }, 404);
}
