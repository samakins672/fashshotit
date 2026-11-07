/**
 * Paystack's processing fee, passed on to the person paying the deposit: it is added to what they pay so Fash Shot It keeps the whole
 * deposit. The rates are Paystack's local-card and bank-transfer fee (1.5% plus a flat N100, never more than N2,000), kept here in one place.
 * The balance paid on the shoot day does not carry it.
 */
export const PAYSTACK_FEE = { percent: 1.5, flat: 100, cap: 2000 };

/** The processing fee to add to a deposit so that, after Paystack takes its cut of the total, the deposit is what is left (whole naira, rounded up). */
export function processingFee(deposit: number, fee = PAYSTACK_FEE): number {
  const gross = Math.ceil((deposit + fee.flat) / (1 - fee.percent / 100));
  return Math.min(gross - deposit, fee.cap);
}
