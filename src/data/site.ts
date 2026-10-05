export const contact = {
  email: "media@fashshotit.com",
  phoneDisplay: "+234 706 187 4236",
  phone: "+2347061874236",
  whatsapp: "https://wa.me/2347061874236",
  address: ["5B Bishop Bamgbade, Bariga", "Lagos, Nigeria."],
};

export const socials = [
  { label: "Instagram", href: "https://www.instagram.com/fash_shot_it" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/festus-fasina-8a984121a" },
  { label: "Facebook", href: "https://www.facebook.com/share/1A5g4Us1dY/" },
  { label: "YouTube", href: "https://youtube.com/@FashShotIt" },
];

/** Background video for the hero (YouTube). */
export const heroVideo = { id: "Z4UeHtJY5_0", start: 5, end: 103 };

export type Category = "portraits" | "events" | "commercials";

export const categories: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "portraits", label: "Portraits" },
  { value: "events", label: "Events" },
  { value: "commercials", label: "Commercials" },
];

export type MediaItem =
  | { type: "image"; src: string; caption?: string }
  | { type: "youtube"; id: string; caption?: string };

export interface PortfolioItem {
  title: string;
  tags: string;
  categories: Category[];
  thumb: string;
  /** Either opens a project page, or opens the media in the lightbox. */
  project?: string;
  media?: MediaItem;
}

const img = (path: string) => `/images/media/${path}`;

export const portfolio: PortfolioItem[] = [
  {
    title: "Corporate Event",
    tags: "events",
    categories: ["events"],
    thumb: img("events/FSI (71 of 397).jpg"),
    project: "conferences-and-exhibitions",
  },
  {
    title: "Birthday Shoot",
    tags: "events, portraits",
    categories: ["events", "portraits"],
    thumb: img("portraits/FSI_9758-ii.jpg"),
    media: { type: "image", src: img("portraits/FSI_9758-ii.jpg"), caption: "Birthday Shoot" },
  },
  {
    title: "Real Estate",
    tags: "aerial photography, commercials",
    categories: ["commercials"],
    thumb: img("commercials/DJI_0723.jpg"),
    project: "real-estate",
  },
  {
    title: "Advertisement",
    tags: "branding, commercials",
    categories: ["commercials"],
    thumb: img("commercials/FSI_1142.jpg"),
    project: "advertisement",
  },
  {
    title: "Maternity Portrait",
    tags: "portraits, maternity",
    categories: ["portraits"],
    thumb: img("portraits/FSI_1414.jpg"),
    media: { type: "image", src: img("portraits/FSI_1414.jpg"), caption: "Maternity Portrait" },
  },
  {
    title: "Family Portrait",
    tags: "family, portraits",
    categories: ["portraits"],
    thumb: img("portraits/FSI_1222 (2).jpg"),
    media: { type: "image", src: img("portraits/FSI_1222 (2).jpg"), caption: "Family Portrait" },
  },
  {
    title: "Graduation Shoot",
    tags: "graduation, portraits",
    categories: ["portraits"],
    thumb: img("portraits/FSI_8263.jpg"),
    project: "convocation-shoots",
  },
  {
    title: "Parties",
    tags: "events, celebrations",
    categories: ["events"],
    thumb: img("events/FSI (643 of 682).JPG"),
    media: { type: "image", src: img("events/FSI (643 of 682).JPG"), caption: "Parties" },
  },
  {
    title: "Video Coverage",
    tags: "events, drone, outdoor, video",
    categories: ["events"],
    thumb: img("events/FSI (202 of 682).JPG"),
    media: { type: "youtube", id: "6IEHAjDBVHg", caption: "PWC Away Day (2024)" },
  },
];

export interface Project {
  slug: string;
  title: string;
  images: string[];
  details: { label: string; value: string }[];
  description: string[];
  testimonial?: { quote: string; name: string; role: string; avatar?: string };
}

