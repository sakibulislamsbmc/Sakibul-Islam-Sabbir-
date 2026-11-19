export type BookAccessType = "paid" | "free";

export type BookCoverTheme = "crimson-signal" | "obsidian-ai" | "indigo-studio" | "ivory-scholar";

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
  /** Optional free preview stream endpoint for paid books */
  previewStreamUrl?: string;
  tableOfContents: string[];
  highlights: string[];
}

export const BOOK_PAYMENT_ACCOUNT = {
  bkashNumber: "+880 1410-957506",
  nagadNumber: "+880 1410-957506",
  whatsappNumber: "+880 1410-957506",
  accountHolder: "Sakibul Islam Sabbir",
} as const;

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
      "যারা গ্রাফিক ডিজাইন শিখে প্রফেশনাল ক্লায়েন্ট ও ইন্টারন্যাশনাল ফ্রিল্যান্সিং ক্যারিয়ার গড়তে চান — তাদের জন্য এই প্রিমিয়াম স্টুডিও মাস্টারবুক। ভিজ্যুয়াল হায়ারার্কি, নন-ডেস্ট্রাকটিভ ফটোশপ রিটাচিং, ইলাস্ট্রেটর ভেক্টর লোগো, Midjourney ও Adobe Firefly প্রম্পট ওয়ার্কফ্লো থেকে শুরু করে Behance পোর্টফোলিও ও ক্লায়েন্ট হান্টিং পর্যন্ত প্রতিটি ধাপ সহজভাবে সাজানো হয়েছে। অর্ডার ও অ্যাডমিন ভেরিফিকেশনের পরপরই সম্পূর্ণ বইটি সুরক্ষিত ফুল-স্ক্রিন রিডারে আনলক হবে।",
    coverTheme: "indigo-studio",
    ogImageUrl: "/assets/aistudio/gd-course-thumbnail-BCLr_8Dp__1__8f555a45.png",
    secureStreamUrl: "/api/books/creative-design-freelance-blueprint/stream",
    previewStreamUrl: "/api/books/creative-design-freelance-blueprint/stream?mode=preview",
    tableOfContents: [
      "Chapter 01: The 3-Second Rule of High-Converting Commercial Design",
      "Chapter 02: Adobe Photoshop Commercial Ad Creatives & Lighting Match",
      "Chapter 03: Adobe Illustrator Vector Craft & Complete Brand Identity",
      "Chapter 04: Generative AI Workflow (Midjourney & Adobe Firefly)",
      "Chapter 05: Behance Portfolio, Pricing & Winning International Clients",
    ],
    highlights: [
      "এককালীন পেমেন্ট ৳১৫০ — অ্যাডমিন ভেরিফিকেশনের পর লাইফটাইম ইন-সাইট এক্সেস",
      "কেনার আগে ফ্রি প্রিভিউ পড়ে মান যাচাই করার সুবিধা",
      "সুরক্ষিত ফুল-স্ক্রিন ইন-সাইট রিডার ও অফলাইন রিডিং ভল্ট সাপোর্ট",
      "Bismahsoft Academy-এর গ্রাফিক ডিজাইন ও AI পেইড কোর্সের সাথে সমন্বিত গাইড",
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
