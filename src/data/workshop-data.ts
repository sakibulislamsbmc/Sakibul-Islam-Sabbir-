import workshopOverviewImg from "@/assets/images/workshop_overview_scene_1794783449709.jpg";
import workshopHeroImg from "@/assets/images/workshop_hero_sculpture_1794783448550.jpg";

export const WORKSHOP_ASSETS = {
  logo: "/images/ai-for-students-logo.png",
  heroVisual: workshopHeroImg,
  overviewScene: workshopOverviewImg,
} as const;

export const EVENT_CONFIG = {
  eventName: "AI FOR STUDENTS",
  edition: "WORKSHOP 2027",
  category: "Generative AI Education & Practical Workshop",
  targetAudience: "Students",
  theme: "Preparing Students for an AI-Powered Future.",
  organizer: "Bizmahoot",
  mainSponsor: "Neer Fashion",
  tagline: "Innovation with Integrity Transform Your Dreams into Reality",
  // Set an ISO 8601 date string (e.g. "2027-02-15T09:00:00+06:00") when the official event date is confirmed.
  eventDateIso: null as string | null,
  eventDateLabel: "[DATE TO BE ANNOUNCED]",
  eventVenueLabel: "[VENUE TO BE ANNOUNCED]",
  registrationFeeLabel: "[FREE / PAID — TBA]",
  registrationDeadlineLabel: "[DEADLINE — TBA]",
  officialEmail: "contact@bizmahoot.org",
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
    value: "[XX]+",
    label: "Expected Students",
    note: "Final seat capacity announced with venue confirmation",
  },
  {
    value: "[XX]",
    label: "Practical Learning Sessions",
    note: "Guided demonstrations and student Q&A across 2 days",
  },
  {
    value: "[XX]+",
    label: "AI Tools Explored",
    note: "Curated workflows for study, creativity, and productivity",
  },
  {
    value: "[XX]",
    label: "Days of Learning",
    note: "Structured foundation to real-world application",
  },
];

export interface SpeakerSlotItem {
  id: string;
  name: string;
  designation: string;
  organization: string;
  topicFocus: string;
  status: string;
}

