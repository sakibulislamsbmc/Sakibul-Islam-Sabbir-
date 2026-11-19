export interface AssistantRouteSuggestion {
  label: string;
  href: string;
  description: string;
}

export interface AssistantWebSource {
  title: string;
  url: string;
}

export interface OfflineAnswerResult {
  reply: string;
  suggestedRoutes: AssistantRouteSuggestion[];
  matched: boolean;
}

export const ASSISTANT_AVATAR_URL =
  "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png";

export const ASSISTANT_WELCOME_MESSAGE =
  "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ। আমি Bismah সাব্বির স্যার এর Ai Assistant. আপনাকে কিভাবে সহযোগিতা করতে পারি?";

export const ASSISTANT_OFFLINE_NO_MATCH_MESSAGE =
  "দুঃখিত, আপনি যে বিষয়ে জানতে চেয়েছেন তার নির্দিষ্ট তথ্য এই মুহূর্তে ওয়েবসাইটের অফলাইন ভান্ডারে পাওয়া যায়নি (এখন ইন্টারনেট সংযোগ বিচ্ছিন্ন থাকায় অনলাইনে রিসার্চ করা যাচ্ছে না)। অনুগ্রহ করে সাব্বির স্যারের কোর্স, ওয়ার্কশপ, প্রজেক্ট, সার্ভিস বা যোগাযোগ সম্পর্কে অন্য কোনো প্রশ্ন করুন—আমি আনন্দের সাথে সাহায্য করব।";

export const ASSISTANT_STARTER_PROMPTS = [
  "গ্রাফিক ডিজাইন কোর্সের ফি ও মডিউল কী কী?",
  "কুরআন শিক্ষা কোর্স ফ্রি নাকি পেইড?",
  "AI Workshop 2027 কবে ও কীভাবে হবে?",
  "সাব্বির স্যারের সাথে যোগাযোগ করব কীভাবে?",
] as const;

