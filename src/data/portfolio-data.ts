export const PORTFOLIO_PLACEHOLDER_IMAGES = [
  "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png",
  "https://www.image2url.com/r2/default/images/1793830267590-654c4729-bbde-4ca9-8721-fef466601fa0.png",
  "https://www.image2url.com/r2/default/images/1793830305704-e179d36b-b9ab-42bd-abcd-003dda243066.png",
  "https://www.image2url.com/r2/default/images/1793830412305-08adbd21-af0b-48e9-a6ea-195463fd1fad.png",
] as const;

const DESIGN_CATEGORIES = [
  "Brand Identity",
  "Social Media Campaign",
  "Thumbnail Architecture",
  "Poster & Key Art",
  "UI / Visual System",
  "Editorial Layout",
] as const;

export type DesignConcept = {
  id: number;
  code: string;
  title: string;
  clientCategory: string;
  image: string;
};

// 36 Design Concepts (serial 01..36)
export const DESIGN_CONCEPTS: DesignConcept[] = Array.from({ length: 36 }, (_, idx) => {
  const num = idx + 1;
  const code = String(num).padStart(2, "0");
  const image = PORTFOLIO_PLACEHOLDER_IMAGES[idx % PORTFOLIO_PLACEHOLDER_IMAGES.length]!;
  const clientCategory = DESIGN_CATEGORIES[idx % DESIGN_CATEGORIES.length]!;
  return {
    id: num,
    code,
    title: `Design Concept ${code}`,
    clientCategory,
    image,
  };
});

export type VideoItem = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  duration: string;
  youtubeId: string;
  thumbnail: string;
  format: "long" | "short";
};

// 4 Long-Form Videos (16:9 widescreen)
export const LONG_FORM_VIDEOS: VideoItem[] = [
  {
    id: "long-1",
    code: "01",
    title: "Barnoi Lifestyle TVC Ads Project",
    subtitle: "TV Commercial & Lifestyle Brand Film",
    duration: "01:24",
    youtubeId: "qrsIbB93Uhk",
    thumbnail: "https://i.ytimg.com/vi/qrsIbB93Uhk/maxresdefault.jpg",
    format: "long",
  },
  {
    id: "long-2",
    code: "02",
    title: "Nafees Selim Podcast In As-Sunnah Skill",
    subtitle: "Long-Form Interview & Educational Podcast",
    duration: "24:15",
    youtubeId: "iGTBJB_OLMI",
    thumbnail: "https://i.ytimg.com/vi/iGTBJB_OLMI/maxresdefault.jpg",
    format: "long",
  },
  {
    id: "long-3",
    code: "03",
    title: "SAS Animation Video Technology Update",
    subtitle: "Tech Breakdown & Motion Graphics Edit",
    duration: "03:40",
    youtubeId: "VqmB74aXV9s",
    thumbnail: "https://i.ytimg.com/vi/VqmB74aXV9s/maxresdefault.jpg",
    format: "long",
  },
  {
    id: "long-4",
    code: "04",
    title: "Promotional Ads Video for Ghorer Bazar",
    subtitle: "E-Commerce Promotional Campaign & Pacing",
    duration: "01:05",
    youtubeId: "HWWI6WyThQ8",
    thumbnail: "https://i.ytimg.com/vi/HWWI6WyThQ8/maxresdefault.jpg",
    format: "long",
  },
];

// 4 Short-Form Videos (9:16 vertical phone format)
export const SHORT_FORM_VIDEOS: VideoItem[] = [
  {
    id: "short-1",
    code: "01",
    title: "Modiology Brand Product Promotion",
    subtitle: "Product Commercial & Motion Reel",
    duration: "0:45",
    youtubeId: "iYqOrHPYuaA",
    thumbnail: "https://i.ytimg.com/vi/iYqOrHPYuaA/maxresdefault.jpg",
    format: "short",
  },
  {
    id: "short-2",
    code: "02",
    title: "2D Animation Storytelling Short",
    subtitle: "Storytelling, Voiceover & Dynamic Motion",
    duration: "0:48",
    youtubeId: "tWEah--CBco",
    thumbnail: "https://i.ytimg.com/vi/tWEah--CBco/maxresdefault.jpg",
    format: "short",
  },
  {
    id: "short-3",
    code: "03",
    title: "Product Motion Graphics Video",
    subtitle: "3D/2D Motion Design & Dynamic Pacing",
    duration: "0:36",
    youtubeId: "lZWfel4Hpgg",
    thumbnail: "https://i.ytimg.com/vi/lZWfel4Hpgg/maxresdefault.jpg",
    format: "short",
  },
  {
    id: "short-4",
    code: "04",
    title: "Animation Video Editing with AI",
    subtitle: "AI-Powered Animation Workflow & Tutorial",
    duration: "0:42",
    youtubeId: "nKyBhlKxZIE",
    thumbnail: "https://i.ytimg.com/vi/nKyBhlKxZIE/maxresdefault.jpg",
    format: "short",
  },
];