export const SPEAKER_SLOTS: SpeakerSlotItem[] = [
  {
    id: "speaker-1",
    name: "[Speaker Name 01]",
    designation: "[Keynote Educator · Generative AI]",
    organization: "[Organization / Institution — TBA]",
    topicFocus: "Foundations of Generative AI & Student Readiness",
    status: "Editable Speaker Slot",
  },
  {
    id: "speaker-2",
    name: "[Speaker Name 02]",
    designation: "[Lead Mentor · Prompt Engineering]",
    organization: "[Organization / Institution — TBA]",
    topicFocus: "Smart Prompting & Study Productivity Workflows",
    status: "Editable Speaker Slot",
  },
  {
    id: "speaker-3",
    name: "[Speaker Name 03]",
    designation: "[Creative Technologist · AI Ethics]",
    organization: "[Organization / Institution — TBA]",
    topicFocus: "Creative Ideation & Responsible AI Integrity",
    status: "Editable Speaker Slot",
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
    role: "Chief Guest",
    title: "[Guest Name — To Be Announced]",
    affiliation: "Official announcement prior to Workshop 2027",
  },
  {
    id: "guest-2",
    role: "Special Guest",
    title: "[Guest Name — To Be Announced]",
    affiliation: "Industry & Academic Leadership",
  },
  {
    id: "guest-3",
    role: "Honorary Guest",
    title: "[Guest Name — To Be Announced]",
    affiliation: "Sponsored & Supported Community Representative",
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
    status: "Open for Campus Clubs",
  },
  {
    category: "Media Partners",
    description: "Student publications, digital media outlets, and campus broadcasters.",
    status: "Announcements Pending",
  },
  {
    category: "Technology Partners",
    description: "AI tooling platforms and technical infrastructure supporters.",
    status: "Confirmation In Progress",
  },
  {
    category: "Education Partners",
    description: "Universities, colleges, and student skill development institutions.",
    status: "Open for Institutions",
  },
  {
    category: "Supporting Partners",
    description: "Organizations aligned with ethical AI literacy for students.",
    status: "Partnership Inquiries Open",
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

export interface ScheduleDayItem {
  id: "day-1" | "day-2";
  dayLabel: string;
  theme: string;
  subtitle: string;
  sessions: ScheduleSessionItem[];
}

export const WORKSHOP_SCHEDULE: ScheduleDayItem[] = [
  {
    id: "day-1",
    dayLabel: "DAY 01",
    theme: "DISCOVER & UNDERSTAND",
    subtitle: "Foundations of Generative AI, tool literacy, and structured prompting",
    sessions: [
      {
        id: "d1-s1",
        time: "[09:00 AM — TBA]",
        title: "Opening Ceremony",
        category: "Ceremony",
        speaker: "Bizmahoot Organizing Team & Neer Fashion",
        description:
          "Welcome remarks introducing the AI FOR STUDENTS Workshop 2027 vision, partner acknowledgments, and learning roadmap.",
      },
      {
        id: "d1-s2",
        time: "[09:45 AM — TBA]",
        title: "Welcome Session: The AI Era for Students",
        category: "Keynote",
        speaker: "[Keynote Speaker — TBA]",
        description:
          "Exploring how Generative AI is reshaping education, problem-solving, and early-career opportunities for students.",
      },
      {
        id: "d1-s3",
        time: "[10:30 AM — TBA]",
        title: "Introduction to Generative AI",
        category: "Core Concept",
        speaker: "[Workshop Mentor — TBA]",
        description:
          "Clear, accessible breakdown of how generative models process context, synthesize information, and assist human thinking.",
      },
      {
        id: "d1-s4",
        time: "[11:45 AM — TBA]",
        title: "How AI Thinks & Responds",
        category: "Core Concept",
        speaker: "[Workshop Mentor — TBA]",
        description:
          "Understanding tokens, context windows, hallucinations, and why human judgment remains central when working with AI.",
      },
      {
        id: "d1-s5",
        time: "[02:00 PM — TBA]",
        title: "Hands-On AI Prompting Fundamentals",
        category: "Practical Lab",
        speaker: "[Lead Instructor — TBA]",
        description:
          "Interactive exercises in framing roles, constraints, examples, and iterative refinement for reliable student outputs.",
      },
      {
        id: "d1-s6",
        time: "[03:30 PM — TBA]",
        title: "Live Demonstration of AI Tools",
        category: "Live Demo",
        speaker: "[Technical Mentor — TBA]",
        description:
          "Guided walkthrough of modern AI tools for study synthesis, structured research, visual ideation, and workflow support.",
      },
      {
        id: "d1-s7",
        time: "[04:30 PM — TBA]",
        title: "Student Q&A Session",
        category: "Interactive Forum",
        speaker: "Day 01 Mentors Panel",
        description:
          "Open floor for student questions covering tool selection, study scenarios, and practical Day 01 concepts.",
      },
    ],
  },
  {
    id: "day-2",
    dayLabel: "DAY 02",
    theme: "EXPLORE & APPLY",
    subtitle: "Smart study workflows, creativity, ethical usage, and career readiness",
    sessions: [
      {
        id: "d2-s1",
        time: "[09:30 AM — TBA]",
        title: "AI for Study & Academic Productivity",
        category: "Workshop Module",
        speaker: "[Academic Mentor — TBA]",
        description:
          "Building study summaries, concept breakdowns, flashcards, and time-blocking workflows without sacrificing deep learning.",
      },
      {
        id: "d2-s2",
        time: "[10:45 AM — TBA]",
        title: "AI for Creative Thinking & Design Ideas",
        category: "Creative Lab",
        speaker: "[Creative Technologist — TBA]",
        description:
          "Using generative tools as a creative collaborator for presentations, visual concepts, and original project ideation.",
      },
      {
        id: "d2-s3",
        time: "[12:00 PM — TBA]",
        title: "AI Tools for Future Career Preparation",
        category: "Career Readiness",
        speaker: "[Industry Mentor — TBA]",
        description:
          "How students across technical and non-technical disciplines can develop AI fluency for portfolios, projects, and teams.",
      },
      {
        id: "d2-s4",
        time: "[02:00 PM — TBA]",
        title: "Ethical & Responsible AI Use",
        category: "Ethics & Integrity",
        speaker: "[Workshop Mentor — TBA]",
        description:
          "Aligning with Bizmahoot's integrity ethos: avoiding plagiarism, verifying facts, protecting privacy, and owning your work.",
      },
      {
        id: "d2-s5",
        time: "[03:15 PM — TBA]",
        title: "Interactive Student Activity",
        category: "Collaborative Activity",
        speaker: "All Facilitators",
        description:
          "Guided team challenge where students apply structured prompting and critical verification to a real study scenario.",
      },
      {
        id: "d2-s6",
        time: "[04:15 PM — TBA]",
        title: "Career & Learning Roadmap",
        category: "Action Plan",
        speaker: "[Keynote Mentor — TBA]",
        description:
          "A practical 90-day post-workshop learning roadmap for continuing independent practice after Workshop 2027.",
      },
      {
        id: "d2-s7",
        time: "[05:00 PM — TBA]",
        title: "Closing & Certificate Moment",
        category: "Closing Ceremony",
        speaker: "Bizmahoot & Neer Fashion",
        description:
          "Closing address, sponsor appreciation, group reflections, and certificate distribution moment for participants.",
      },
    ],
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
      "Move beyond surface hype through live demonstrations, prompt frameworks, and guided hands-on thinking.",
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
      "Understand how AI fluency complements engineering, design, communication, management, and modern careers.",
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
      "Receive official Workshop 2027 recognition documenting your active participation in the Generative AI learning tracks.",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const WORKSHOP_FAQS: FAQItem[] = [
  {
    question: "Who can join this workshop?",
    answer:
      "AI FOR STUDENTS — Workshop 2027 is specifically designed for school, college, and university students from any academic discipline who want to understand Generative AI practically and responsibly.",
  },
  {
    question: "Do I need prior coding or AI knowledge?",
    answer:
      "No prior coding or AI experience is required. All foundational concepts, prompting techniques, and tool workflows are taught step-by-step in beginner-friendly language.",
  },
  {
    question: "What is Generative AI?",
    answer:
      "Generative AI refers to modern artificial intelligence systems capable of generating structured text, explanations, summaries, code, visuals, and creative concepts based on human prompts and context.",
  },
  {
    question: "Who organizes the workshop?",
    answer:
      "Workshop 2027 is organized by Bizmahoot under the guiding ethos 'Innovation with Integrity Transform Your Dreams into Reality'.",
  },
  {
    question: "Who is the main sponsor?",
    answer:
      "Neer Fashion is the proud Main Sponsor supporting AI FOR STUDENTS — Workshop 2027 and student access to future-ready AI education.",
  },
  {
    question: "Will participants receive certificates?",
    answer:
      "Yes. Eligible participants who complete the workshop sessions will receive an official Certificate of Participation during the closing certificate moment.",
  },
  {
    question: "What should students bring?",
    answer:
      "Students are encouraged to bring a notebook, pen, and a laptop or smartphone (if available) for interactive activities. Full venue checklists will be shared once the schedule is finalized.",
  },
  {
    question: "How can I register?",
    answer:
      "Official registration opens as soon as Bizmahoot announces the confirmed 2027 event date, venue, and fee details. Use the Register Now action on this page to view updates or contact the organizing team.",
  },
];