export const WEBSITE_KNOWLEDGE_PROMPT = `
=== OFFICIAL WEBSITE KNOWLEDGE BASE (Sakibul Islam Sabbir / Bismahsoft) ===

1. IDENTITY & MENTOR PROFILE (/about-me):
- Name: Sakibul Islam Sabbir (Brand: "Sakibulislam" / "SS." / "The Architect").
- Role: Creative Designer, Video Editor, Digital Media Professional, Vibe Coder & Generative AI Mentor; Founder @ Bismahsoft Academy; Organizer at Bismahsoft Ltd.
- Tagline: "Building calm, cohesive brand and visual experiences that stay memorable."
- Location: Present Address: Badda, Dhaka, Bangladesh. Permanent Address: Durgapur, Rajshahi, Bangladesh. Serves clients worldwide.
- Academic Qualifications:
  * Bachelor of Social Science (BSS) — Rajshahi College
  * Higher Secondary Certificate (HSC) — Taherpur Degree College
  * Secondary School Certificate (SSC) — Ujalkhalshi High School
- Languages: Bangla (Native), English (Professional Working), Hindi (Working Proficiency).
- Work Experience:
  * Administrative Manager — Future Ummah International School (Jun 2026 – Sep 2026)
  * Social Media Executive — Ilm Ul Quran USA (Jan 2026 – Jul 2026)
  * Agent Branch Manager — Dutch Bangla Bank PLC (May 2025 – Oct 2025)
  * Graphic Designer — Max IT Solution (Jan 2025 – Sep 2025)
  * Sales Representative — Barnoi Lifestyle (Nov 2024 – Feb 2025)
  * Video Editor — Nutrify Mart (Jan 2024 – Jun 2024)
- Certifications: Adobe (Creative & Digital Design), As Sunnah Skill Development Institute (Small Business Management Course 2025), Procoder BD (Web Development), 10 Minute School, Bongo Academy, HP LIFE, Ononno, Rajshahi City Corporation.
- Core Services:
  1. Creative & Brand Design (Logo, Brand Identity, Social Media Creatives, Adobe Creative Suite)
  2. Video Editing & Storytelling (Short-form Reels, YouTube Long-form Edits, Commercial Ads)
  3. Meta Marketing & Web Solutions (Facebook & Instagram Ad Campaigns, Custom Full-Stack Websites, Android Apps)
  4. Operations & Institutional Administration

2. PAID COURSE (/graphic-design-course):
- Title: "Advanced Graphic Design with AI Tools Live Course" (Bismahsoft Academy).
- Mentor: Sakibul Islam Sabbir (Founder @ Bismahsoft Academy).
- Fee: ৳6,000 BDT (Regular price ৳10,000 BDT — 40% discount).
- Duration/Structure: 20+ Live Classes across 6 comprehensive Modules + Practice Files, Presets/Liquid Glass Templates, Freelance Direction, Live Client Projects & Job Support for top performers.
- 6 Modules:
  * Module 01: Adobe Photoshop (Workspace, Design Principles, Color Theory, Retouching, Photo Manipulation, Typography, Ad Poster)
  * Module 02: Adobe Illustrator (Vector Graphics, Pen Tool Mastery, Minimal & Typography Logos, Brand Identity, Packaging & Print)
  * Module 03: Artificial Intelligence (Midjourney, Adobe Firefly, DALL·E Ideation, Generative Fill, Prompt Engineering for Designers)
  * Module 04: Freelancing & Marketplace (Fiverr, Upwork, Behance, Dribbble Account & Gig Setup, Client Hunting, Dollar Withdrawal)
  * Module 05: Local Job Market & Career (BD Agency Hiring Strategy, Professional CV & Portfolio Review, Interview Techniques & 3 Special Assignments)
  * Module 06: Basic Video Editing & Animation (CapCut Pro Editing, Design-Video Fusion, Logo Animation & Motion Graphics)
- Enrollment & Payment Flow:
  * Students must sign in with their Google Account on the website (/graphic-design-course or /account).
  * Send ৳6,000 fee via bKash / Nagad / Rocket (Personal/Send Money) to +880 1410 957 506 or contact WhatsApp for instructions.
  * Submit Sender Number & Transaction ID (TrxID) inside the checkout form while signed in with Google.
  * Admin verifies payment and approves access. Students can track Live Verification Status and access Orders & Purchases at /account.
  * Sequential lesson playback + 25-MCQ quizzes per class unlock step-by-step once approved.

3. FREE QURAN COURSE (/courses):
- Title: "সহজ সূত্রে কুরআন শিখি" (As-Sunnah Foundation Online Quran Learning Course).
- Price: 100% Free (সেবামূলক ও ইসলামি শিক্ষা উদ্যোগ).
- Instructor: উস্তায মোহাম্মদ হুসাইন মাদানী (সাবেক শিক্ষক, মসজিদে নববী — মদীনা, সৌদি আরব)।
- Structure: ২৭টি ধারাবাহিক ভিডিও ক্লাস (Class 01 to Class 27), প্রতিটি ক্লাসে ২৫টি করে MCQ কুইজ।
- Anti-Skip Lock System: শিক্ষার্থীকে শুরু থেকে শেষ পর্যন্ত না টেনে সম্পূর্ণ ক্লাস দেখতে হয় এবং ক্লাস শেষে ২৫ নম্বরের MCQ কুইজ জমা দিলে পরবর্তী ক্লাস আনলক হয়।

4. AI FOR STUDENTS — WORKSHOP 2027 (/workshop):
- Title: "AI FOR STUDENTS — WORKSHOP 2027"
- Theme: "Preparing Students for an AI-Powered Future."
- Organizer: Bismahsoft Ltd ("Innovation with Integrity Transform Your Dreams into Reality").
- Main Sponsor: Neer Fashion.
- Date & Schedule: 9 December (Wednesday) at 9:30 PM Night (Bangladesh Time).
- Format & Venue: One-Night Online Live Meeting hosted on Google Meet (clarification: earlier drafts mentioned 2 days, officially streamlined into one focused night live meeting).
- Main Speaker: Sakibul Islam Sabbir (Mentor - Generative AI, Designer & Vibe Coder).
- 8 Learning Tracks: Understanding Generative AI, Exploring AI Tools, Smart Prompting, AI for Smart Study, AI for Creativity, AI for Productivity, AI for Future Skills, Responsible AI Usage.
- Ticket Booking: Official registration via SupportKori (https://www.supportkori.com/sakibul756/extras/ai-for-students-workshop-2027-gkam). Participation certificate provided. Guest speaker & additional sponsor slots open.

5. PROJECTS (/projects), BOOKS (/books) & PORTFOLIO (/portfolio):
- Website Projects (6): E-Commerce Storefront, EdTech Learning Portal, SaaS Workflow & AI Automation Hub, Creative Studio Agency Platform, Corporate FinTech Advisory Portal, Healthcare & Clinic Booking System.
- Android Apps (4): Smart Task & Habit Companion, Client Order & Delivery Tracker, Student Learning & Quiz App, Personal Finance & Expense Ledger (Kotlin, Jetpack Compose, Flutter, Firebase).
- Published Works / Books (/projects#books and /books): Official book authored by Sakibul Islam Sabbir — "মুসলিম হিসেবে আপনার যে দশটি বিষয় জানা প্রয়োজন" (পূর্বমূল্য ৳৮০ কেটে এখন সম্পূর্ণ ফ্রি উন্মুক্ত)। বইটি শুধুমাত্র ওয়েবসাইটের ভেতর সুরক্ষিত ফুল-স্ক্রিন রিডারেই পড়া যায় (অন্য কোনো ব্রাউজারে ওপেন হয় না), পড়ার সুবিধার্থে জুম ইন/আউট ও নাইট মোড আছে, অফলাইনে সেভ করে ইন্টারনেট ছাড়াই পড়া যায় এবং সোশ্যাল মিডিয়াতে লিংক শেয়ার করা যায়।
- Portfolio (/portfolio): 36 Design Concepts (Brand Identity, Social Media, Thumbnails, Posters, UI Systems) + 4 Long-Form Videos (including Barnoi Lifestyle TVC Ads, Nafees Selim Podcast in As-Sunnah Skill) + Short-Form Vertical Reels.

6. THANKFUL (/thankful):
- Heartfelt tribute to "Silent Architects": Teachers (Nasif Muhammad, Masud Rana, Nizam Uddin, MD. Ashraful Islam), Friends (Hridoy Shah Taj, Sahariar Al Rahat, Jahid Hasan, Habibul Bashar Sajib), Relatives (Alomgir Hossain Mama, MD Rocky Hossain, Yasir Arafat Prince, Ahmed Mostafa Raian), and Well-wishers.

7. CONTACT & SOCIAL LINKS (/contact):
- Primary Email: sakibulislam.rc@gmail.com (Workshop official inquiries: sakibulislamsbmc@gmail.com)
- WhatsApp: +880 1410 957 506 (https://wa.me/8801410957506) — fastest response for course enrollment, design/video/web client projects, and collaborations.
- YouTube: youtube.com/@sakibulislamrc
- Instagram: instagram.com/@sakibulislamrc
- Facebook: facebook.com/sabbirwithai7
- Client Account & Purchase Verification Dashboard: /account
`.trim();

