import workshopOverviewImg from "@/assets/images/workshop_overview_scene_1794783449709.jpg";
import workshopHeroImg from "@/assets/images/workshop_hero_sculpture_1794783448550.jpg";

export const WORKSHOP_ASSETS = {
  logo: "/images/ai-for-students-logo.png",
  eventBanner: "/images/workshop-event-banner.jpg",
  neerFashionLogo: "/images/neer-fashion-logo.jpg",
  bismahsoftLogo: "/images/bismahsoft-logo.png",
  mainSpeakerPhoto: "/images/speaker-sabbir.png",
  heroVisual: workshopHeroImg,
  overviewScene: workshopOverviewImg,
} as const;

export const EVENT_CONFIG = {
  eventName: "AI FOR STUDENTS",
  edition: "WORKSHOP 2027",
  category: "Generative AI Education & Practical Workshop",
  targetAudience: "Students",
  theme: "Preparing Students for an AI-Powered Future.",
  organizer: "Bismahsoft Ltd",
  mainSponsor: "Neer Fashion",
  tagline: "Innovation with Integrity Transform Your Dreams into Reality",
  ticketUrl: "https://www.supportkori.com/sakibul756/extras/ai-for-students-workshop-2027-gkam",
  // 9 December 2026 (Wednesday), 9:30 PM Night (Bangladesh Standard Time UTC+06:00)
  eventDateIso: "2026-12-09T21:30:00+06:00",
  eventDateLabel: "9 December (Wednesday) · 9:30 PM Night",
  eventFormatLabel: "One-Night Online Live Meeting",
  eventVenueLabel: "Online Platform — Google Meet",
  registrationFeeLabel: "Book Official Seat via SupportKori",
  registrationDeadlineLabel: "Open Now · Until 9 Dec (9:30 PM)",
  officialEmail: "sakibulislamsbmc@gmail.com",
} as const;

export const WORKSHOP_NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Learning Modules", href: "#modules" },
  { label: "Speakers", href: "#speakers" },
  { label: "Schedule", href: "#schedule" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "FAQ", href: "#faq" },
] as const;

export interface LearningModuleItem {
  number: string;
  title: string;
  description: string;
  iconName: "cpu" | "layers" | "terminal" | "book" | "sparkles" | "zap" | "compass" | "shield";
}

export const LEARNING_MODULES: LearningModuleItem[] = [
  {
    number: "01",
    title: "Understanding Generative AI",
    description:
      "What Generative AI is, how modern AI models work conceptually, and why they are transforming every industry.",
    iconName: "cpu",
  },
  {
    number: "02",
    title: "Exploring AI Tools",
    description:
      "Introduction to modern AI tools for text, research, content creation, visuals, and student learning.",
    iconName: "layers",
  },
  {
    number: "03",
    title: "Smart Prompting",
    description:
      "How to communicate clearly with AI tools and structure prompts to get accurate, useful, and relevant results.",
    iconName: "terminal",
  },
  {
    number: "04",
    title: "AI for Smart Study",
    description:
      "Using AI ethically and effectively to summarize concepts, generate practice plans, and understand difficult topics.",
    iconName: "book",
  },
  {
    number: "05",
    title: "AI for Creativity",
    description:
      "How students can leverage AI for creative ideation, visual storytelling, design brainstorming, and original projects.",
    iconName: "sparkles",
  },
  {
    number: "06",
    title: "AI for Productivity",
    description:
      "Automating routine workflows, organizing study notes, managing academic schedules, and building smarter daily systems.",
    iconName: "zap",
  },
  {
    number: "07",
    title: "AI for Future Skills",
    description:
      "Discovering how AI intersects with engineering, design, research, business, and emerging student career paths.",
    iconName: "compass",
  },
  {
    number: "08",
    title: "Responsible AI Usage",
    description:
      "Critical thinking, fact verification, avoiding over-reliance, data privacy, and practicing academic integrity with AI.",
    iconName: "shield",
  },
];

export interface WorkshopStatItem {
  value: string;
  label: string;
  note: string;
}

export const WORKSHOP_STATS: WorkshopStatItem[] = [
  {
    value: "1 Night",
    label: "Live Online Meeting",
    note: "9 December starting at 9:30 PM Night — focused single-evening session",
  },
  {
    value: "Google Meet",
    label: "Online Live Platform",
    note: "Join effortlessly from your laptop or smartphone at your fingertips",
  },
  {
    value: "8 Tracks",
    label: "Core AI Learning Areas",
    note: "From Generative AI foundations & prompting to Vibe Coding & AI ethics",
  },
  {
    value: "Open",
    label: "Guest & Sponsor Calls",
    note: "Registrations open for students, upcoming sponsors, and guest speakers",
  },
];

export interface SpeakerSlotItem {
  id: string;
  name: string;
  roleBadge: string;
  designation: string;
  organization: string;
  topicFocus: string;
  image: string | null;
  isConfirmed: boolean;
}

