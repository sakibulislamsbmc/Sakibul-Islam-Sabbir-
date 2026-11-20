import type { BillingMethod } from "../lib/firebase";

export type BookAccessType = "paid" | "free";

export type BookCoverTheme = "crimson-signal" | "obsidian-ai" | "indigo-studio" | "ivory-scholar";

export interface BookSamplePage {
  pageNumber: number;
  labelBn: string;
  chapterTag: string;
  headingBn: string;
  headingEn: string;
  excerptBn: string;
  keyPointsBn: string[];
}

export interface BookPaymentChannel {
  method: BillingMethod;
  shortLabel: string;
  labelBn: string;
  accountType: string;
  accountNumber: string;
  copyValue: string;
  accountHolder: string;
  bankDetails?: string;
  instructionBn: string;
  referenceLabelBn: string;
  referencePlaceholder: string;
  accentClass: string;
}

export interface BookItem {
  id: string;
  slug: string;
  badgeLabel: "EBOOK" | "FREE EBOOK";
  title: string;
  englishTitle: string;
  coverTitleTop: string;
  coverTitleMain: string;
  coverSubtitle: string;
  authorBn: string;
  authorEn: string;
  authorRoleBn: string;
  category: string;
  accessType: BookAccessType;
  priceBdt: number;
  regularPriceBdt?: number;
  pagesCount?: number;
  edition: string;
  language: string;
  shortDescription: string;
  fullSynopsis: string;
  coverTheme: BookCoverTheme;
  coverImageUrl?: string;
  /** Social share OpenGraph image (always a raster image so Facebook/WhatsApp show book cover, never profile photo) */
  ogImageUrl: string;
  /** Same-origin secure stream endpoint (never opens in external browser) */
  secureStreamUrl: string;
  /** Optional free preview stream endpoint for paid books ("একটু পড়ে দেখুন") */
  previewStreamUrl?: string;
  /** Rokomari / Wafilife style readable sample pages for paid books */
  samplePages?: BookSamplePage[];
  tableOfContents: string[];
  highlights: string[];
}

export const BOOK_PAYMENT_ACCOUNT = {
  bkashNumber: "+880 1410-957506",
  nagadNumber: "+880 1410-957506",
  rocketNumber: "+880 1410-957506",
  bankName: "Dutch-Bangla Bank PLC (DBBL)",
  bankBranch: "Dhaka / Agent Banking",
  bankContact: "+880 1410-957506",
  whatsappNumber: "+880 1410-957506",
  accountHolder: "Sakibul Islam Sabbir",
} as const;

