declare global {
  interface Env {
    DB: D1Database;
    RESEND_API_KEY?: string;
    PAYSTACK_SECRET_KEY?: string;
    PAYSTACK_PUBLIC_KEY?: string;
    MELODY_WHATSAPP?: string;
  }
}

export {};