export const SPEAKER_SLOTS: SpeakerSlotItem[] = [
  {
    id: "speaker-main",
    name: "Sakibul Islam Sabbir",
    roleBadge: "MAIN SPEAKER",
    designation: "Mentor - Generative AI · Designer & Vibe Coder",
    organization: "Bismahsoft Ltd · AI FOR STUDENTS",
    topicFocus:
      "Understanding Generative AI, Smart Prompting, Creative Workflows & Practical Vibe Coding for Students",
    image: "/images/speaker-sabbir.png",
    isConfirmed: true,
  },
  {
    id: "speaker-guest-1",
    name: "Upcoming Guest Speaker",
    roleBadge: "UPCOMING · REGISTRATIONS OPEN",
    designation: "Guest Speaker & AI Practitioner",
    organization: "Guest Speaker Registrations Currently Open",
    topicFocus:
      "Registrations are currently being taken for guest speakers sharing applied AI insights with students.",
    image: null,
    isConfirmed: false,
  },
  {
    id: "speaker-guest-2",
    name: "Upcoming Guest Speaker",
    roleBadge: "UPCOMING · REGISTRATIONS OPEN",
    designation: "Industry Mentor & Educator",
    organization: "Guest Speaker Registrations Currently Open",
    topicFocus: "Additional guest speakers will be announced prior to the 9 December live session.",
    image: null,
    isConfirmed: false,
  },
];

export interface GuestSlotItem {
  id: string;
  role: string;
  title: string;
  affiliation: string;
}

export const GUEST_SLOTS: GuestSlotItem[] = [
  {
    id: "guest-1",
    role: "Upcoming Guest Speakers",
    title: "Guest Speaker Lineup — Upcoming",
    affiliation: "Registrations are currently being taken for guest speakers.",
  },
  {
    id: "guest-2",
    role: "Upcoming Sponsors",
    title: "Additional Sponsor Slots — Open",
    affiliation: "Sponsors are currently being taken alongside Main Sponsor Neer Fashion.",
  },
  {
    id: "guest-3",
    role: "Special Appearances",
    title: "Academic & Tech Mentors — Upcoming",
    affiliation: "Lineup will be updated ahead of 9 December, 9:30 PM Night.",
  },
];

export interface PartnerCategoryItem {
  category: string;
  description: string;
  status: string;
}

export const PARTNER_CATEGORIES: PartnerCategoryItem[] = [
  {
    category: "Community Partners",
    description: "Student clubs, campus AI chapters, and youth technology collectives.",
    status: "Upcoming · Open for Clubs",
  },
  {
    category: "Media Partners",
    description: "Student publications, digital media outlets, and campus broadcasters.",
    status: "Upcoming · Inquiries Open",
  },
  {
    category: "Technology Partners",
    description: "AI tooling platforms and technical infrastructure supporters.",
    status: "Google Meet Live · Open",
  },
  {
    category: "Education Partners",
    description: "Universities, colleges, and student skill development institutions.",
    status: "Upcoming · Open for Campuses",
  },
  {
    category: "Supporting Sponsors",
    description: "Brands aligned with ethical AI literacy for students.",
    status: "Sponsors Being Taken",
  },
];

export interface ScheduleSessionItem {
  id: string;
  time: string;
  title: string;
  category: string;
  speaker: string;
  description: string;
}

export const ONE_NIGHT_SCHEDULE_META = {
  dateLabel: "9 December (Wednesday) · Starting 9:30 PM Night",
  platform: "Google Meet — One-Night Online Live Meeting",
  clarificationNote:
    "Schedule Clarification: Earlier community announcements mentioned a two-day format. To make attendance effortless for all students, this edition is organized as a focused, high-impact One-Night Online Live Meeting starting at 9:30 PM on Google Meet.",
} as const;