export const projects: Project[] = [
  {
    slug: "conferences-and-exhibitions",
    title: "Conferences and Exhibitions",
    images: [img("events/FSI (71 of 397).jpg"), img("events/DD (9 of 19).JPG")],
    details: [
      { label: "Location", value: "Victoria Island, Lagos, Nigeria." },
      { label: "Production Date", value: "November 6th, 2024" },
      { label: "Client", value: "NLCGA" },
    ],
    description: [
      "This high-profile industry event brought together key stakeholders from across the energy sector. From keynote speeches to product exhibitions, every moment needed to be documented with clarity and class.",
      "Our job? Capture the energy of the space — the details, the crowd, the branding, and the moments people might miss. From the camera to drone coverage, we told the full story.",
      "The result? A crisp, emotion-driven photo and video package the client used across social media, press, and internal reports. With a strong visual identity delivered, this project showcased our ability to shoot live events with speed, accuracy, and flair.",
    ],
  },
  {
    slug: "convocation-shoots",
    title: "Convocation Shoots",
    images: [img("portraits/FSI_7628.jpg"), img("portraits/FSI_8263.jpg")],
    details: [
      { label: "Location", value: "UNILAG, Lagos, Nigeria." },
      { label: "Production Date", value: "November 6th, 2024" },
    ],
    description: [
      "Convocation is a once-in-a-lifetime moment, and our studio sessions are crafted to preserve every bit of that joy. From classic cap-and-gown portraits to creative themed concepts, each shoot is tailored to reflect the graduate's personality, journey, and future aspirations.",
      "With professional lighting, smooth direction, and a relaxed atmosphere, we help clients feel confident and celebrated. Whether solo, with friends, or family — the final images are timeless keepsakes that tell a powerful story of achievement.",
    ],
    testimonial: {
      quote:
        "The entire shoot felt so effortless and fun. Fash captured me in my element and made me feel proud of how far I’ve come. Every shot was clean, emotional, and full of life. I’ll treasure these convocation photos forever!",
      name: "Grace Adeyemi",
      role: "Class of 2024, UNILAG",
      avatar: "/images/person_woman_1.jpg",
    },
  },
  {
    slug: "real-estate",
    title: "Real Estate",
    images: [img("commercials/DJI_0704.jpg"), img("commercials/DJI_0754.jpg"), img("commercials/DJI_0721.jpg")],
    details: [{ label: "Project Date", value: "August 24th, 2024" }],
    description: [
      "This project involved a full-development shoot for a real estate firm aiming to showcase luxury properties from unique angles. Using both ground and aerial drone coverage, we captured sweeping exterior views, surrounding landscapes, and dynamic roof-to-ground transitions. The visuals highlighted architectural beauty, location value, and lifestyle appeal — crafted to boost listing engagement and attract high-value buyers.",
    ],
  },
  {
    slug: "advertisement",
    title: "Advertisement",
    images: [img("commercials/DJI_0158.jpg"), img("commercials/FSI_1131.jpg"), img("commercials/FSI_1142.jpg")],
    details: [
      { label: "Project Date", value: "February 9th, 2025" },
      { label: "Client", value: "HYSTER" },
    ],
    description: [
      "We were tasked with creating bold and compelling visual content for a cargo logistics company looking to elevate its brand through advertising. The shoot focused on capturing the scale, reliability, and precision of their operations — from warehouse movements to fleet motion shots. These visuals were used across digital campaigns, billboards, and social platforms to communicate trust and efficiency.",
    ],
  },
];

export const clientLogos = [
  { src: "/images/logo-google.png", alt: "Google" },
  { src: "/images/logo-puma.png", alt: "Puma" },
  { src: "/images/logo-paypal.png", alt: "PayPal" },
  { src: "/images/logo-adobe.png", alt: "Adobe" },
];

export const services = [
  {
    icon: "/images/svg/camera.svg",
    title: ["Event", "Photography"],
    text: "From weddings to concerts and corporate events — I capture the raw emotions and the little details that matter most.",
  },
  {
    icon: "/images/svg/video.svg",
    title: ["Creative", "Videography"],
    text: "Storytelling through motion — I craft cinematic videos for music, brands, documentaries, and more.",
  },
  {
    icon: "/images/svg/drone.svg",
    title: ["Drone", "Footage"],
    text: "Licensed drone operator delivering breathtaking aerial views — perfect for real estate, events, and travel content.",
  },
  {
    icon: "/images/svg/editing.svg",
    title: ["Photo & Video", "Editing"],
    text: "Every frame counts. I enhance, color grade, and edit visuals to give them that polished, professional finish.",
  },
  {
    icon: "/images/svg/branding.svg",
    title: ["Brand", "Visuals"],
    text: "Helping brands stand out with intentional visuals — perfect for ads, product launches, and online content.",
  },
  {
    icon: "/images/svg/social-media.svg",
    title: ["Social Media", "Content"],
    text: "Scroll-stopping content for Instagram, TikTok, YouTube & beyond. Let your visuals go viral.",
  },
];

export const skills = [
  { label: "Photography", value: 100 },
  { label: "Video Editing", value: 95 },
  { label: "Drone Handling", value: 92 },
  { label: "Creative Direction", value: 97 },
];

export const testimonials = [
  {
    quote:
      "Thank you again, brother, for the pictures. We deeply appreciate your intentionality and professionalism. The pictures are so sweet to look at - I've been caught zooming in and out a countless number of times since we received it in December. Thank you for going above and beyond, may your business blossom and may it soon become a household name. Thank you for adding colour to our baby's day. God bless you and prosper the works of your hands. Amen",
    name: "Ifeoluwa Sobowale",
    role: "Family Portraits",
  },
  { quote: "Your pictures are lovely!!!!", name: "Philip Bakare", role: "Corporate Shots" },
  {
    quote: "Uncleeeeee fashhhhhh to bad!!\nI'll definitely tag you dw, I loveeeeee the pictures 👌\nAmazzzzinggggg",
    name: "Victoria",
    role: "Portrait Shots",
  },
  { quote: "Good morningggg Fash,\nAwwwwn🥰 so beautiful", name: "Faith Odumosu", role: "Family Shots" },
];

export const navLinks = [
  { id: "portfolio", label: "Portfolio" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "skills", label: "Skills" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
];
