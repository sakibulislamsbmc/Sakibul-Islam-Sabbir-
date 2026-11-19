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
  /** Same-origin secure stream endpoint (never opens in external browser) */
  secureStreamUrl: string;
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
      "পড়ার সুবিধার্থে জুম ইন / জুম আউট ও নাইট-মোড রিডিং সাপোর্ট",
    ],
  },
];

export function getBookById(bookId: string): BookItem | undefined {
  return BOOKS_CATALOG.find((book) => book.id === bookId);
}