export type ProjectShowcaseItem = {
  id: string;
  code: string;
  name: string;
  clientType: string;
  category: "website" | "android";
  stackSummary: string;
  summary: string;
  highlights: string[];
  image: string;
  previewDomainOrPackage: string;
  year: string;
};

export const WEBSITE_PROJECTS: ProjectShowcaseItem[] = [
  {
    id: "web-1",
    code: "01",
    name: "Project Name 01 — E-Commerce & Brand Storefront",
    clientType: "Retail & D2C Client",
    category: "website",
    stackSummary: "Next.js · TypeScript · Tailwind CSS · Stripe & SSLCommerz",
    summary:
      "Full-stack custom e-commerce platform with high-speed product filtering, instant cart checkout, automated order invoicing, and real-time inventory management.",
    highlights: [
      "Sub-second page transitions with SSR & edge caching",
      "Automated PDF invoice generation & order tracking dashboard",
      "Responsive glassmorphic product showcase optimized for mobile conversions",
    ],
    image: PORTFOLIO_PLACEHOLDER_IMAGES[0],
    previewDomainOrPackage: "client-storefront.web.app",
    year: "2026",
  },
  {
    id: "web-2",
    code: "02",
    name: "Project Name 02 — EdTech Learning & Batch Portal",
    clientType: "Educational Institute",
    category: "website",
    stackSummary: "React · Node.js · PostgreSQL · Automated Ticket & Email Engine",
    summary:
      "Scalable student enrollment and course management portal supporting concurrent batch registrations, automated PDF admit cards, and student progress tracking.",
    highlights: [
      "Concurrent batch registration system with instant email delivery",
      "Role-based instructor and student resource dashboards",
      "Interactive curriculum modules and certificate verification",
    ],
    image: PORTFOLIO_PLACEHOLDER_IMAGES[1],
    previewDomainOrPackage: "edtech-portal.web.app",
    year: "2026",
  },
  {
    id: "web-3",
    code: "03",
    name: "Project Name 03 — SaaS Workflow & AI Automation Hub",
    clientType: "Technology Startup",
    category: "website",
    stackSummary: "Next.js · Python API · REST Webhooks · Cloud Architecture",
    summary:
      "Enterprise web application automating client onboarding, document processing, and multi-channel notifications with clean analytics reporting.",
    highlights: [
      "End-to-end automated workflow pipelines reducing manual tasks by 70%",
      "Secure API gateway with role-based access control",
      "Real-time activity logs and exportable client reports",
    ],
    image: PORTFOLIO_PLACEHOLDER_IMAGES[2],
    previewDomainOrPackage: "automation-hub.web.app",
    year: "2025",
  },
  {
    id: "web-4",
    code: "04",
    name: "Project Name 04 — Creative Studio & Media Agency",
    clientType: "Digital Production Agency",
    category: "website",
    stackSummary: "React · TanStack Start · Tailwind CSS · Custom Media Player",
    summary:
      "High-retention portfolio and client booking platform built for a creative production studio with native showreel playback and instant brief submission.",
    highlights: [
      "Custom native-style video showcase with zero third-party UI clutter",
      "Direct WhatsApp & email project brief generator",
      "Editorial typography and smooth compositor-driven transitions",
    ],
    image: PORTFOLIO_PLACEHOLDER_IMAGES[3],
    previewDomainOrPackage: "creative-agency.web.app",
    year: "2025",
  },
  {
    id: "web-5",
    code: "05",
    name: "Project Name 05 — Corporate FinTech & Advisory",
    clientType: "Financial Consultancy",
    category: "website",
    stackSummary: "TypeScript · Laravel · MySQL · Security-Hardened Architecture",
    summary:
      "Security-first corporate web portal featuring encrypted client document exchange, appointment scheduling, and interactive financial calculators.",
    highlights: [
      "Hardened authentication and encrypted document vault",
      "Interactive ROI and project budget estimation tools",
      "WCAG AA accessible typography and multi-device responsiveness",
    ],
    image: PORTFOLIO_PLACEHOLDER_IMAGES[0],
    previewDomainOrPackage: "advisory-portal.web.app",
    year: "2025",
  },
  {
    id: "web-6",
    code: "06",
    name: "Project Name 06 — Healthcare & Clinic Booking System",
    clientType: "Medical & Diagnostic Center",
    category: "website",
    stackSummary: "Next.js · Prisma · Tailwind CSS · SMS & WhatsApp Alerts",
    summary:
      "Patient-friendly appointment scheduling and digital prescription portal allowing patients to book consultations and download lab reports securely.",
    highlights: [
      "One-minute doctor slot booking with automated WhatsApp reminders",
      "Digital prescription & diagnostic PDF report portal",
      "Clean, high-contrast interface designed for all age groups",
    ],
    image: PORTFOLIO_PLACEHOLDER_IMAGES[1],
    previewDomainOrPackage: "clinic-booking.web.app",
    year: "2025",
  },
];

