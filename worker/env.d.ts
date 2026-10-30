declare global {
  interface Env {
    DB: D1Database;
    RESEND_API_KEY?: string;
    PAYSTACK_SECRET_KEY?: string;
    PAYSTACK_PUBLIC_KEY?: string;
    WRAPP_KIT_URL?: string;
    CONTACT_TO: string;
    CONTACT_FROM: string;
  }
}

export {};
