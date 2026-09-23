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
  hello: "Hi, I'm Will O'Driscoll.",
  title: "I build websites for golf courses, simulators and shops",
  lead: "I'm a software engineer in St. John's. I design, build and look after every site myself, including online booking, stores and local search.",
  primaryCta: { href: "#work", label: "See the work" },
  secondaryCta: { href: "#contact", label: "Get in touch" },
} as const;

export const services: ReadonlyArray<{
  title: string;
  body: string;
}> = [
  {
    title: "Design and build",
    body: "A custom site built around your course or brand, not a template. Fast on every phone, easy to read, easy to update.",
  },
  {
    title: "Booking and stores",
    body: "Tee times, simulator bays, lessons or products. I set up third-party integrations so customers can pay and book online.",
  },
  {
    title: "Local search",
    body: "Structured data, business listing guidance and clean page titles, so golfers nearby find you first.",
  },
  {
    title: "Hosting and care",
    body: "I deploy, monitor and keep your site current. Need a new menu, event or season's hours? Send a message and it's done.",
  },
];

export const work = {
  // Real projects under way right now, shown as a count (never named before
  // launch). Keep it true: lower it when one launches, 0 hides the line.
  inProgress: 2 as number,
  nextCta: { href: "#contact", label: "Want yours to be next? Get in touch." },
} as const;

export const contact = {
  title: "Got a project in mind?",
  body: "Send me a few lines about your business and what you want the site to do. I reply within a day.",
} as const;

export const notFound = {
  eyebrow: "404",
  title: "Out of bounds.",
  body: "This page doesn't exist. Let's get you back on the fairway.",
  cta: { href: "/", label: "Back to the fairway" },
} as const;