export const ANDROID_PROJECTS: ProjectShowcaseItem[] = [
  {
    id: "android-1",
    code: "01",
    name: "Project Name 01 — Smart Task & Habit Companion",
    clientType: "Productivity Android App",
    category: "android",
    stackSummary: "Android · Kotlin · Jetpack Compose · Room Offline DB",
    summary:
      "Native Android application designed for distraction-free daily planning, offline-first task tracking, and customizable routine reminders.",
    highlights: [
      "100% offline-capable local database with instant cloud sync",
      "Material You dynamic theming & smooth 120Hz animations",
      "Home-screen interactive widgets and smart notification channels",
    ],
    image: PORTFOLIO_PLACEHOLDER_IMAGES[2],
    previewDomainOrPackage: "com.sakibulislam.taskcompanion",
    year: "2026",
  },
  {
    id: "android-2",
    code: "02",
    name: "Project Name 02 — Client Order & Delivery Tracker",
    clientType: "Logistics & Commerce App",
    category: "android",
    stackSummary: "Android · Flutter · Firebase Realtime · Push Notifications",
    summary:
      "Dedicated Android application for merchants and customers to track live order statuses, manage dispatches, and receive instant push alerts.",
    highlights: [
      "Real-time delivery milestone updates & QR code parcel scanning",
      "Lightweight APK optimized for low-bandwidth mobile networks",
      "Integrated one-tap customer support via WhatsApp & call",
    ],
    image: PORTFOLIO_PLACEHOLDER_IMAGES[3],
    previewDomainOrPackage: "com.sakibulislam.deliverytracker",
    year: "2026",
  },
  {
    id: "android-3",
    code: "03",
    name: "Project Name 03 — Student Learning & Quiz App",
    clientType: "EdTech Mobile Platform",
    category: "android",
    stackSummary: "Android · Kotlin · Retrofit · ExoPlayer Native Video",
    summary:
      "Mobile learning companion app enabling students to stream course lessons, practice interactive timed quizzes, and download study notes offline.",
    highlights: [
      "Custom native video player with offline lesson caching",
      "Timed MCQ practice engine with instant explanation breakdowns",
      "Detailed performance analytics and batch leaderboard",
    ],
    image: PORTFOLIO_PLACEHOLDER_IMAGES[0],
    previewDomainOrPackage: "com.sakibulislam.edtechmobile",
    year: "2025",
  },
  {
    id: "android-4",
    code: "04",
    name: "Project Name 04 — Personal Finance & Expense Ledger",
    clientType: "FinTech Utility App",
    category: "android",
    stackSummary: "Android · Jetpack Compose · Biometric Auth · CSV/PDF Export",
    summary:
      "Secure Android expense manager with fingerprint lock, category-wise budget alerts, and one-tap monthly PDF statement exports.",
    highlights: [
      "Biometric fingerprint authentication keeping financial data private",
      "Visual monthly cash-flow breakdowns and instant search",
      "One-click PDF & CSV ledger export for accounting",
    ],
    image: PORTFOLIO_PLACEHOLDER_IMAGES[1],
    previewDomainOrPackage: "com.sakibulislam.expenseledger",
    year: "2025",
  },
];
