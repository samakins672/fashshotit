/**
 * What Paystack will add at checkout, shown to the customer before they pay. Fash Shot It sends Paystack only the deposit; the account is set
 * so that the customer carries Paystack's fee, and Paystack adds it on its own page. This is only the estimate we show up front:
 * 1.5% plus a flat N100 (never more than N2,000), worked out so the deposit is what is left after the fee.
 */
export const PAYSTACK_FEE = { percent: 1.5, flat: 100, cap: 2000 };

export function processingFee(deposit: number, fee = PAYSTACK_FEE): number {
  const gross = Math.ceil((deposit + fee.flat) / (1 - fee.percent / 100));
  return Math.min(gross - deposit, fee.cap);
}
