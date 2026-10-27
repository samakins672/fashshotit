/**
 * UNILAG convocation booking (bookings.fashshotit.com).
 *
 * Every number here is an admin setting in the brief, so the page reads them
 * from the API and only falls back to these defaults when the API isn't there
 * yet (local dev, preview builds).
 */

export interface BookingPackage {
  /** Number of people, 1–6 */
  size: number;
  total: number;
  deposit: number;
}

export interface BookingSettings {
  packages: BookingPackage[];
  /** People needed for the shoot to go ahead */
  slotTarget: number;
  /** People with a confirmed deposit. Shown capped at the target. */
  slotsFilled: number;
  /** ISO date: if the target isn't met by then, deposits are refunded */
  refundDeadline: string;
  shootPeriod: string;
}

export const defaultSettings: BookingSettings = {
  packages: [
    { size: 1, total: 35_000, deposit: 17_500 },
    { size: 2, total: 50_000, deposit: 25_000 },
    { size: 3, total: 70_000, deposit: 35_000 },
    { size: 4, total: 80_000, deposit: 40_000 },
    { size: 5, total: 90_000, deposit: 45_000 },
    { size: 6, total: 100_000, deposit: 50_000 },
  ],
  slotTarget: 50,
  slotsFilled: 0,
  refundDeadline: "March 2027",
  shootPeriod: "March 2027",
};

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/** Fash's general services, listed on the bookings home page. */
export const services = [
  {
    title: "Studio session",
    text: "Portraits, family and group shoots, styled on location or in studio.",
    image: "/images/media/portraits/FSI_1764.webp",
    price: formatNaira(100_000),
  },
  {
    title: "Video coverage",
    text: "Cinematic coverage of your day, edited into a film you'll want to rewatch.",
    image: "/images/media/events/FSI (643 of 682).webp",
    price: formatNaira(200_000),
  },
  {
    title: "Drone shoot",
    text: "Licensed aerial photos and video that show the whole scale of your event.",
    image: "/images/media/commercials/DJI_0704.webp",
    price: formatNaira(200_000),
  },
];

export const occasions = ["Birthdays", "Anniversaries", "Weddings", "Convocations"];

export const included = [
  {
    title: "Convocation-day photos",
    text: "Your graduation moments on campus, edited and delivered in high resolution.",
    image: "/images/media/portraits/FSI_1222 (2).webp",
  },
  {
    title: "Professional headshots",
    text: "A clean, polished headshot for LinkedIn, your CV and everything after school.",
    image: "/images/media/portraits/FSI_7683new.webp",
  },
  {
    title: "Gown rental",
    text: "Your convocation gown is ready on the day, so there's nothing to borrow or return late.",
    image: "/images/media/portraits/FSI_8263.webp",
  },
  {
    title: "Props & backdrops",
    text: "Styled backdrops, balloons and props for photos that look like a celebration.",
    image: "/images/media/portraits/FSI_4438-2.webp",
  },
];

export const steps = [
  { title: "Choose a package", text: "Book for yourself, or for a group of up to 6." },
  { title: "Pay a 50% deposit", text: "Pay securely with Paystack by card, transfer or USSD." },
  { title: "Get your group tag", text: "A tag like FSM-ADEYEMI-012 lands in your email. Keep it safe." },
  { title: "Pay the balance on shoot day", text: "Quote your tag on the day and pay the remaining 50%." },
];

export const formatDate = (val: string) => {
  if (!val) return "";
  if (!/^\d{4}-\d{2}-\d{2}/.test(val)) return val;
  const d = new Date(`${val}T00:00:00`);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

export const peopleLabel = (n: number) => (n === 1 ? "1 person" : `${n} people`);

export const DEFAULT_WRAPP_KIT_URL = "https://wrapp.africa/kit/unilag";

export function buildWrappKitUrl(balance: number, date?: string, baseUrl: string = DEFAULT_WRAPP_KIT_URL): string {
  const sep = baseUrl.includes("?") ? "&" : "?";
  let url = `${baseUrl}${sep}amount=${balance}`;
  if (date) {
    url += `&date=${encodeURIComponent(date)}`;
  }
  return url;
}

/** Logos for the partners strip on the UNILAG page. Entries without a logo show as a placeholder tile. */
export const partners: { name: string; logo?: string; hideName?: boolean }[] = [
  { name: "Wrapp", logo: "/images/partners/wrapp.webp", hideName: true },
  { name: "FinZ", logo: "/images/partners/finz.webp" },
  { name: "Partner" },
  { name: "Partner" },
];
