export interface GraphicDesignLesson {
  id: string;
  serial: string;
  number: number;
  moduleCode: string;
  moduleTitle: string;
  classLabel: string;
  topicTitle: string;
  durationLabel: string;
  summary: string;
  keyTakeaways: string[];
  practiceDeliverable: string;
  aiPromptOrPreset: string;
  softwareTools: string[];
}

export interface GraphicDesignModule {
  code: string;
  title: string;
  subtitle: string;
  topics: string[];
}

export const GRAPHIC_DESIGN_COURSE = {
  id: "advanced-graphic-design-ai-2026",
  slug: "graphic-design-course",
  route: "/graphic-design-course",
  title: "Advanced Graphic Design with AI Tools Live Course",
  tagline: "Level up your creativity. Master modern design.",
  kicker: "Official Live Course Masterclass · Graphic Design • Live Bootcamp • 2026",
  description:
    "আধুনিক গ্রাফিক ডিজাইনের পাশাপাশি Midjourney, Adobe Firefly ও DALL·E-এর মতো AI টুলস ব্যবহার করে কীভাবে কম সময়ে হাই-ভ্যালু ব্র্যান্ডিং, ভিজ্যুয়াল এবং মার্কেটপ্লেস-রেডি ডিজাইন তৈরি করতে হয়—তার পরিপূর্ণ ২০+ ক্লাসের প্র্যাক্টিক্যাল লাইভ বুটক্যাম্প।",
  thumbnail: "/assets/aistudio/gd-course-thumbnail-BCLr_8Dp__1__8f555a45.png",
  priceBdt: 6000,
  originalPriceBdt: 10000,
  rating: "4.9",
  reviewCount: "340+",
  enrolledCount: "৪৮০+ শিক্ষার্থী",
  whatsappNumber: "+8801410957506",
  whatsappUrl:
    "https://wa.me/8801410957506?text=Assalamu%20Alaikum%2C%20I%20want%20to%20join%20the%20Advanced%20Graphic%20Design%20with%20AI%20Tools%20Live%20Course.",
  highlights: ["Beginner to Advanced", "Live Course", "20+ Class", "Support Included"],
  guarantees: [
    "নিশ্চিত লাইভ প্রজেক্টে অংশগ্রহণের সুযোগ",
    "বাঙালি ক্লায়েন্টদের সাথে রিয়েল-টাইম কাজ",
    "ভালো পারফর্মারদের জন্য নিশ্চিত জব সাপোর্ট",
    "হ্যান্ডস-অন স্টেপ-বাই-স্টেপ প্র্যাক্টিক্যাল লার্নিং",
  ],
  targetAudience: [
    {
      code: "01",
      title: "Students & Professionals",
      description:
        "স্কুল-কলেজ ও ইউনিভার্সিটিতে পড়ুয়া ছাত্রছাত্রী যারা পড়াশোনার পাশাপাশি ডিজাইনের সাথে এআই ব্যবহার করে আয় করতে চায়।",
    },
    {
      code: "02",
      title: "Freelancers",
      description:
        "চাকরি বা ব্যবসার পাশাপাশি অনলাইন থেকে ডিজাইনিং করে প্রফেশনাল সার্ভিসের মাধ্যমে আয় করতে চায়।",
    },
    {
      code: "03",
      title: "Career Seekers",
      description:
        "যারা গ্রাফিক ডিজাইন শিখতে ইচ্ছুক এবং এআই-এর মাধ্যমে নিজেদের কাজ সহজ করে সফল ক্যারিয়ার গড়তে চায়।",
    },
  ],
  learningOutcomes: [
    {
      code: "Skill #1",
      title: "Modern AI Integration",
      description:
        "Midjourney, Adobe Firefly, DALL·E ব্যবহার করে আধুনিক লেভেলের ডিজাইন তৈরি করার পূর্ণাঙ্গ কৌশল।",
    },
    {
      code: "Skill #2",
      title: "Advanced PS & AI",
      description:
        "Adobe Illustrator এবং Photoshop-এ অ্যাডভান্সড লেভেলের কাজ ও কমার্শিয়াল প্রজেক্ট সম্পন্ন করা।",
    },
    {
      code: "Skill #3",
      title: "Branding & Logo Design",
      description:
        "আধুনিক কনসেপ্টে AI-powered লোগো এবং কমপ্লিট ব্র্যান্ড আইডেন্টিটি তৈরি করার টেকনিক।",
    },
    {
      code: "Skill #4",
      title: "Marketplace Strategy",
      description:
        "Fiverr, Upwork, Behance এবং Dribbble-এ নিজের পোর্টফোলিও সাজিয়ে নিয়মিত ক্লায়েন্ট পাওয়ার উপায়।",
    },
    {
      code: "Skill #5",
      title: "Modern Portfolio",
      description:
        "ফ্রীল্যান্সিং এবং চাকরির জন্য স্ট্রং পোর্টফোলিও, প্রফেশনাল সিভি ও ইন্টারভিউ প্রস্তুতি।",
    },
    {
      code: "Skill #6",
      title: "Efficient AI Workflow",
      description:
        "AI টুলস ব্যবহার করে কাজের গতি ও প্রোডাক্টিভিটি বাড়ানোর আধুনিক ইন্ডাস্ট্রি স্ট্যান্ডার্ড উপায়।",
    },
  ],
  modules: [
    {
      code: "Module 01",
      title: "Adobe Photoshop",
      subtitle: "ফটোশপ মাস্টারি ও ভিজ্যুয়াল ম্যানিপুলেশন",
      topics: [
        "টুলসের বিস্তারিত ব্যবহার এবং ডিজাইন প্রিন্সিপলস",
        "ইমেজ এডিটিং, রিটাচিং এবং ম্যানিপুলেশন",
        "ফটোশপের প্র্যাকটিক্যাল প্রজেক্ট এবং টাইপোগ্রাফি ডিজাইন",
        "সফটওয়্যার গাইডলাইনস এবং প্রফেশনাল ওয়ার্কস্পেস সেটআপ",
      ],
    },
    {
      code: "Module 02",
      title: "Adobe Illustrator",
      subtitle: "ভেক্টর গ্রাফিক্স, লোগো ও ব্র্যান্ড আইডেন্টিটি",
      topics: [
        "টুলসের বিস্তারিত ব্যবহার এবং ডিজাইন প্রিন্সিপলস",
        "লোগো, ব্র্যান্ড এবং স্টেশনারি ডিজাইন",
        "প্রিন্ট ও ডিজিটাল কনটেন্ট ডিজাইন (সোশ্যাল মিডিয়া ও প্যাকেজিং)",
        "প্র্যাক্টিক্যাল প্রজেক্ট এবং পোর্টফোলিও রেডি আউটপুট",
      ],
    },
    {
      code: "Module 03",
      title: "Artificial Intelligence (AI)",
      subtitle: "জেনারেটিভ এআই দিয়ে দ্রুত ও আধুনিক ডিজাইন",
      topics: [
        "এআই ব্যবহার করে আইডিয়েশন এবং কনসেপ্ট ডেভেলপমেন্ট",
        "আইডিয়াকে প্রফেশনাল ডিজাইনে রূপান্তর করার কৌশল",
        "Midjourney, Adobe Firefly এবং DALL·E ইন্টিগ্রেশন",
      ],
    },
    {
      code: "Module 04",
      title: "Freelancing & Marketplace",
      subtitle: "গ্লোবাল মার্কেটপ্লেস ও ক্লায়েন্ট হান্টিং",
      topics: [
        "অ্যাকাউন্ট এবং প্রফেশনাল গিগ সেটআপ",
        "ক্লায়েন্ট কমিউনিকেশন এবং বিডিং স্ট্র্যাটেজি",
        "ডলার ট্রান্সফার এবং উইথড্রয়াল প্রসেস",
      ],
    },
    {
      code: "Module 05",
      title: "Local Job Market & Career",
      subtitle: "লোকাল এজেন্সি ক্যারিয়ার ও সিভি গাইড",
      topics: [
        "বাংলাদেশের লোকাল কোম্পানিতে জব সার্চিং স্ট্র্যাটেজি",
        "প্রফেশনাল সিভি গাইড এবং পোর্টফোলিও রিভিউ",
        "ইন্টারভিউ টেকনিক এবং ৩টি স্পেশাল অ্যাসাইনমেন্ট",
      ],
    },
    {
      code: "Module 06",
      title: "Basic Video Editing & Animation",
      subtitle: "ক্যাপকাট এডিটিং ও লোগো মোশন গ্রাফিক্স",
      topics: [
        "CapCut দিয়ে প্রফেশনাল ভিডিও এডিটিং",
        "ভিডিও এডিটিং ও গ্রাফিক ডিজাইনের সমন্বয়",
        "লোগো অ্যানিমেশন ও বেসিক মোশন গ্রাফিক্স",
      ],
    },
  ] satisfies GraphicDesignModule[],
  offerExtras: [
    {
      code: "01",
      title: "Practice Files",
      items: ["Editable Sample Files", "Project Assets", "Demo Materials"],
    },
    {
      code: "02",
      title: "Preset / Template Ideas",
      items: [
        "Text Presets",
        "Logo Animation Templates",
        "Motion Graphics Templates",
        "Liquid Glass Effect Templates",
      ],
    },
    {
      code: "03",
      title: "Freelance Direction",
      items: ["Skill Sales Strategy", "Client Readiness Checklist", "Portfolio Building Roadmap"],
    },
  ],
  mentor: {
    name: "Sakibul Islam Sabbir",
    roleTitle: "Founder @ Bismahsoft Academy",
    designation: "Creative Designer, Digital Media Professional & Generative AI Mentor",
    avatar:
      "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png",
    bio: "ডিজাইন, ব্র্যান্ডিং, ভিডিও প্রোডাকশন এবং জেনারেটিভ এআই ওয়ার্কফ্লোতে দীর্ঘ বাস্তব অভিজ্ঞতাসম্পন্ন ক্রিয়েটিভ মেন্টর। দেশি-বিদেশি ক্লায়েন্ট প্রজেক্ট ও ডিজিটাল মার্কেটিং ক্যাম্পেইন পরিচালনার পাশাপাশি শিক্ষার্থীদের হাতে-কলমে ইন্ডাস্ট্রি-স্ট্যান্ডার্ড ডিজাইন ও এআই ইন্টিগ্রেশন শেখান।",
  },
  lessons: [
    {
      id: "gd-class-01",
      serial: "01",
      number: 1,
      moduleCode: "Module 01",
      moduleTitle: "Adobe Photoshop",
      classLabel: "Class 01",
      topicTitle: "Photoshop Workspace, Design Principles & Color Fundamentals",
      durationLabel: "65 Mins · Live Recording + Lab",
      summary:
        "ডিজাইনের মূল নীতি (Contrast, Alignment, Balance, Hierarchy), ফটোশপ ইন্টারফেস অপ্টিমাইজেশন, RGB বনাম CMYK কালার স্পেস এবং প্রফেশনাল প্রজেক্ট ফাইল সেটআপ।",
      keyTakeaways: [
        "ক্যানভাস সাইজ, রেজোলিউশন (72 DPI vs 300 DPI) এবং আর্টবোর্ড ম্যানেজমেন্ট",
        "লেয়ার মাস্ক, স্মার্ট অবজেক্ট ও নন-ডেস্ট্রাকটিভ এডিটিং ওয়ার্কফ্লো",
        "প্রফেশনাল কালার হারমোনি ও কনট্রাস্ট চেকলিস্ট",
      ],
      practiceDeliverable: "একটি ১080×1350px সোশ্যাল মিডিয়া প্রোডাক্ট পোস্টার লেআউট তৈরি করা",
      aiPromptOrPreset: "Preset Pack: Studio_Canvas_Starter.psd + RGB/CMYK Swatch Kit",
      softwareTools: ["Adobe Photoshop 2025", "Color Wheel"],
    },
    {
      id: "gd-class-02",
      serial: "02",
      number: 2,
      moduleCode: "Module 01",
      moduleTitle: "Adobe Photoshop",
      classLabel: "Class 02",
      topicTitle: "Advanced Selection, Subject Cutout & Portrait Retouching",
      durationLabel: "70 Mins · Hands-On Lab",
      summary:
        "Pen Tool, Select Subject ও Refine Edge ব্যবহার করে চুল ও সূক্ষ্ম অংশের নিখুঁত কাটআউট, ফ্রিকোয়েন্সি সেপারেশন এবং কমার্শিয়াল প্রোডাক্ট রিটাচিং।",
      keyTakeaways: [
        "Pen Tool দিয়ে জটিল পাথ ও ক্লিপিং পাথ তৈরি",
        "Camera Raw Filter ও স্কিন-টোন ব্যালেন্সিং",
        "প্রোডাক্ট ফটোগ্রাফি থেকে দাগ দূর ও শার্পনিং",
      ],
      practiceDeliverable: "যেকোনো ২টি ই-কমার্স প্রোডাক্ট এবং ১টি পোর্ট্রেট প্রফেশনাল রিটাচিং",
      aiPromptOrPreset: "Action Pack: Pro_Skin_Retouch_FrequencySep.atn",
      softwareTools: ["Adobe Photoshop", "Camera Raw"],
    },
    {
      id: "gd-class-03",
      serial: "03",
      number: 3,
      moduleCode: "Module 01",
      moduleTitle: "Adobe Photoshop",
      classLabel: "Class 03",
      topicTitle: "Creative Photo Manipulation, Lighting & Shadows",
      durationLabel: "75 Mins · Creative Compositing",
      summary:
        "বাস্তবসম্মত শ্যাডো, হাইলাইট, রিম লাইটিং এবং ব্লেন্ডিং মোড ব্যবহার করে কমার্শিয়াল অ্যাড ম্যানিপুলেশন ও ইউটিউব থাম্বনেইল কম্পোজিটিং।",
      keyTakeaways: [
        "Match Color ও Curves-এর মাধ্যমে একাধিক ছবিকে এক পরিবেশে আনা",
        "Drop Shadow বনাম Cast Shadow ও Ambient Occlusion তৈরি",
        "রিম লাইটিং এবং এটমোসফেরিক গ্লো টেকনিক",
      ],
      practiceDeliverable: "একটি সিনেম্যাটিক ব্র্যান্ড ম্যানিপুলেশন অ্যাড ডিজাইন করা",
      aiPromptOrPreset: "Brush Pack: Atmospheric_Smoke_RimLight.abr",
      softwareTools: ["Adobe Photoshop", "Generative Fill"],
    },
    {
      id: "gd-class-04",
      serial: "04",
      number: 4,
      moduleCode: "Module 01",
      moduleTitle: "Adobe Photoshop",
      classLabel: "Class 04",
      topicTitle: "Typography Hierarchy & High-Conversion Social Media Creatives",
      durationLabel: "70 Mins · Commercial Project",
      summary:
        "বাংলা ও ইংরেজি ফন্ট পেয়ারিং, টেক্সট প্রিসেট, লিকুইড গ্লাস ইফেক্ট এবং ফেসবুক-ইনস্টাগ্রাম বিজ্ঞাপনের জন্য হাই-কনভার্টিং সোশ্যাল মিডিয়া ডিজাইন।",
      keyTakeaways: [
        "ফন্ট পেয়ারিং (Hind Siliguri + Plus Jakarta Sans / Display Fonts)",
        "Layer Style দিয়ে গ্লাসমর্ফিক ও 3D টেক্সট ইফেক্ট",
        "ক্লায়েন্ট অ্যাপ্রুভালের জন্য প্রফেশনাল মকআপ প্রেজেন্টেশন",
      ],
      practiceDeliverable: "একটি ফ্যাশন বা টেক ব্র্যান্ডের জন্য ৩টি কারাউসেল অ্যাড ডিজাইন",
      aiPromptOrPreset: "Liquid Glass Effect Template + 12 Text Presets Pack",
      softwareTools: ["Adobe Photoshop", "Liquid Glass Presets"],
    },
    {
      id: "gd-class-05",
      serial: "05",
      number: 5,
      moduleCode: "Module 02",
      moduleTitle: "Adobe Illustrator",
      classLabel: "Class 05",
      topicTitle: "Vector Mechanics, Pen Tool Mastery & Shape Builder",
      durationLabel: "65 Mins · Vector Foundation",
      summary:
        "Adobe Illustrator-এ বেজিয়ার কার্ভ, Pen Tool নিয়ন্ত্রণ, Pathfinder ও Shape Builder দিয়ে নিখুঁত জ্যামিতিক আইকন ও কাস্টম ভেক্টর ইলাস্ট্রেশন।",
      keyTakeaways: [
        "অ্যাঙ্কর পয়েন্ট অপ্টিমাইজেশন ও স্মুথ কার্ভ কন্ট্রোল",
        "Shape Builder ও Pathfinder দিয়ে দ্রুত জটিল শেপ গঠন",
        "গ্রিড সিস্টেমে স্কেলেবল ভেক্টর আইকন সেট তৈরি",
      ],
      practiceDeliverable: "একটি মিনিমালিস্টিক ব্র্যান্ড আইকন সেট (৬টি আইকন)",
      aiPromptOrPreset: "Illustrator Grid System: 8pt_Vector_Blueprint.ai",
      softwareTools: ["Adobe Illustrator 2025"],
    },
    {
      id: "gd-class-06",
      serial: "06",
      number: 6,
      moduleCode: "Module 02",
      moduleTitle: "Adobe Illustrator",
      classLabel: "Class 06",
      topicTitle: "Brand Strategy, Logo Construction & Golden Ratio Grids",
      durationLabel: "80 Mins · Logo Workshop",
      summary:
        "ক্লায়েন্ট ব্রিফ বিশ্লেষণ, ওয়ার্ডমার্ক, মনোগ্রাম ও অ্যাবস্ট্রাক্ট লোগো কনস্ট্রাকশন এবং Golden Ratio গ্রিডের মাধ্যমে টাইমলেস লোগো ডিজাইন।",
      keyTakeaways: [
        "Creative Brief থেকে মাইন্ড-ম্যাপিং ও কনসেপ্ট স্কেচিং",
        "লোগো টাইপ: Wordmark, Lettermark, Pictorial, Combination",
        "সাদা-কালো (Monochrome) ও ছোট সাইজে লোগো টেস্ট করার নিয়ম",
      ],
      practiceDeliverable: "যেকোনো একটি টেক বা ফ্যাশন ব্র্যান্ডের লোগো কনসেপ্ট ও গ্রিড শীট",
      aiPromptOrPreset: "Logo Construction Kit: Golden_Ratio_Circles.ai",
      softwareTools: ["Adobe Illustrator", "Golden Ratio Grid"],
    },
    {
      id: "gd-class-07",
      serial: "07",
      number: 7,
      moduleCode: "Module 02",
      moduleTitle: "Adobe Illustrator",
      classLabel: "Class 07",
      topicTitle: "Corporate Stationery, Print Ready Files & Packaging Basics",
      durationLabel: "70 Mins · Print & Brand Kit",
      summary:
        "বিজনেস কার্ড, লেটারহেড, আইডি কার্ড, ব্রোশিউর ও বক্স প্যাকেজিংয়ের জন্য Bleed, Trim, Safe Margin এবং প্রিন্ট-রেডি PDF/X-1a এক্সপোর্ট।",
      keyTakeaways: [
        "CMYK প্রোফাইল, ব্লিড (0.125 inch) ও ওভারপ্রিন্ট সেটিংস",
        "ট্রাই-ফোল্ড ব্রোশিউর ও ডাই-লাইন (Die-Line) প্যাকেজিং সেটআপ",
        "কর্পোরেট ব্র্যান্ড গাইডলাইন ডকুমেন্ট তৈরি করা",
      ],
      practiceDeliverable: "কমপ্লিট স্টেশনারি প্যাকেজ (বিজনেস কার্ড + লেটারহেড + খাম)",
      aiPromptOrPreset: "Print Ready Kit: Bleed_Margin_Templates_BD_Global.ait",
      softwareTools: ["Adobe Illustrator", "Print Production"],
    },
    {
      id: "gd-class-08",
      serial: "08",
      number: 8,
      moduleCode: "Module 02",
      moduleTitle: "Adobe Illustrator",
      classLabel: "Class 08",
      topicTitle: "Vector Realism, Portfolio Case Study & Client Presentation",
      durationLabel: "75 Mins · Capstone Module 02",
      summary:
        "ব্র্যান্ড আইডেন্টিটির সম্পূর্ণ প্রেজেন্টেশন স্লাইড, Behance/Dribbble কেস স্টাডি স্ট্রাকচার এবং প্রিন্ট-টু-ডিজিটাল ফাইনাল অ্যাসাইনমেন্ট।",
      keyTakeaways: [
        "Mockup ছাড়া কীভাবে ভেক্টর প্রেজেন্টেশন আকর্ষণীয় করা যায়",
        "Color Palette, Font Specimen ও Brand Usage Guidelines সাজানো",
        "ক্লায়েন্টকে সোর্স ফাইল (.AI, .EPS, .SVG, .PDF, .PNG) ডেলিভারি চেকলিস্ট",
      ],
      practiceDeliverable: "একটি পূর্ণাঙ্গ ব্র্যান্ড আইডেন্টিটি কেস স্টাডি (৮ স্লাইড)",
      aiPromptOrPreset: "Behance_Brand_Presentation_Deck_Template.ai",
      softwareTools: ["Adobe Illustrator", "Photoshop Mockups"],
    },
    {
      id: "gd-class-09",
      serial: "09",
      number: 9,
      moduleCode: "Module 03",
      moduleTitle: "Artificial Intelligence (AI)",
      classLabel: "Class 09",
      topicTitle: "AI Prompt Engineering for Visual Designers & Concept Ideation",
      durationLabel: "70 Mins · AI Core Lab",
      summary:
        "ডিজাইন-স্পেসিফিক প্রম্পট আর্কিটেকচার, স্টাইল রেফারেন্স (SREF), ক্যামেরা অ্যাঙ্গেল, লাইটিং কীওয়ার্ড এবং জেনারেটিভ এআই দিয়ে দ্রুত কনসেপ্ট ভিজ্যুয়ালাইজেশন।",
      keyTakeaways: [
        "Prompt Formula: Subject + Medium + Lighting + Composition + Aspect Ratio",
        "ক্লায়েন্ট মুডবোর্ড তৈরিতে এআই-এর ব্যবহার",
        "কপিরাইট ও কমার্শিয়াল সেফটি গাইডলাইন",
      ],
      practiceDeliverable: "একই প্রোডাক্টের জন্য ৩টি ভিন্ন স্টাইলের মুডবোর্ড জেনারেশন",
      aiPromptOrPreset: "Prompt Vault: 50+ Commercial_Graphic_Design_Prompts.txt",
      softwareTools: ["Midjourney", "ChatGPT Vision"],
    },
    {
      id: "gd-class-10",
      serial: "10",
      number: 10,
      moduleCode: "Module 03",
      moduleTitle: "Artificial Intelligence (AI)",
      classLabel: "Class 10",
      topicTitle: "Midjourney & DALL·E Integration for Posters, Merch & Mascots",
      durationLabel: "75 Mins · AI Studio Practice",
      summary:
        "Midjourney v6 ও DALL·E ব্যবহার করে কাস্টম ব্যাকগ্রাউন্ড, টি-শার্ট প্রিন্ট গ্রাফিক্স, ব্র্যান্ড মাসকট এবং ইলাস্ট্রেটরের Image Trace দিয়ে ভেক্টর রূপান্তর।",
      keyTakeaways: [
        "Midjourney --ar, --stylize, --no এবং Character Reference ব্যবহার",
        "AI ইমেজকে হাই-রেজোলিউশন আপস্কেল ও নয়েজ ক্লিনিং",
        "AI Raster থেকে Clean Editable Vector তৈরি করার কৌশল",
      ],
      practiceDeliverable: "AI + Illustrator হাইব্রিড প্রসেসে ১টি কমার্শিয়াল পোস্টার তৈরি",
      aiPromptOrPreset: "Vectorize Workflow: Clean_Trace_Preset + Upscale Pipeline",
      softwareTools: ["Midjourney", "DALL·E", "Adobe Illustrator"],
    },
    {
      id: "gd-class-11",
      serial: "11",
      number: 11,
      moduleCode: "Module 03",
      moduleTitle: "Artificial Intelligence (AI)",
      classLabel: "Class 11",
      topicTitle: "Adobe Firefly, Generative Fill & AI Product Photography",
      durationLabel: "70 Mins · Hybrid AI Workflow",
      summary:
        "Adobe Firefly ও ফটোশপের Generative Fill/Expand ব্যবহার করে সাধারণ ফোনের ছবি থেকে স্টুডিও-কোয়ালিটি প্রোডাক্ট শট ও অ্যাড ব্যানার তৈরি।",
      keyTakeaways: [
        "Generative Expand দিয়ে যেকোনো রেশিওর ব্যানার অ্যাডাপ্টেশন",
        "Generative Fill দিয়ে আনওয়ান্টেড অবজেক্ট রিমুভ ও সিন রিপ্লেসমেন্ট",
        "AI-এর মাধ্যমে ডেইলি ডিজাইন প্রোডাক্টিভিটি ৩ গুণ বাড়ানো",
      ],
      practiceDeliverable: "সাধারণ প্রোডাক্ট ছবিকে স্টুডিও লাইটিং ব্যানারে রূপান্তর",
      aiPromptOrPreset: "Firefly Studio Lighting Prompt Matrix",
      softwareTools: ["Adobe Firefly", "Photoshop Generative Fill"],
    },
    {
      id: "gd-class-12",
      serial: "12",
      number: 12,
      moduleCode: "Module 04",
      moduleTitle: "Freelancing & Marketplace",
      classLabel: "Class 12",
      topicTitle: "Fiverr Account Architecture, Niche Research & SEO-Ready Gigs",
      durationLabel: "70 Mins · Marketplace Setup",
      summary:
        "Fiverr ও Upwork প্রোফাইল অপ্টিমাইজেশন, লো-কম্পিটিশন হাই-ডিমান্ড নিশ রিসার্চ এবং ক্লিক-থ্রু রেট বাড়ানো গিগ থাম্বনেইল ও প্যাকেজ প্রাইসিং।",
      keyTakeaways: [
        "AI Graphic Design & Brand Kit নিশে গিগ ট্যাগ রিসার্চ",
        "কনভার্টিং গিগ থাম্বনেইল এবং ডেসক্রিপশন ফর্মুলা",
        "Starter / Standard / Premium প্যাকেজ স্ট্রাকচার",
      ],
      practiceDeliverable: "নিজের প্রফেশনাল Fiverr গিগ টাইটেল, ট্যাগ ও থাম্বনেইল ড্রাফট",
      aiPromptOrPreset: "Marketplace Copy Kit: High_Converting_Gig_Template.docx",
      softwareTools: ["Fiverr", "Upwork"],
    },
    {
      id: "gd-class-13",
      serial: "13",
      number: 13,
      moduleCode: "Module 04",
      moduleTitle: "Freelancing & Marketplace",
      classLabel: "Class 13",
      topicTitle: "Behance, Dribbble Portfolio Building & Inbound Client Funnel",
      durationLabel: "65 Mins · Portfolio Showcase",
      summary:
        "Behance ও Dribbble-এ ইন্টারন্যাশনাল মানের পোর্টফোলিও প্রজেক্ট পাবলিশ করা, LinkedIn আউটরিচ এবং সোশ্যাল মিডিয়া থেকে ডিরেক্ট ক্লায়েন্ট আকর্ষণ।",
      keyTakeaways: [
        "Behance SEO-friendly প্রজেক্ট টাইটেল ও কাভার ডিজাইন",
        "লিংকডইন ও ফেসবুক গ্রুপ থেকে অর্গানিক ক্লায়েন্ট লিড সংগ্রহ",
        "বাঙালি ও আন্তর্জাতিক ক্লায়েন্টের জন্য আলাদা প্রাইসিং শীট",
      ],
      practiceDeliverable: "Behance-এ প্রথম কমপ্লিট কেস স্টাডি পাবলিশ করা",
      aiPromptOrPreset: "Portfolio Case Study Blueprint + Cover Grid",
      softwareTools: ["Behance", "Dribbble", "LinkedIn"],
    },
    {
      id: "gd-class-14",
      serial: "14",
      number: 14,
      moduleCode: "Module 04",
      moduleTitle: "Freelancing & Marketplace",
      classLabel: "Class 14",
      topicTitle: "Client Communication, Upwork Proposals & Objection Handling",
      durationLabel: "70 Mins · Client Closing",
      summary:
        "প্রফেশনাল প্রপোজাল লেখা, স্কোপ ক্রিপ সামলানো, প্রাইস নেগোসিয়েশন এবং রিয়েল-টাইম বাংলা ও ইংরেজি ক্লায়েন্ট কমিউনিকেশন স্ক্রিপ্ট।",
      keyTakeaways: [
        "Upwork কভার লেটারের ৩-প্যারাগ্রাফ উইনিং স্ট্রাকচার",
        "ক্লায়েন্ট রিভিশন ও ডেডলাইন ম্যানেজমেন্টের পেশাদার নীতি",
        "লং-টার্ম রিটেইনার ক্লায়েন্ট বানানোর কৌশল",
      ],
      practiceDeliverable: "২টি বাস্তবসম্মত Upwork প্রপোজাল ও ক্লায়েন্ট অনবোর্ডিং ফর্ম লেখা",
      aiPromptOrPreset: "Proposal & Client Scripts Bundle (EN + BN)",
      softwareTools: ["Upwork", "Notion / Google Docs"],
    },
    {
      id: "gd-class-15",
      serial: "15",
      number: 15,
      moduleCode: "Module 04",
      moduleTitle: "Freelancing & Marketplace",
      classLabel: "Class 15",
      topicTitle: "Global Payments, Payoneer/Wise & Dollar Withdrawal Process",
      durationLabel: "60 Mins · Finance & Payouts",
      summary:
        "আন্তর্জাতিক ক্লায়েন্টদের থেকে নিরাপদে পেমেন্ট গ্রহণ (Payoneer, Wise, মার্কেটপ্লেস উইথড্রয়াল), ইনভয়েসিং এবং বাংলাদেশ ব্যাংক বা বিকাশে ডলার উত্তোলনের নিয়ম।",
      keyTakeaways: [
        "ইনভয়েস তৈরি ও মাইলস্টোন পেমেন্ট স্ট্রাকচার (50% Upfront + 50% Final)",
        "Payoneer ও লোকাল ব্যাংক/bKash লিংকিং প্রক্রিয়া",
        "ফ্রিল্যান্সার অ্যাকাউন্ট সেফটি ও ট্যাক্স বেসিকস",
      ],
      practiceDeliverable: "একটি প্রফেশনাল ক্লায়েন্ট ইনভয়েস টেমপ্লেট সেটআপ",
      aiPromptOrPreset: "Agency_Client_Invoice_Template.pdf",
      softwareTools: ["Payoneer", "bKash / Bank Payout"],
    },
    {
      id: "gd-class-16",
      serial: "16",
      number: 16,
      moduleCode: "Module 05",
      moduleTitle: "Local Job Market & Career",
      classLabel: "Class 16",
      topicTitle: "Bangladesh Local Agency & Corporate Job Market Strategy",
      durationLabel: "65 Mins · Career Strategy",
      summary:
        "বাংলাদেশের টপ ক্রিয়েটিভ এজেন্সি, ই-কমার্স ও টেক কোম্পানিতে গ্রাফিক ডিজাইনার এবং AI ভিজ্যুয়াল স্পেশালিস্ট হিসেবে চাকরির বাজার ও রিক্রুটারদের প্রত্যাশা।",
      keyTakeaways: [
        "BDJobs, LinkedIn ও এজেন্সি ক্যারিয়ার পোর্টালে স্মার্ট জব হান্টিং",
        "ইন-হাউস বনাম এজেন্সি জবের কাজের ধরন ও বেতন কাঠামো",
        "AI-সক্ষম ডিজাইনার হিসেবে নিজের ভ্যালু আলাদা করে উপস্থাপন",
      ],
      practiceDeliverable: "১০টি টার্গেট বাংলাদেশি কোম্পানি/এজেন্সির লিস্ট ও পোর্টফোলিও লিংক তৈরি",
      aiPromptOrPreset: "BD_Creative_Agencies_Directory_Checklist",
      softwareTools: ["LinkedIn", "BDJobs"],
    },
    {
      id: "gd-class-17",
      serial: "17",
      number: 17,
      moduleCode: "Module 05",
      moduleTitle: "Local Job Market & Career",
      classLabel: "Class 17",
      topicTitle: "ATS-Friendly Designer CV, Resume Design & Interview Mastery",
      durationLabel: "70 Mins · CV & Interview Lab",
      summary:
        "ডিজাইনারদের জন্য মিনিমাল ও পরিচ্ছন্ন সিভি ডিজাইন, পোর্টফোলিও লিংক প্লেসমেন্ট এবং HR ও ক্রিয়েটিভ ডিরেক্টরের টেকনিক্যাল ইন্টারভিউ প্রস্তুতি।",
      keyTakeaways: [
        "সিভিতে কী রাখবেন এবং কী বাদ দেবেন — ১ পৃষ্ঠার আধুনিক স্ট্যান্ডার্ড",
        "ইন্টারভিউতে আপনার প্রজেক্টের প্রসেস ও AI রোল ব্যাখ্যা করার কৌশল",
        "টেস্ট অ্যাসাইনমেন্ট সময়মতো ডেলিভারির টিপস",
      ],
      practiceDeliverable: "নিজের আপডেটেড ডিজাইনার সিভি (PDF) তৈরি ও রিভিউ",
      aiPromptOrPreset: "Minimal_Designer_CV_Template.ai",
      softwareTools: ["Adobe Illustrator", "Canva / Figma"],
    },
    {
      id: "gd-class-18",
      serial: "18",
      number: 18,
      moduleCode: "Module 05",
      moduleTitle: "Local Job Market & Career",
      classLabel: "Class 18",
      topicTitle: "3 Special Live Client Assignments & Portfolio Evaluation",
      durationLabel: "85 Mins · Live Evaluation",
      summary:
        "রিয়েল বাঙালি ক্লায়েন্ট ব্রিফের ওপর ভিত্তি করে ৩টি স্পেশাল অ্যাসাইনমেন্ট (ই-কমার্স ক্যাম্পেইন + ব্র্যান্ড লোগো + AI অ্যাড ভিজ্যুয়াল) এবং সরাসরি মেন্টর ফিডব্যাক।",
      keyTakeaways: [
        "বাঙালি ক্লায়েন্টদের সাথে রিয়েল-টাইম ফিডব্যাক ও রিভিশন সাইকেল",
        "টপ পারফর্মারদের জন্য লাইভ প্রজেক্ট টিম ও জব সাপোর্ট শর্টলিস্টিং",
        "কমপ্লিট পোর্টফোলিও ফোল্ডার অর্গানাইজেশন",
      ],
      practiceDeliverable: "৩টি স্পেশাল অ্যাসাইনমেন্ট ফাইনাল সাবমিশন",
      aiPromptOrPreset: "Special Assignment Evaluation Rubric & Client Briefs",
      softwareTools: ["Photoshop", "Illustrator", "Midjourney"],
    },
    {
      id: "gd-class-19",
      serial: "19",
      number: 19,
      moduleCode: "Module 06",
      moduleTitle: "Basic Video Editing & Animation",
      classLabel: "Class 19",
      topicTitle: "CapCut Pro Video Editing, Reels Workflow & Graphic Sync",
      durationLabel: "70 Mins · Video Production",
      summary:
        "CapCut ডেস্কটপ/মোবাইলে হাই-রিটেনশন রিলস ও প্রোমো ভিডিও এডিটিং, ফটোশপ/ইলাস্ট্রেটর গ্রাফিক্স ইমপোর্ট, কি-ফ্রেম অ্যানিমেশন, সাউন্ড ডিজাইন ও বাংলা সাবটাইটেল।",
      keyTakeaways: [
        "ইলাস্ট্রেটর থেকে ট্রান্সপারেন্ট PNG/SVG ওভারলে নিয়ে CapCut-এ এডিট",
        "Keyframe, Speed Ramp, Beat Sync এবং কালার গ্রেডিং",
        "সেলস-ফোকাসড প্রোমো ভিডিওর প্রথম ৩ সেকেন্ডের হুক স্ট্র্যাটেজি",
      ],
      practiceDeliverable: "নিজের ডিজাইন করা প্রোডাক্ট পোস্টার নিয়ে একটি ৩০ সেকেন্ডের রিল তৈরি",
      aiPromptOrPreset: "CapCut Text Presets + Sound Effects Starter Pack",
      softwareTools: ["CapCut Desktop", "Photoshop Assets"],
    },
    {
      id: "gd-class-20",
      serial: "20",
      number: 20,
      moduleCode: "Module 06",
      moduleTitle: "Basic Video Editing & Animation",
      classLabel: "Class 20",
      topicTitle: "Logo Animation, Basic Motion Graphics & Graduation Roadmap",
      durationLabel: "80 Mins · Motion Finale",
      summary:
        "ক্লায়েন্টের লোগো ও সোশ্যাল মিডিয়া ডিজাইনে অ্যানিমেশন যোগ করে কীভাবে সার্ভিসের মূল্য দ্বিগুণ করা যায়—লোগো রিভিল, মোশন টেমপ্লেট ও কোর্স সমাপনী গাইডলাইন।",
      keyTakeaways: [
        "Logo Animation Templates কাস্টমাইজ করে দ্রুত ইন্ট্রো তৈরি",
        "Liquid Glass & Typography Motion Graphics এক্সপোর্ট সেটিংস (MP4/GIF)",
        "পরবর্তী ৯০ দিনের আর্নিং ও ক্যারিয়ার অ্যাকশন প্ল্যান",
      ],
      practiceDeliverable: "১টি অ্যানিমেটেড লোগো ইন্ট্রো ও ফাইনাল শো-রিল প্রেজেন্টেশন",
      aiPromptOrPreset: "Logo Animation Templates + Motion Graphics Pack",
      softwareTools: ["CapCut", "Motion Templates", "Bismahsoft Kit"],
    },
  ] satisfies GraphicDesignLesson[],
};
