// Secrets aren't in wrangler.jsonc, so `wrangler types` can't see them.
interface Env {
  RESEND_API_KEY?: string;
}