export const BOOK_PAYMENT_CHANNELS: BookPaymentChannel[] = [
  {
    method: "bKash",
    shortLabel: "bKash",
    labelBn: "বিকাশ (bKash)",
    accountType: "bKash Personal • Send Money",
    accountNumber: "+880 1410-957506",
    copyValue: "01410957506",
    accountHolder: "Sakibul Islam Sabbir",
    instructionBn:
      "বিকাশ অ্যাপ থেকে Send Money করে পেমেন্ট সম্পন্ন করুন এবং প্রাপ্ত Transaction ID (TrxID) নিচের ফর্মে জমা দিন।",
    referenceLabelBn: "bKash Transaction ID (TrxID)",
    referencePlaceholder: "যেমন: BK9X4T2M81",
    accentClass: "border-pink-500/40 bg-pink-500/10 text-pink-700 dark:text-pink-300",
  },
  {
    method: "Nagad",
    shortLabel: "Nagad",
    labelBn: "নগদ (Nagad)",
    accountType: "Nagad Personal • Send Money",
    accountNumber: "+880 1410-957506",
    copyValue: "01410957506",
    accountHolder: "Sakibul Islam Sabbir",
    instructionBn:
      "নগদ অ্যাপ থেকে Send Money করে নির্ধারিত টাকা পাঠিয়ে Transaction ID (TrxID) নিচের ফর্মে লিখুন।",
    referenceLabelBn: "Nagad Transaction ID (TrxID)",
    referencePlaceholder: "যেমন: 73K9P2M1",
    accentClass: "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  },
  {
    method: "Rocket",
    shortLabel: "Rocket",
    labelBn: "রকেট (Rocket)",
    accountType: "DBBL Rocket Personal • Send Money",
    accountNumber: "+880 1410-957506",
    copyValue: "01410957506",
    accountHolder: "Sakibul Islam Sabbir",
    instructionBn:
      "ডাচ-বাংলা রকেট (Rocket) থেকে Send Money করে পেমেন্ট সম্পন্ন করুন এবং Transaction ID নিচে সাবমিট করুন।",
    referenceLabelBn: "Rocket Transaction ID (TrxID)",
    referencePlaceholder: "যেমন: RK4829104",
    accentClass: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
  {
    method: "Dutch-Bangla Bank",
    shortLabel: "Bank A/C",
    labelBn: "ব্যাংক একাউন্ট (DBBL)",
    accountType: "Dutch-Bangla Bank PLC • Bank Transfer",
    accountNumber: "+880 1410-957506",
    copyValue: "01410957506",
    accountHolder: "Sakibul Islam Sabbir",
    bankDetails:
      "Bank: Dutch-Bangla Bank PLC (DBBL) • A/C Name: Sakibul Islam Sabbir • Branch: Dhaka / Agent Banking (একাউন্ট নং কনফার্মেশন: +880 1410-957506)",
    instructionBn:
      "ব্যাংক ট্রান্সফার / ডিপোজিট সম্পন্ন করে Bank Transfer Reference, FT নম্বর অথবা ডিপোজিট স্লিপ নম্বর নিচে লিখুন।",
    referenceLabelBn: "Bank Transfer Reference / Slip No.",
    referencePlaceholder: "যেমন: DBBL-FT-928374 / Slip No.",
    accentClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
];

export const BOOKS_CATALOG: BookItem[] = [
  {
    id: "muslim-ten-essential-topics",
    slug: "muslim-ten-essential-topics",
    badgeLabel: "FREE EBOOK",
    title: "মুসলিম হিসেবে আপনার যে দশটি বিষয় জানা প্রয়োজন",
    englishTitle: "Ten Essential Matters Every Muslim Should Know",
    coverTitleTop: "মুসলিমের",
    coverTitleMain: "যে বিষয় জানা আবশ্যক",
    coverSubtitle: "একজন মুসলিমের প্রয়োজনীয় ও আবশ্যক দশটি বিষয়ের সংক্ষিপ্ত গাইড",
    authorBn: "সাকিবুল ইসলাম",
    authorEn: "Sakibul Islam Sabbir",
    authorRoleBn: "লেখক ও ক্রিয়েটর",
    category: "Islamic Knowledge & Essential Guide",
    accessType: "free",
    priceBdt: 0,
    regularPriceBdt: 80,
    edition: "ফ্রি স্পেশাল এডিশন • ২০২৬",
    language: "বাংলা",
    shortDescription:
      "এই ই-বুকটিতে একজন মুসলিমের প্রয়োজনীয় এবং আবশ্যক দশটি বিষয়ের কথা আলোচনা করা হয়েছে, যেটি জানা এবং মেনে চলা অতীব জরুরি।",
    fullSynopsis:
      "একজন মুসলিম হিসেবে দৈনন্দিন জীবনে যে দশটি মৌলিক ও আবশ্যক বিষয় সঠিকভাবে জানা এবং মেনে চলা অতীব জরুরি — সেগুলো অত্যন্ত সহজ, প্রাঞ্জল ও সুস্পষ্ট ভাষায় এই ই-বুকটিতে তুলে ধরা হয়েছে। বইটির পূর্বমূল্য ৳৮০ টাকা নির্ধারিত থাকলেও সবার উপকারের উদ্দেশ্যে এটি এখন সম্পূর্ণ ফ্রি উন্মুক্ত করে দেওয়া হয়েছে। সরাসরি ওয়েবসাইটের সুরক্ষিত ফুল-স্ক্রিন রিডারেই বইটি পড়তে এবং অফলাইনে সেভ করে রাখতে পারবেন।",
    coverTheme: "ivory-scholar",
    coverImageUrl: "/assets/aistudio/20261120_050618_c170d0a9.jpg",
    ogImageUrl: "/assets/aistudio/20261120_050618_c170d0a9.jpg",
    secureStreamUrl: "/api/books/muslim-ten-essential-topics/stream",
    tableOfContents: [
      "ভূমিকা: একজন মুসলিমের মৌলিক দ্বীনি জ্ঞানের গুরুত্ব",
      "দশটি প্রয়োজনীয় ও আবশ্যক বিষয়ের ধারাবাহিক আলোচনা",
      "দৈনন্দিন আমল ও সচেতনতার বাস্তব নির্দেশনা",
      "উপসংহার ও দ্বীনি জীবনের করণীয়",
    ],
    highlights: [
      "পূর্বমূল্য ৳৮০ — এখন সবার জন্য ১০০% ফ্রি উন্মুক্ত",
      "সুরক্ষিত ফুল-স্ক্রিন ইন-সাইট রিডার (অন্য ব্রাউজারে ওপেন হবে না)",
      "অফলাইনে সেভ করে ইন্টারনেট ছাড়াই যেকোনো সময় পড়ার সুবিধা",
      "পড়ার সুবিধার্থে জুম ইন/আউট, ডানে-বামে ও উপরে-নিচে স্ক্রল এবং নাইট-মোড",
    ],
  },
  {
    id: "creative-design-freelance-blueprint",
    slug: "creative-design-freelance-blueprint",
    badgeLabel: "EBOOK",
    title: "গ্রাফিক ডিজাইন ও ফ্রিল্যান্সিং মাস্টারবুক",
    englishTitle: "Graphic Design & Freelancing Masterbook",
    coverTitleTop: "গ্রাফিক ডিজাইন ও",
    coverTitleMain: "ফ্রিল্যান্সিং মাস্টারবুক",
    coverSubtitle: "Photoshop, Illustrator, AI টুলস ও ইন্টারন্যাশনাল ক্লায়েন্ট ইনকাম গাইড",
    authorBn: "সাকিবুল ইসলাম সাব্বির",
    authorEn: "Sakibul Islam Sabbir",
    authorRoleBn: "ফাউন্ডার, Bismahsoft Academy",
    category: "Graphic Design, AI Tools & Freelancing",
    accessType: "paid",
    priceBdt: 150,
    regularPriceBdt: 280,
    pagesCount: 6,
    edition: "প্রিমিয়াম স্টুডিও এডিশন • ২০২৬",
    language: "বাংলা ও ইংরেজি",
    shortDescription:
      "Adobe Photoshop, Illustrator ও Generative AI টুলস ব্যবহার করে প্রফেশনাল ব্র্যান্ড ডিজাইন এবং Fiverr/Upwork ক্লায়েন্ট অর্জনের পূর্ণাঙ্গ রোডম্যাপ।",
    fullSynopsis:
      "যারা গ্রাফিক ডিজাইন শিখে প্রফেশনাল ক্লায়েন্ট ও ইন্টারন্যাশনাল ফ্রিল্যান্সিং ক্যারিয়ার গড়তে চান — তাদের জন্য এই প্রিমিয়াম স্টুডিও মাস্টারবুক। ভিজ্যুয়াল হায়ারার্কি, নন-ডেস্ট্রাকটিভ ফটোশপ রিটাচিং, ইলাস্ট্রেটর ভেক্টর লোগো, Midjourney ও Adobe Firefly প্রম্পট ওয়ার্কফ্লো থেকে শুরু করে Behance পোর্টফোলিও ও ক্লায়েন্ট হান্টিং পর্যন্ত প্রতিটি ধাপ সহজভাবে সাজানো হয়েছে। গুগল একাউন্টে লগইন করে বিকাশ/নগদ/রকেট/ব্যাংকের মাধ্যমে অর্ডার ও অ্যাডমিন ভেরিফিকেশনের পরপরই সম্পূর্ণ বইটি আনলক হবে।",
    coverTheme: "indigo-studio",
    ogImageUrl: "/assets/aistudio/gd-course-thumbnail-BCLr_8Dp__1__8f555a45.png",
    secureStreamUrl: "/api/books/creative-design-freelance-blueprint/stream",
    previewStreamUrl: "/api/books/creative-design-freelance-blueprint/stream?mode=preview",
    samplePages: [
      {
        pageNumber: 1,
        labelBn: "পৃষ্ঠা ০১ • ভূমিকা ও রোডম্যাপ",
        chapterTag: "STUDIO EDITION • INTRO",
        headingBn: "কেন এই গ্রাফিক ডিজাইন ও ফ্রিল্যান্সিং মাস্টারবুক?",
        headingEn: "From Commercial Brand Design & AI Tools to International Client Income",
        excerptBn:
          "আজকের ডিজিটাল বাজারে শুধু ফটোশপ বা ইলাস্ট্রেটরের টুলস জানাটাই যথেষ্ট নয়। ক্লায়েন্টরা খোঁজেন এমন একজন ডিজাইনার, যিনি বিজনেস প্রবলেম বুঝে ৩ সেকেন্ডে নজর কাড়ার মতো ভিজ্যুয়াল তৈরি করতে পারেন এবং AI টুলস (Midjourney, Adobe Firefly) দিয়ে কাজের গতি কয়েকগুণ বাড়াতে পারেন। এই মাস্টারবুকে বাস্তব স্টুডিও প্রজেক্ট, ব্র্যান্ড আইডেন্টিটি ও ইন্টারন্যাশনাল ক্লায়েন্ট হান্টিং-এর সম্পূর্ণ ফ্রেমওয়ার্ক ধাপে ধাপে সাজানো হয়েছে।",
        keyPointsBn: [
          "অধ্যায় ০১: ভিজ্যুয়াল হায়ারার্কি, গ্রিড সিস্টেম ও কমার্শিয়াল টাইপোগ্রাফি",
          "অধ্যায় ০২: ফটোশপ নন-ডেস্ট্রাকটিভ রিটাচিং, লাইটিং ম্যাচ ও অ্যাড ক্রিয়েটিভ",
          "অধ্যায় ০৩: ইলাস্ট্রেটর ভেক্টর লোগো, নেগেটিভ স্পেস ও ব্র্যান্ড গাইডলাইন",
          "অধ্যায় ০৪-০৫: Midjourney/Firefly ওয়ার্কফ্লো + Behance, Fiverr ও Upwork ইনকাম",
        ],
      },
      {
        pageNumber: 2,
        labelBn: "পৃষ্ঠা ০২ • অধ্যায় ০১ (নমুনা)",
        chapterTag: "CHAPTER 01 • SAMPLE EXCERPT",
        headingBn: "হাই-কনভার্টিং ডিজাইনের ৩-সেকেন্ড রুল",
        headingEn: "The 3-Second Rule of High-Converting Commercial Design",
        excerptBn:
          "ফেসবুক, ইনস্টাগ্রাম বা বিহ্যান্সে স্ক্রল করার সময় দর্শক আপনার ডিজাইনের দিকে মাত্র ৩ সেকেন্ড সময় দেন। দক্ষ ডিজাইনাররা কখনোই পুরো ক্যানভাস ভরে ফেলেন না — বরং পরিমিত হোয়াইটস্পেস ও কনট্রাস্ট ব্যবহার করে দর্শকের চোখকে নির্দিষ্ট পথে চালিত করেন: Focal Hook → মূল হেডলাইন → বিশ্বাসযোগ্যতা (Proof) → কল-টু-অ্যাকশন (CTA)।",
        keyPointsBn: [
          "একটি সোশ্যাল মিডিয়া ডিজাইনে সর্বোচ্চ ২টি ফন্ট ফ্যামিলি ও ৩টি সাইজ ব্যবহার করুন।",
          "প্রোডাক্ট বা মূল হেডলাইনের চারপাশে অন্তত ৩০%-৪০% পরিচ্ছন্ন হোয়াইটস্পেস রাখুন।",
          "৯০% শান্ত নিউট্রাল রঙের সাথে মাত্র ১০% ডমিন্যান্ট অ্যাকসেন্ট কালার ব্যবহার করুন।",
          "ডিজাইন শেষে ২৫% জুম আউট করে দেখুন — ছোট অবস্থাতেও মূল মেসেজ স্পষ্ট পড়া গেলে তা রেডি।",
        ],
      },
    ],
    tableOfContents: [
      "Chapter 01: The 3-Second Rule of High-Converting Commercial Design",
      "Chapter 02: Adobe Photoshop Commercial Ad Creatives & Lighting Match",
      "Chapter 03: Adobe Illustrator Vector Craft & Complete Brand Identity",
      "Chapter 04: Generative AI Workflow (Midjourney & Adobe Firefly)",
      "Chapter 05: Behance Portfolio, Pricing & Winning International Clients",
    ],
    highlights: [
      "গুগল একাউন্টের সাথে কানেক্টেড — বিকাশ, নগদ, রকেট বা ব্যাংক একাউন্টে পেমেন্ট",
      "রকমারি/ওয়াফিলাইফের মতো কেনার আগে ফ্রি স্যাম্পল পৃষ্ঠা পড়ার সুবিধা (একটু পড়ে দেখুন)",
      "TrxID সাবমিটের পর Pending Verification → অ্যাডমিন অ্যাপ্রুভ করলেই বই আনলক",
      "সুরক্ষিত ফুল-স্ক্রিন ইন-সাইট রিডার ও অফলাইন রিডিং ভল্ট সাপোর্ট",
    ],
  },
];

export function getBookById(bookId: string): BookItem | undefined {
  return BOOKS_CATALOG.find((book) => book.id === bookId);
}

export function getBookBySlug(slug?: string): BookItem | undefined {
  if (!slug) return undefined;
  return BOOKS_CATALOG.find((book) => book.slug === slug || book.id === slug);
}

export function getBookSocialImagePath(book: BookItem): string {
  return book.coverImageUrl || book.ogImageUrl;
}
