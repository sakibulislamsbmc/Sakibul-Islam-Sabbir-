import type { QuizQuestion } from "./course-quizzes";
import { GRAPHIC_DESIGN_COURSE } from "./graphic-design-course-data";

export const GD_QUIZ_DURATION_SECONDS = 10 * 60; // 10-minute assessment per class

export const GRAPHIC_DESIGN_CLASS_QUIZZES: Record<string, QuizQuestion[]> = Object.fromEntries(
  GRAPHIC_DESIGN_COURSE.lessons.map((lesson, idx) => {
    const num = idx + 1;
    const baseQuestions: QuizQuestion[] = [
      {
        id: `${lesson.id}-q1`,
        question: `${lesson.classLabel} (${lesson.moduleCode}) অনুযায়ী "${lesson.topicTitle}"-এর মূল লক্ষ্য কী?`,
        options: [
          lesson.keyTakeaways[0] ?? "ইন্ডাস্ট্রি স্ট্যান্ডার্ড ডিজাইন ওয়ার্কফ্লো শেখা",
          "শুধুমাত্র ডিফল্ট ফিল্টার ব্যবহার করে ছবি এক্সপোর্ট করা",
          "ক্লায়েন্ট ব্রিফ ছাড়াই র‍্যান্ডম রঙ ব্যবহার করা",
          "রেজোলিউশন কমিয়ে ফাইল সেভ করা",
        ],
        correctIndex: 0,
        explanation: `${lesson.classLabel}-এর প্রথম মূল শিক্ষণীয় বিষয় হলো: ${lesson.keyTakeaways[0]}.`,
      },
      {
        id: `${lesson.id}-q2`,
        question: `প্রিন্ট ডিজাইনের (যেমন বিজনেস কার্ড বা ব্রোশিউর) ক্ষেত্রে কোন কালার মোড ও রেজোলিউশন স্ট্যান্ডার্ড?`,
        options: [
          "RGB মোড এবং 72 DPI",
          "CMYK মোড এবং 300 DPI",
          "Indexed Color এবং 96 DPI",
          "Grayscale এবং 150 DPI",
        ],
        correctIndex: 1,
        explanation:
          "প্রিন্ট মিডিয়ায় সঠিক রঙ এবং শার্প প্রিন্ট আউটপুটের জন্য সবসময় CMYK কালার মোড ও 300 DPI ব্যবহৃত হয়।",
      },
      {
        id: `${lesson.id}-q3`,
        question: `ডিজিটাল ও সোশ্যাল মিডিয়া ডিজাইনে সাধারণত কোন কালার মোড ব্যবহার করা হয়?`,
        options: ["CMYK", "Pantone Spot", "RGB", "Duotone Only"],
        correctIndex: 2,
        explanation:
          "স্ক্রিন বা ডিজিটাল ডিসপ্লে (Web, Mobile, Social Media) আলো নিঃসরণ করে, তাই RGB (Red, Green, Blue) ব্যবহৃত হয়।",
      },
      {
        id: `${lesson.id}-q4`,
        question: `Generative AI টুলস (Midjourney, Firefly, DALL·E) ডিজাইনে ব্যবহারের সবচেয়ে কার্যকর উপায় কোনটি?`,
        options: [
          "ডিজাইন প্রিন্সিপল ও টাইপোগ্রাফি পুরোপুরি বাদ দেওয়া",
          "দ্রুত কনসেপ্ট আইডিয়েশন, কাস্টম অ্যাসেট তৈরি ও Photoshop/Illustrator-এ রিফাইন করা",
          "ক্লায়েন্টকে শুধু আন-এডিটেড র-ইমেজ পাঠিয়ে দেওয়া",
          "ফন্ট সাইজ না দেখেই প্রিন্ট দেওয়া",
        ],
        correctIndex: 1,
        explanation:
          "AI হলো ডিজাইনারের ক্রিয়েটিভ কো-পাইলট—AI দিয়ে কনসেপ্ট বা অ্যাসেট তৈরি করে Photoshop ও Illustrator-এ প্রফেশনাল ফিনিশিং দেওয়া সবচেয়ে কার্যকর।",
      },
      {
        id: `${lesson.id}-q5`,
        question: `${lesson.classLabel}-এ আলোচিত দ্বিতীয় গুরুত্বপূর্ণ কৌশল কোনটি?`,
        options: [
          "লেয়ারের নামকরণ না করে এলোমেলো কাজ করা",
          lesson.keyTakeaways[1] ?? "নন-ডেস্ট্রাকটিভ এডিটিং ও প্রফেশনাল গ্রিড ব্যবহার",
          "ভেক্টর ফাইলের বদলে লো-কোয়ালিটি JPEG পাঠানো",
          "ক্লায়েন্টের ফিডব্যাক উপেক্ষা করা",
        ],
        correctIndex: 1,
        explanation: `এই ক্লাসে বিশেষ গুরুত্ব দেওয়া হয়েছে: ${lesson.keyTakeaways[1]}.`,
      },
      {
        id: `${lesson.id}-q6`,
        question: `লোগো ডিজাইনের জন্য কোন সফটওয়্যার এবং ফাইল ফরম্যাট সবচেয়ে আদর্শ?`,
        options: [
          "Adobe Photoshop (.JPG)",
          "Adobe Illustrator (.AI / .SVG / .EPS)",
          "MS Word (.DOCX)",
          "CapCut (.MP4)",
        ],
        correctIndex: 1,
        explanation:
          "লোগো যেকোনো সাইজে (বিজনেস কার্ড থেকে বিলবোর্ড) না ফেটে ব্যবহারের জন্য ভেক্টর সফটওয়্যার Adobe Illustrator এবং .AI/.SVG/.EPS ফরম্যাট স্ট্যান্ডার্ড।",
      },
      {
        id: `${lesson.id}-q7`,
        question: `${lesson.classLabel}-এর প্র্যাকটিক্যাল অ্যাসাইনমেন্ট বা ডেলিভারেবল কী?`,
        options: [
          lesson.practiceDeliverable,
          "কোনো প্র্যাকটিস ছাড়াই পরের ক্লাসে চলে যাওয়া",
          "অন্যের পোর্টফোলিও কপি করে জমা দেওয়া",
          "শুধু থিওরি মুখস্থ রাখা",
        ],
        correctIndex: 0,
        explanation: `এই ক্লাসের নির্ধারিত প্র্যাকটিস ডেলিভারেবল: ${lesson.practiceDeliverable}.`,
      },
      {
        id: `${lesson.id}-q8`,
        question: `ফ্রীল্যান্সিং মার্কেটপ্লেসে (Fiverr/Upwork) ক্লায়েন্টের আস্থা অর্জনের সেরা উপায় কোনটি?`,
        options: [
          "ভুয়া স্ক্রিনশট ব্যবহার করা",
          "রিলেভেন্ট রিয়েল পোর্টফোলিও কেস স্টাডি, পরিষ্কার ব্রিফ বোঝা ও সময়মতো ডেলিভারি",
          "অত্যন্ত কম দামে সব কাজ অফার করা",
          "ক্লায়েন্টের প্রশ্নের উত্তর দেরিতে দেওয়া",
        ],
        correctIndex: 1,
        explanation:
          "স্ট্রং পোর্টফোলিও কেস স্টাডি, পেশাদার কমিউনিকেশন ও টাইমলাইন মেনে কোয়ালিটি ডেলিভারি ক্লায়েন্টের দীর্ঘমেয়াদী আস্থা তৈরি করে।",
      },
      {
        id: `${lesson.id}-q9`,
        question: `ভিডিও এডিটিং (CapCut) ও গ্রাফিক ডিজাইনের সমন্বয়ে কোন সুবিধা পাওয়া যায়?`,
        options: [
          "হাই-রিটেনশন রিলস, কাস্টম ওভারলে এবং লোগো অ্যানিমেশনের মাধ্যমে সার্ভিসের মান ও আয় বৃদ্ধি",
          "ভিডিওর কোয়ালিটি নষ্ট হয়ে যায়",
          "গ্রাফিক ডিজাইনের প্রয়োজন ফুরিয়ে যায়",
          "শুধু অডিও ফাইল তৈরি হয়",
        ],
        correctIndex: 0,
        explanation:
          "গ্রাফিক্স, টাইপোগ্রাফি এবং বেসিক মোশন/ভিডিও এডিটিং জানা থাকলে ক্লায়েন্টদের ফুল সোশ্যাল মিডিয়া প্যাকেজ দেওয়া যায়।",
      },
      {
        id: `${lesson.id}-q10`,
        question: `${lesson.classLabel} (${num}/20) সফলভাবে সম্পন্ন করার পর আপনার পরবর্তী ধাপ কী?`,
        options: [
          "নির্ধারিত প্র্যাকটিস ও সাপোর্ট রিসোর্স ব্যবহার করে পরবর্তী ক্লাস ও প্রজেক্টে এগিয়ে যাওয়া",
          "ক্লাস না করেই সার্টিফিকেট আশা করা",
          "সব প্রজেক্ট ফাইল ডিলিট করে দেওয়া",
          "প্র্যাকটিস ফাইল কখনো না দেখা",
        ],
        correctIndex: 0,
        explanation:
          "প্রতিটি ক্লাসের প্র্যাকটিস ও কুইজ শেষ করে ধারাবাহিকভাবে পরের ক্লাস সম্পন্ন করলে কোর্স শেষে আপনার স্ট্রং পোর্টফোলিও তৈরি হবে।",
      },
    ];

    return [lesson.id, baseQuestions];
  }),
);
