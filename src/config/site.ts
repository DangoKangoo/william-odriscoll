// Site-wide copy and settings. Client sites live in src/content/sites.

export const site = {
  // The business name shown on the site. The founder is the person behind it.
  name: "W. O'Design",
  founder: "William O'Driscoll",
  role: "Websites for golf businesses",
  location: "St. John's, Newfoundland",
  email: "willod17@outlook.com",
  description:
    "W. O'Design is William O'Driscoll, a software engineer in St. John's, Newfoundland who designs and builds fast, modern websites for golf courses, simulators, clubs and golf brands.",
  linkedin: "https://www.linkedin.com/in/will-odriscoll/",
  // Homepage <title>. Leads with the service people search for.
  seoTitle: "Golf Website Design, St. John's NL | W. O'Design",
  // For structured data (lib/structured-data.ts).
  jobTitle: "Software Engineer",
  address: {
    locality: "St. John's",
    region: "NL",
    country: "CA",
  },
  areaServed: "Canada",
  // Google Search Console HTML-tag verification code (the content="..." value).
  // Leave empty until you have it; no tag is rendered while empty.
  googleSiteVerification: "",
  // Paths are relative to the site root; components prefix them with withBase().
  nav: [
    { href: "/#work", label: "Work" },
    { href: "/#services", label: "Services" },
    { href: "/#contact", label: "Contact" },
  ],
  footerNav: [
    { href: "/#work", label: "Work" },
    { href: "/#services", label: "Services" },
    { href: "/#contact", label: "Contact" },
    { href: "/privacy/", label: "Privacy" },
  ],
} as const;

export const hero = {
  eyebrow: "Software engineer · St. John's, NL",
  title: "Websites for golf businesses.",
  lead: "I design and build fast, modern sites for golf courses, simulators, clubs and golf brands. Booking, online stores and local search, handled by one engineer from first sketch to launch.",
  primaryCta: { href: "#work", label: "See the work" },
  secondaryCta: { href: "#contact", label: "Start a project" },
} as const;

export type ServiceIcon = "tee" | "calendar" | "pin" | "flag";

export const services: ReadonlyArray<{
  icon: ServiceIcon;
  title: string;
  body: string;
  points: ReadonlyArray<string>;
}> = [
  {
    icon: "tee",
    title: "Design and build",
    body: "A custom site built around your course or venue, not a template.",
    points: [
      "Mobile-first layout that loads fast",
      "Pages for rates, hours, lessons and events",
      "Accessible and easy to read",
    ],
  },
  {
    icon: "calendar",
    title: "Booking and stores",
    body: "Customers book and pay online, any time of day.",
    points: [
      "Tee times, simulator bays and lessons",
      "Gift cards, memberships and pro shop products",
      "Works with most third-party booking and payment services",
    ],
  },
  {
    icon: "pin",
    title: "Local search",
    body: "Golfers nearby find you before they find anyone else.",
    points: [
      "Business listing setup for search and maps",
      "Structured data for your hours, location and contact details",
      "Page titles that match what golfers actually search",
    ],
  },
  {
    icon: "flag",
    title: "Hosting and care",
    body: "One person looking after your site all season.",
    points: [
      "Hosting, deploys and monitoring",
      "Opening day, season hours and events updated on request",
      "Message me directly, no ticket queue",
    ],
  },
];

// In-progress cards live in src/content/in-progress (one JSON file each).
export const work = {
  nextCard: {
    title: "Your course could be next.",
    body: "Courses, simulators, clubs and golf brands.",
    cta: { href: "#contact", label: "Start a project" },
  },
} as const;

export const statement = {
  lead: "This site is simple on purpose.",
  follow: "The detail goes into yours.",
} as const;

export const contact = {
  title: "Let's build your club's site.",
  body: "Tell me about your course, simulator or shop. I reply within a day.",
} as const;

export const notFound = {
  eyebrow: "404",
  title: "Out of bounds.",
  body: "This page doesn't exist. Let's get you back on the fairway.",
  cta: { href: "/", label: "Back to the fairway" },
} as const;