export const LIVE_NIGHT_SESSIONS: ScheduleSessionItem[] = [
  {
    id: "live-1",
    time: "09:30 PM",
    title: "Opening & Welcome: Connect. Learn. Lead with AI",
    category: "Opening Session",
    speaker: "Bismahsoft Ltd & Main Sponsor Neer Fashion",
    description:
      "Live Google Meet kickoff welcoming students, introducing Bismahsoft Ltd's mission, and acknowledging Main Sponsor Neer Fashion and upcoming partners.",
  },
  {
    id: "live-2",
    time: "09:45 PM",
    title: "Understanding Generative AI & How AI Responds",
    category: "Core Foundation",
    speaker: "Sakibul Islam Sabbir (Mentor - Generative AI)",
    description:
      "Clear breakdown of what Generative AI is, how models interpret context and prompts, and why human reasoning guides every strong result.",
  },
  {
    id: "live-3",
    time: "10:10 PM",
    title: "Smart Prompting & Live AI Tools Demonstration",
    category: "Hands-On Demo",
    speaker: "Sakibul Islam Sabbir",
    description:
      "Practical live demonstration showing how structured prompting transforms study research, content workflows, and problem-solving in real time.",
  },
  {
    id: "live-4",
    time: "10:35 PM",
    title: "AI for Creativity, Design & Vibe Coding Workflows",
    category: "Designer & Vibe Coder",
    speaker: "Sakibul Islam Sabbir & Upcoming Guest Speakers",
    description:
      "Exploring creative ideation, visual design workflows, and beginner-friendly Vibe Coding concepts so students can turn ideas into real projects.",
  },
  {
    id: "live-5",
    time: "11:00 PM",
    title: "AI for Smart Study, Productivity & Future Skills",
    category: "Academic & Career",
    speaker: "Main Speaker & Guest Mentor Panel",
    description:
      "Actionable frameworks for organizing academic notes, accelerating learning safely, and preparing for AI-augmented careers.",
  },
  {
    id: "live-6",
    time: "11:20 PM",
    title: "Responsible AI Usage & Ethical Integrity",
    category: "Ethics & Integrity",
    speaker: "Bismahsoft Ltd Organizing Panel",
    description:
      "Fact-checking outputs, protecting data privacy, avoiding over-reliance, and practicing innovation with integrity.",
  },
  {
    id: "live-7",
    time: "11:35 PM",
    title: "Live Student Q&A, Roadmap & Certificate Instructions",
    category: "Interactive Closing",
    speaker: "Sakibul Islam Sabbir & Hosts",
    description:
      "Open Google Meet Q&A with students, 90-day self-learning roadmap, and official participation certificate distribution steps.",
  },
];

export interface BenefitItem {
  number: string;
  title: string;
  description: string;
}

export const WORKSHOP_BENEFITS: BenefitItem[] = [
  {
    number: "01",
    title: "Beginner-Friendly Learning",
    description:
      "Designed so every student can follow along clearly—no prior programming or technical AI background required.",
  },
  {
    number: "02",
    title: "Practical AI Understanding",
    description:
      "Move beyond surface hype through live Google Meet demonstrations, prompt frameworks, and guided hands-on thinking.",
  },
  {
    number: "03",
    title: "Academic Advantage",
    description:
      "Learn ethical ways to clarify difficult subjects, organize study notes, and accelerate research comprehension.",
  },
  {
    number: "04",
    title: "Future Career Awareness",
    description:
      "Understand how AI fluency and Vibe Coding complement design, engineering, research, and modern careers.",
  },
  {
    number: "05",
    title: "Creative Exploration",
    description:
      "Discover how to pair human originality with generative tools for richer student projects and visual storytelling.",
  },
  {
    number: "06",
    title: "Certificate of Participation",
    description:
      "Receive official Workshop 2027 recognition documenting your participation in the live Generative AI session.",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const WORKSHOP_FAQS: FAQItem[] = [
  {
    question: "When and where will the workshop take place?",
    answer:
      "The workshop takes place on 9 December (Wednesday) at 9:30 PM Night as a One-Night Online Live Meeting hosted on Google Meet.",
  },
  {
    question: "Why did an earlier message mention two days?",
    answer:
      "While early drafts mentioned a two-day outline, the official session has been streamlined into a single focused One-Night Online Live Meeting on 9 December at 9:30 PM via Google Meet so students can complete everything live in one evening.",
  },
  {
    question: "How do I buy a ticket or register?",
    answer:
      "Click any 'Register Now' or 'Buy Ticket' button on this page to purchase your official ticket directly through SupportKori.",
  },
  {
    question: "Who is the Main Speaker?",
    answer:
      "Sakibul Islam Sabbir — Mentor - Generative AI, Designer & Vibe Coder — will lead the main session. Additional guest speakers are upcoming and guest speaker registrations are currently open.",
  },
  {
    question: "Who organizes and sponsors the workshop?",
    answer:
      "AI FOR STUDENTS — Workshop 2027 is organized by Bismahsoft Ltd ('Innovation with Integrity Transform Your Dreams into Reality'), with Neer Fashion as the Main Sponsor. Additional sponsor slots are currently open.",
  },
  {
    question: "Do I need prior coding or AI knowledge?",
    answer:
      "No prior coding or AI experience is required. All foundational concepts, prompting techniques, and creative workflows are taught step-by-step in beginner-friendly language.",
  },
  {
    question: "Will participants receive certificates?",
    answer:
      "Yes. Registered participants who attend the live Google Meet session on 9 December will receive certificate instructions during the closing segment.",
  },
  {
    question: "Can sponsors or guest speakers still join?",
    answer:
      "Yes! Other sponsors and guest speakers are upcoming—sponsors are currently being taken and registrations are open for guest speakers. Reach out via email or the Contact page.",
  },
];