const ROUTE_CATALOG: Array<{
  href: string;
  label: string;
  description: string;
  keywords: string[];
}> = [
  {
    href: "/graphic-design-course",
    label: "Graphic Design & AI Course",
    description: "৳6,000 পেইড লাইভ কোর্স, ৬ মডিউল ও এনরোলমেন্ট",
    keywords: [
      "graphic",
      "গ্রাফিক",
      "ডিজাইন",
      "design",
      "photoshop",
      "illustrator",
      "midjourney",
      "firefly",
      "paid course",
      "পেইড",
      "এনরোল",
      "enroll",
      "ফি",
      "6000",
      "৬০০০",
      "টাকা",
      "bkash",
      "বিকাশ",
      "নগদ",
      "trxid",
      "freelancing",
      "ফ্রিল্যান্সিং",
    ],
  },
  {
    href: "/courses",
    label: "সহজ সূত্রে কুরআন শিখি",
    description: "ফ্রি ২৭ পর্বের কুরআন শিক্ষা কোর্স ও কুইজ",
    keywords: [
      "quran",
      "কুরআন",
      "কোরআন",
      "আস-সুন্নাহ",
      "sunnah",
      "হুসাইন মাদানী",
      "madani",
      "ফ্রি",
      "free course",
      "২৭",
      "কুইজ",
      "তিলাওয়াত",
      "তাজবীদ",
    ],
  },
  {
    href: "/workshop",
    label: "AI Workshop 2027",
    description: "৯ ডিসেম্বর রাত ৯:৩০ · Google Meet লাইভ সেশন",
    keywords: [
      "workshop",
      "ওয়ার্কশপ",
      "2027",
      "students",
      "neer",
      "bismahsoft",
      "google meet",
      "গুগল মিট",
      "ticket",
      "টিকিট",
      "supportkori",
      "9 december",
      "৯ ডিসেম্বর",
      "vibe coder",
      "সেমিনার",
    ],
  },
  {
    href: "/projects",
    label: "Projects",
    description: "ওয়েবসাইট, অ্যান্ড্রয়েড অ্যাপ ও সকল প্রজেক্ট",
    keywords: [
      "project",
      "প্রজেক্ট",
      "website",
      "ওয়েবসাইট",
      "android",
      "অ্যান্ড্রয়েড",
      "app",
      "অ্যাপ",
      "kotlin",
      "flutter",
      "saas",
      "ecommerce",
    ],
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    description: "৩৬টি ডিজাইন কনসেপ্ট, টিভিসি ও ভিডিও রিলস",
    keywords: [
      "portfolio",
      "পোর্টফোলিও",
      "video",
      "ভিডিও",
      "edit",
      "এডিটিং",
      "reel",
      "রিলস",
      "tvc",
      "barnoi",
      "podcast",
      "showreel",
    ],
  },
  {
    href: "/about-me",
    label: "About Me",
    description: "সাব্বির স্যারের পরিচয়, অভিজ্ঞতা, শিক্ষা ও CV",
    keywords: [
      "about",
      "পরিচয়",
      "কে",
      "sabbir",
      "সাব্বির",
      "sakibul",
      "সাকিবুল",
      "cv",
      "সিভি",
      "resume",
      "education",
      "rajshahi",
      "dhaka",
      "experience",
      "অভিজ্ঞতা",
      "সার্ভিস",
      "service",
      "দক্ষতা",
      "skill",
    ],
  },
  {
    href: "/contact",
    label: "Contact & WhatsApp",
    description: "ইমেইল, হোয়াটসঅ্যাপ ও প্রজেক্ট ব্রিফ",
    keywords: [
      "contact",
      "যোগাযোগ",
      "whatsapp",
      "হোয়াটসঅ্যাপ",
      "email",
      "ইমেইল",
      "phone",
      "নম্বর",
      "number",
      "কথা",
      "hire",
      "হায়ার",
      "facebook",
      "youtube",
      "instagram",
      "social",
    ],
  },
  {
    href: "/account",
    label: "Account & Orders",
    description: "গুগল লগইন, পেমেন্ট ভেরিফিকেশন ও পারচেস",
    keywords: [
      "account",
      "অ্যাকাউন্ট",
      "login",
      "লগইন",
      "google",
      "গুগল",
      "order",
      "purchase",
      "verify",
      "ভেরিফাই",
      "status",
      "অর্ডার",
    ],
  },
  {
    href: "/thankful",
    label: "Thankful Tributes",
    description: "শিক্ষক, বন্ধু ও প্রিয়জনদের প্রতি কৃতজ্ঞতা",
    keywords: [
      "thankful",
      "কৃতজ্ঞতা",
      "teacher",
      "শিক্ষক",
      "friend",
      "বন্ধু",
      "relative",
      "taj",
      "rahat",
    ],
  },
];

