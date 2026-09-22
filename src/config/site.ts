// Site-wide copy and settings. Client sites live in src/content/sites.

export const site = {
  name: "William O'Driscoll",
  role: "Websites for golf businesses",
  location: "St. John's, Newfoundland",
  email: "willod17@outlook.com",
  description:
    "William O'Driscoll is a software engineer in St. John's, Newfoundland who designs and builds fast, modern websites for golf courses, simulators, clubs and golf brands.",
  nav: [
    { href: "#work", label: "Work" },
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
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
}> = [
  {
    icon: "tee",
    title: "Design and build",
    body: "A custom site built around your course or brand, not a template. Fast on every phone, easy to read, easy to update.",
  },
  {
    icon: "calendar",
    title: "Booking and stores",
    body: "Tee times, simulator bays, lessons or products. I connect the tools you already use, like Acuity or Square, so customers can pay and book online.",
  },
  {
    icon: "pin",
    title: "Local search",
    body: "Structured data, Google Business Profile guidance and clean page titles, so golfers nearby find you first.",
  },
  {
    icon: "flag",
    title: "Hosting and care",
    body: "I deploy, monitor and keep your site current. Need a new menu, event or season's hours? Send a message and it's done.",
  },
];

export const contact = {
  title: "Let's build your club's site.",
  body: "Tell me about your course, simulator or shop. I reply within a day.",
} as const;