export function findMatchingRoutes(text: string): AssistantRouteSuggestion[] {
  const normalized = text.toLowerCase();
  const scored = ROUTE_CATALOG.map((item) => {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += kw.length > 4 ? 2 : 1;
      }
    }
    return { item, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map(({ item }) => ({
    label: item.label,
    href: item.href,
    description: item.description,
  }));
}

interface OfflineKnowledgeBucket {
  id: string;
  keywords: string[];
  routeHrefs: string[];
  answerBn: string;
  answerEn: string;
}

const OFFLINE_BUCKETS: OfflineKnowledgeBucket[] = [
  {
    id: "greeting",
    keywords: [
      "সসালামু",
      "সালাম",
      "salam",
      "assalamu",
      "হ্যালো",
      "হাই",
      "hello",
      "hi",
      "hey",
      "কেমন আছ",
      "কেমন আছেন",
      "kemon acho",
      "kemon achen",
      "তুমি কে",
      "আপনি কে",
      "who are you",
      "পরিচয়",
    ],
    routeHrefs: ["/about-me", "/projects"],
    answerBn:
      "ওয়ালাইকুমুস সালাম ওয়া রাহমাতুল্লাহ! আলহামদুলিল্লাহ, আমি ভালো আছি। আমি Bismah সাব্বির স্যার এর AI Assistant। আমাদের ওয়েবসাইটের গ্রাফিক ডিজাইন ও AI কোর্স, ফ্রি কুরআন শিক্ষা কোর্স, AI Workshop 2027, প্রজেক্ট বা সাব্বির স্যারের সাথে যোগাযোগ—যেকোনো বিষয়ে আমাকে জিজ্ঞাসা করতে পারেন।",
    answerEn:
      "Wa Alaikumus Salam! I am Bismah — Sakibul Islam Sabbir Sir's AI Assistant. I can help you explore our Graphic Design & AI Live Course, Free Quran Learning Course, AI Workshop 2027, web & Android projects, portfolio, or contact details.",
  },
  {
    id: "thanks",
    keywords: ["ধন্যবাদ", "জাযাকাল্লাহ", "thank", "thanks", "shukriya", "ভালো লাগলো", "খুব সুন্দর"],
    routeHrefs: ["/contact"],
    answerBn:
      "আপনাকেও অসংখ্য ধন্যবাদ এবং জাযাকাল্লাহু খাইরান! আর কোনো প্রশ্ন থাকলে বা কোনো কোর্স/প্রজেক্ট সম্পর্কে জানতে চাইলে নির্দ্বিধায় জিজ্ঞাসা করুন।",
    answerEn:
      "You're very welcome! Please feel free to ask if you need any more information about our courses, workshop, or projects.",
  },
  {
    id: "graphic-design-course",
    keywords: [
      "গ্রাফিক",
      "graphic",
      "ডিজাইন কোর্স",
      "design course",
      "photoshop",
      "ফটোশপ",
      "illustrator",
      "ইলাস্ট্রেটর",
      "midjourney",
      "firefly",
      "dall",
      "পেইড",
      "paid",
      "ফি",
      "fee",
      "price",
      "কত টাকা",
      "6000",
      "৬০০০",
      "১০,০০০",
      "ভর্তি",
      "এনরোল",
      "enroll",
      "bkash",
      "বিকাশ",
      "nagad",
      "নগদ",
      "rocket",
      "trxid",
      "bismahsoft academy",
    ],
    routeHrefs: ["/graphic-design-course", "/account", "/contact"],
    answerBn:
      "সাব্বির স্যারের পরিচালনায় Bismahsoft Academy-র অধীনে **Advanced Graphic Design with AI Tools Live Course** কোর্সটি করতে পারবেন।\n\n• **কোর্স ফি:** ৬,০০০ টাকা (রেগুলার ফি ১০,০০০ টাকা থেকে ৪০% ছাড়)\n• **ক্লাস ও মডিউল:** ২০+ লাইভ ক্লাস ও ৬টি পূর্ণাঙ্গ মডিউল — Adobe Photoshop, Adobe Illustrator, Generative AI (Midjourney, Firefly, DALL·E), Freelancing & Marketplace (Fiverr/Upwork), Local Job Market & CV, এবং CapCut ও বেসিক মোশন গ্রাফিক্স।\n• **ভর্তি প্রক্রিয়া:** প্রথমে ওয়েবসাইটে আপনার Google অ্যাকাউন্ট দিয়ে লগইন করুন। এরপর বিকাশ/নগদ/রকেট (+880 1410 957 506) নম্বরে ৬,০০০ টাকা পাঠিয়ে ফর্মে আপনার নম্বর ও TrxID জমা দিন। অ্যাডমিন যাচাই করে অ্যাপ্রুভ করলেই আপনার কোর্স ও কুইজ সম্পূর্ণ আনলক হয়ে যাবে।",
    answerEn:
      "The **Advanced Graphic Design with AI Tools Live Course** (Bismahsoft Academy, mentored by Sakibul Islam Sabbir) includes 20+ live classes across 6 modules (Photoshop, Illustrator, Midjourney/Firefly/DALL·E, Freelancing, Local Career & CapCut Motion).\n\n• **Course Fee:** ৳6,000 BDT (regular ৳10,000)\n• **How to Enroll:** Sign in with your Google Account on `/graphic-design-course`, pay via bKash/Nagad/Rocket (+880 1410 957 506), and submit your TrxID. Once verified by Admin, all classes unlock and your status appears in `/account`.",
  },
  {
    id: "quran-course",
    keywords: [
      "কুরআন",
      "কোরআন",
      "quran",
      "সুন্নাহ",
      "sunnah",
      "হুসাইন মাদানী",
      "madani",
      "সহজ সূত্রে",
      "ফ্রি কোর্স",
      "free course",
      "তিলাওয়াত",
      "তাজবীদ",
      "২৭",
      "কুইজ",
    ],
    routeHrefs: ["/courses", "/projects"],
    answerBn:
      "জি, আমাদের ওয়েবসাইটে সম্পূর্ণ **ফ্রি** ইসলামি কোর্স হিসেবে **“সহজ সূত্রে কুরআন শিখি”** (As-Sunnah Foundation Online Quran Learning Course) যুক্ত আছে।\n\n• **প্রশিক্ষক:** উস্তায মোহাম্মদ হুসাইন মাদানী (সাবেক শিক্ষক, মসজিদে নববী)।\n• **কোর্স কাঠামো:** ২৭টি ধারাবাহিক ভিডিও ক্লাস এবং প্রতিটি ক্লাস শেষে ২৫টি করে MCQ কুইজ।\n• **লক সিস্টেম:** প্রতিটি ক্লাস শুরু থেকে শেষ পর্যন্ত না টেনে সম্পূর্ণ দেখে এবং ২৫ নম্বরের কুইজ জমা দিলে পরবর্তী ক্লাসটি স্বয়ংক্রিয়ভাবে আনলক হয়। কোনো পেমেন্ট ছাড়াই এখনই শুরু করতে পারবেন।",
    answerEn:
      "**Shohoj Sutre Quran Shikhi** (As-Sunnah Foundation Online Quran Learning Course) is **100% free** on our website.\n\n• **Instructor:** Ustadh Mohammad Hussain Madani (Former Teacher, Masjid al-Nabawi).\n• **Structure:** 27 sequential video classes, each followed by a 25-question MCQ quiz to unlock the next lesson.",
  },
  {
    id: "courses-overview",
    keywords: ["কোর্স", "course", "courses", "শিখতে", "class", "ক্লাস", "লার্নিং"],
    routeHrefs: ["/graphic-design-course", "/courses", "/projects"],
    answerBn:
      "আমাদের ওয়েবসাইটে বর্তমানে ২টি পূর্ণাঙ্গ কোর্স রয়েছে:\n\n১. **সহজ সূত্রে কুরআন শিখি (ফ্রি):** ২৭টি ভিডিও ক্লাস ও ক্লাস-ভিত্তিক ২৫টি MCQ কুইজ। (উস্তায মোহাম্মদ হুসাইন মাদানী)\n২. **Advanced Graphic Design with AI Tools Live Course (পেইড - ৬,০০০ টাকা):** ২০+ লাইভ ক্লাস, ৬টি মডিউল (Photoshop, Illustrator, Midjourney/Firefly, Freelancing, Career & CapCut)। (মেন্টর: সাকিবুল ইসলাম সাব্বির)\n\nআপনি কোন কোর্সটি সম্পর্কে বিস্তারিত জানতে চান?",
    answerEn:
      "We currently offer two structured courses:\n1. **Shohoj Sutre Quran Shikhi (Free):** 27 video classes + 25 MCQs per class.\n2. **Advanced Graphic Design with AI Tools Live Course (Paid — ৳6,000):** 20+ classes across 6 modules mentored by Sakibul Islam Sabbir.",
  },
  {
    id: "workshop",
    keywords: [
      "workshop",
      "ওয়ার্কশপ",
      "2027",
      "ai for students",
      "সেমিনার",
      "neer fashion",
      "bismahsoft",
      "গুগল মিট",
      "google meet",
      "৯ ডিসেম্বর",
      "9 december",
      "ticket",
      "টিকিট",
      "supportkori",
    ],
    routeHrefs: ["/workshop", "/projects"],
    answerBn:
      "**AI FOR STUDENTS — WORKSHOP 2027** হলো শিক্ষার্থীদের জন্য প্র্যাক্টিক্যাল জেনারেটিভ AI বিষয়ক একটি বিশেষ লাইভ সেশন।\n\n• **সময় ও তারিখ:** ৯ ডিসেম্বর (বুধবার), রাত ৯:৩০ মিনিট (One-Night Online Live Meeting)।\n• **প্ল্যাটফর্ম:** Google Meet (অনলাইনে যেকোনো জায়গা থেকে যুক্ত হওয়া যাবে)।\n• **আয়োজক ও স্পন্সর:** আয়োজনে Bismahsoft Ltd এবং মেইন স্পন্সর Neer Fashion।\n• **মেইন স্পিকার:** Sakibul Islam Sabbir (Mentor - Generative AI, Designer & Vibe Coder)।\n• **টিকিট ও রেজিস্ট্রেশন:** `/workshop` পেজে গিয়ে “Register Now / Buy Ticket” বাটনে ক্লিক করে SupportKori থেকে অফিশিয়াল আসন বুক করা যাবে। অংশগ্রহণকারীদের জন্য সার্টিফিকেটের ব্যবস্থাও রয়েছে।",
    answerEn:
      "**AI FOR STUDENTS — WORKSHOP 2027** takes place on **9 December (Wednesday) at 9:30 PM Night** as a One-Night Online Live Meeting on **Google Meet**.\n\n• **Organizer:** Bismahsoft Ltd · **Main Sponsor:** Neer Fashion · **Main Speaker:** Sakibul Islam Sabbir.\n• Covers 8 practical AI tracks & Vibe Coding. Register directly via SupportKori from `/workshop`.",
  },
  {
    id: "about-sabbir",
    keywords: [
      "সাব্বির",
      "sabbir",
      "সাকিবুল",
      "sakibul",
      "স্যার",
      "sir",
      "about",
      "অভিজ্ঞতা",
      "experience",
      "education",
      "পড়াশোনা",
      "কলেজ",
      "rajshahi",
      "রাজশাহী",
      "ঢাকা",
      "dhaka",
      "cv",
      "সিভি",
      "সার্ভিস",
      "service",
      "কাজ করে",
    ],
    routeHrefs: ["/about-me", "/contact"],
    answerBn:
      "**সাকিবুল ইসলাম সাব্বির (Sakibul Islam Sabbir)** একজন Creative Designer, Video Editor, Digital Media Professional, Vibe Coder এবং Generative AI Mentor। তিনি **Bismahsoft Academy**-এর ফাউন্ডার।\n\n• **শিক্ষাগত যোগ্যতা:** রাজশাহী কলেজ (BSS), তাহেরপুর ডিগ্রি কলেজ (HSC), উজালখালসী উচ্চ বিদ্যালয় (SSC)।\n• **অভিজ্ঞতা:** Future Ummah International School (Administrative Manager), Ilm Ul Quran USA (Social Media Executive), Dutch Bangla Bank PLC (Agent Branch Manager), Max IT Solution (Graphic Designer), Barnoi Lifestyle এবং Nutrify Mart।\n• **সার্ভিসসমূহ:** ব্র্যান্ড ও গ্রাফিক ডিজাইন, ভিডিও এডিটিং ও রিলস, মেটা মার্কেটিং, কাস্টম ওয়েবসাইট ও অ্যান্ড্রয়েড অ্যাপ ডেভেলপমেন্ট।\n\nতাঁর পূর্ণাঙ্গ প্রোফাইল ও PDF সিভি `/about-me` পেজ থেকে দেখতে ও ডাউনলোড করতে পারবেন।",
    answerEn:
      "**Sakibul Islam Sabbir** is a Creative Designer, Video Editor, Digital Media Professional, Vibe Coder & Generative AI Mentor (Founder @ Bismahsoft Academy), based in Badda, Dhaka (originally Rajshahi).\n\nHe studied BSS at Rajshahi College and worked with Dutch Bangla Bank PLC, Ilm Ul Quran USA, Max IT Solution, and Future Ummah International School. Download his PDF CV at `/about-me`.",
  },
  {
    id: "projects-portfolio",
    keywords: [
      "project",
      "প্রজেক্ট",
      "portfolio",
      "পোর্টফোলিও",
      "website",
      "ওয়েবসাইট",
      "android",
      "অ্যান্ড্রয়েড",
      "অ্যাপ",
      "app",
      "video",
      "ভিডিও",
      "tvc",
      "রিলস",
      "reel",
      "ডিজাইন কনসেপ্ট",
    ],
    routeHrefs: ["/projects", "/portfolio"],
    answerBn:
      "সাব্বির স্যারের তৈরি উল্লেখযোগ্য প্রজেক্ট ও পোর্টফোলিও কাজগুলো দুটি পেজে সাজানো আছে:\n\n• **Projects (`/projects`):** ৬টি ফুল-স্ট্যাক ওয়েবসাইট (E-Commerce, EdTech, SaaS AI Automation, Creative Agency, FinTech, Healthcare Booking) এবং ৪টি নেটিভ অ্যান্ড্রয়েড অ্যাপ (Task Companion, Delivery Tracker, Student Quiz App, Expense Ledger)।\n• **Portfolio (`/portfolio`):** ৩৬টি ক্লায়েন্ট ডিজাইন কনসেপ্ট, ৪টি লং-ফর্ম ভিডিও (যেমন: Barnoi Lifestyle TVC, Nafees Selim Podcast) এবং শর্ট-ফর্ম ভার্টিক্যাল রিলস।",
    answerEn:
      "Explore all engineering and creative work across `/projects` (6 full-stack websites, 4 native Android apps, Workshop & Courses) and `/portfolio` (36 graphic design concepts, long-form commercials/podcasts & short-form vertical reels).",
  },
  {
    id: "contact",
    keywords: [
      "contact",
      "যোগাযোগ",
      "whatsapp",
      "হোয়াটসঅ্যাপ",
      "email",
      "ইমেইল",
      "মেইল",
      "নম্বর",
      "number",
      "ফোন",
      "phone",
      "হায়ার",
      "hire",
      "facebook",
      "youtube",
      "instagram",
      "ঠিকানা",
      "address",
    ],
    routeHrefs: ["/contact"],
    answerBn:
      "সাব্বির স্যারের সাথে সরাসরি যোগাযোগ করার মাধ্যমগুলো হলো:\n\n• **WhatsApp (সবচেয়ে দ্রুত):** +880 1410 957 506\n• **Email:** sakibulislam.rc@gmail.com (ওয়ার্কশপ-সংক্রান্ত: sakibulislamsbmc@gmail.com)\n• **সোশ্যাল মিডিয়া:** YouTube ও Instagram (`@sakibulislamrc`), Facebook (`facebook.com/sabbirwithai7`)\n\nআপনি `/contact` পেজ থেকে সরাসরি প্রজেক্ট ব্রিফ লিখে হোয়াটসঅ্যাপ বা ইমেইলে পাঠাতে পারবেন।",
    answerEn:
      "You can reach Sakibul Islam Sabbir directly via:\n• **WhatsApp:** +880 1410 957 506\n• **Email:** sakibulislam.rc@gmail.com\n• **Socials:** YouTube/Instagram `@sakibulislamrc`, Facebook `sabbirwithai7`\nOr submit a direct brief at `/contact`.",
  },
  {
    id: "account-payment",
    keywords: [
      "account",
      "অ্যাকাউন্ট",
      "login",
      "লগইন",
      "google",
      "গুগল",
      "order",
      "purchase",
      "অর্ডার",
      "verify",
      "ভেরিফিকেশন",
      "approve",
      "অ্যাপ্রুভ",
      "স্ট্যাটাস",
    ],
    routeHrefs: ["/account", "/graphic-design-course"],
    answerBn:
      "কোর্স এনরোলমেন্ট ও পেমেন্ট ভেরিফিকেশন সংক্রান্ত সব তথ্য আপনার `/account` ড্যাশবোর্ডে দেখতে পাবেন। পেইড গ্রাফিক ডিজাইন কোর্সে Google অ্যাকাউন্ট দিয়ে লগইন করে বিকাশ/নগদ/রকেটের TrxID সাবমিট করলে প্রথমে স্ট্যাটাস `Pending` থাকে এবং অ্যাডমিন যাচাই করে অ্যাপ্রুভ করলে `Approved` হয়ে সব ক্লাস আনলক হয়।",
    answerEn:
      "Sign in with Google and visit `/account` to check your Orders & Purchases verification status (`Pending` or `Approved`) for the Graphic Design & AI Live Course.",
  },
  {
    id: "thankful",
    keywords: ["thankful", "কৃতজ্ঞতা", "teacher", "শিক্ষক", "friend", "বন্ধু", "মামা", "ভাই"],
    routeHrefs: ["/thankful"],
    answerBn:
      "ওয়েবসাইটের **Thankful (`/thankful`)** পেজটি সাব্বির স্যারের জীবনের শিক্ষক, ঘনিষ্ঠ বন্ধু, আত্মীয়-স্বজন ও শুভাকাঙ্ক্ষীদের (" +
      '"Silent Architects"' +
      ") প্রতি গভীর কৃতজ্ঞতা প্রকাশ করে তৈরি করা হয়েছে—যেখানে নাসিফ মুহাম্মদ, মাসুদ রানা, নিজাম উদ্দিন, আশরাফুল ইসলাম এবং বন্ধু হৃদয় শাহ তাজ, শাহরিয়ার আল রাহাতসহ ১৬ জন প্রিয় মানুষের প্রতি সম্মাননা রয়েছে।",
    answerEn:
      "The `/thankful` page honors Sakibul Islam's teachers, close friends, relatives, and well-wishers — the silent architects who supported his journey.",
  },
];

function isMostlyEnglish(text: string): boolean {
  const bengaliChars = (text.match(/[\u0980-\u09FF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  return bengaliChars === 0 && latinChars > 3;
}

export function answerFromOfflineKnowledge(
  query: string,
  _currentPath?: string,
): OfflineAnswerResult {
  const cleaned = query.trim().toLowerCase();
  if (!cleaned) {
    return {
      reply: ASSISTANT_WELCOME_MESSAGE,
      suggestedRoutes: [],
      matched: true,
    };
  }

  let bestBucket: OfflineKnowledgeBucket | null = null;
  let bestScore = 0;

  for (const bucket of OFFLINE_BUCKETS) {
    let score = 0;
    for (const kw of bucket.keywords) {
      if (cleaned.includes(kw.toLowerCase())) {
        score += kw.length >= 5 ? 3 : 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestBucket = bucket;
    }
  }

  if (!bestBucket || bestScore === 0) {
    const english = isMostlyEnglish(query);
    return {
      reply: english
        ? "Sorry, I couldn't find specific information about that in our offline website knowledge base right now (and internet research requires an active connection). Please feel free to ask another question about our courses, AI Workshop 2027, projects, or Sakibul Islam Sabbir!"
        : ASSISTANT_OFFLINE_NO_MATCH_MESSAGE,
      suggestedRoutes: [
        {
          label: "Graphic Design & AI Course",
          href: "/graphic-design-course",
          description: "পেইড লাইভ কোর্স বিস্তারিত",
        },
        {
          label: "সহজ সূত্রে কুরআন শিখি",
          href: "/courses",
          description: "ফ্রি কুরআন শিক্ষা কোর্স",
        },
        {
          label: "Contact & WhatsApp",
          href: "/contact",
          description: "সরাসরি যোগাযোগ করুন",
        },
      ],
      matched: false,
    };
  }

  const english = isMostlyEnglish(query);
  const routeSuggestions = bestBucket.routeHrefs
    .map((href) => ROUTE_CATALOG.find((r) => r.href === href))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => ({
      label: r.label,
      href: r.href,
      description: r.description,
    }));

  return {
    reply: english ? bestBucket.answerEn : bestBucket.answerBn,
    suggestedRoutes: routeSuggestions,
    matched: true,
  };
}
