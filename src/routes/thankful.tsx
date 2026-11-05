import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";

export const Route = createFileRoute("/thankful")({
  head: () => ({
    meta: [
      { title: "Thankful — Sakibul Islam" },
      {
        name: "description",
        content:
          "A heartfelt tribute dedicated to the teachers, friends, relatives, and well-wishers—the silent architects of my journey.",
      },
      { property: "og:title", content: "Thankful — Sakibul Islam" },
      {
        property: "og:description",
        content:
          "Dedicated to the souls whose unconditional love and support made my journey truly meaningful.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThankfulPage,
});

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Me", href: "/about-me" },
  { label: "Thankful", href: "/thankful" },
  { label: "Contact", href: "/contact" },
];

const UPLOADED_PHOTOS = [
  "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png",
  "https://www.image2url.com/r2/default/images/1793830267590-654c4729-bbde-4ca9-8721-fef466601fa0.png",
  "https://www.image2url.com/r2/default/images/1793830305704-e179d36b-b9ab-42bd-abcd-003dda243066.png",
  "https://www.image2url.com/r2/default/images/1793830412305-08adbd21-af0b-48e9-a6ea-195463fd1fad.png",
] as const;

type TributePerson = {
  id: string;
  name: string;
  designation: string;
  description: string;
  image: string;
  category: string;
};

type TributeSection = {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  people: TributePerson[];
};

const TRIBUTE_SECTIONS: TributeSection[] = [
  {
    id: "teachers",
    index: "01",
    title: "Teachers",
    subtitle:
      "Mentors and educators whose wisdom, patience, and guidance shaped my thinking and character.",
    people: [
      {
        id: "teacher-1",
        name: "Nasif Muhammad",
        designation: "As Sunnah Skill Development Institute",
        description:
          "Guided my earliest steps into technology and instilled the discipline to pursue excellence with humility.",
        image:
          "https://www.image2url.com/r2/default/images/1793841385507-a0b61a75-6e74-4c72-b43d-8b25e34c28cc.jpg",
        category: "Teachers",
      },
      {
        id: "teacher-2",
        name: "Masud Rana",
        designation: "Taherpur Degree College",
        description:
          "Encouraged curiosity beyond textbooks and taught me how to approach complex problems with clarity.",
        image:
          "https://www.image2url.com/r2/default/images/1793841482714-ae245549-bed5-414f-9559-9bec4d3c0da8.jpg",
        category: "Teachers",
      },
      {
        id: "teacher-3",
        name: "Nizam Uddin",
        designation: "Talent Private Home",
        description:
          "Showed me how storytelling and technical precision come together to create meaningful work.",
        image:
          "https://www.image2url.com/r2/default/images/1793841956802-e3fda827-2193-47eb-b9b4-ff6b152b881d.png",
        category: "Teachers",
      },
      {
        id: "teacher-4",
        name: "MD. Ashraful Islam",
        designation: "Rajshahi City Corporation Employed Skill Development Institute",
        description:
          "Reminded me that integrity, kindness, and service to others matter far more than any accolade.",
        image:
          "https://www.image2url.com/r2/default/images/1793842051410-7a9b0cad-5428-448b-9789-ff8116471317.jpg",
        category: "Teachers",
      },
    ],
  },
  {
    id: "friends",
    index: "02",
    title: "Friends",
    subtitle:
      "Companions who stood beside me through late nights, creative experiments, and every challenge along the way.",
    people: [
      {
        id: "friend-1",
        name: "Sakibul Islam",
        designation: "Creative Collaborator & Friend",
        description:
          "Always the first to offer honest feedback, unwavering encouragement, and a helping hand when deadlines loomed.",
        image: UPLOADED_PHOTOS[0],
        category: "Friends",
      },
      {
        id: "friend-2",
        name: "Sakibul Islam",
        designation: "Childhood Companion",
        description:
          "Walked beside me from the very beginning, celebrating small victories long before anyone else noticed.",
        image: UPLOADED_PHOTOS[1],
        category: "Friends",
      },
      {
        id: "friend-3",
        name: "Sakibul Islam",
        designation: "Fellow Builder & Confidant",
        description:
          "Turned countless Difficult moments into shared laughter and inspired me to keep pushing forward.",
        image: UPLOADED_PHOTOS[2],
        category: "Friends",
      },
      {
        id: "friend-4",
        name: "Sakibul Islam",
        designation: "Visual Artist & Partner in Craft",
        description:
          "Shared late-night brainstorming sessions and believed in every ambitious idea from day one.",
        image: UPLOADED_PHOTOS[3],
        category: "Friends",
      },
    ],
  },
  {
    id: "relatives",
    index: "03",
    title: "Relatives",
    subtitle:
      "Family members whose prayers, sacrifices, and unconditional love formed the foundation of my life.",
    people: [
      {
        id: "relative-1",
        name: "Alomgir Hossain",
        designation: "Mama (close person)",
        description:
          "He is my Mama, if there is anyone in my life who selflessly wishes me well and prays for me, he is the one. I have seen him as the one who is the happiest with my success and the most devastated by my sorrow.",
        image:
          "https://www.image2url.com/r2/default/images/1793842577596-17849618-fbaa-40bb-858f-2f0e54e66b69.jpg",
        category: "Relatives",
      },
      {
        id: "relative-2",
        name: "MD Rocky Hossain",
        designation: "Brother (close person)",
        description:
          "I have memories of an important time in my life with my brother. He is the most honest and hardworking person I have ever met. I can tell he loves me selflessly and prays for me.",
        image:
          "https://www.image2url.com/r2/default/images/1793843000564-d95da8c4-21b1-407c-9169-e484884e1c13.jpg",
        category: "Relatives",
      },
      {
        id: "relative-3",
        name: "Yasir Arafat Prince",
        designation: "Brother",
        description:
          "I met my brother mainly through content creation. Now I have such a good relationship with him, almost like a friend. Even though we are now in different places due to busy work schedules, our respect and love for each other remains unwavering and will remain so for life.",
        image:
          "https://www.image2url.com/r2/default/images/1793843089627-6a6013d4-58a7-4191-aa53-37acaed73702.jpg",
        category: "Relatives",
      },
      {
        id: "relative-4",
        name: "Ahmed Mostafa Raian",
        designation: "Brother",
        description:
          "I met Raian Bhai while attending As Sunnah Skill. He is the most patient, humble and sincere person I have ever met in my life. I have learned a lot from him. I want the good relationship I have with him to last until heaven.",
        image:
          "https://www.image2url.com/r2/default/images/1793843567628-5614b6ad-e5de-41bc-afbf-da81e28e3429.webp",
        category: "Relatives",
      },
    ],
  },
  {
    id: "well-wishers",
    index: "04",
    title: "Well-wishers",
    subtitle:
      "Kind souls from near and far whose generous words, trust, and support left a lasting mark on my journey.",
    people: [
      {
        id: "wellwisher-1",
        name: "Sakibul Islam",
        designation: "Community Supporter",
        description:
          "Offered encouragement and trust at pivotal moments when a kind word meant everything.",
        image: UPLOADED_PHOTOS[0],
        category: "Well-wishers",
      },
      {
        id: "wellwisher-2",
        name: "Sakibul Islam",
        designation: "Early Believer & Patron",
        description:
          "Entrusted me with meaningful projects and championed my work across the community.",
        image: UPLOADED_PHOTOS[1],
        category: "Well-wishers",
      },
      {
        id: "wellwisher-3",
        name: "Sakibul Islam",
        designation: "Mentor in Spirit",
        description:
          "Shared thoughtful advice and sincere goodwill without ever asking for anything in return.",
        image: UPLOADED_PHOTOS[2],
        category: "Well-wishers",
      },
      {
        id: "wellwisher-4",
        name: "Sakibul Islam",
        designation: "Valued Well-wisher",
        description:
          "One of the silent architects whose quiet kindness helped make this journey truly meaningful.",
        image: UPLOADED_PHOTOS[3],
        category: "Well-wishers",
      },
    ],
  },
];

function ThankfulPage() {
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedPerson, setSelectedPerson] = useState<TributePerson | null>(null);

  const visibleSections =
    activeFilter === "all"
      ? TRIBUTE_SECTIONS
      : TRIBUTE_SECTIONS.filter((section) => section.id === activeFilter);

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Ambient architectural background glow to accentuate transparent glass containers */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-36 left-1/4 h-[540px] w-[540px] rounded-full bg-foreground/[0.045] blur-3xl" />
        <div className="absolute right-1/5 top-1/3 h-[480px] w-[480px] rounded-full bg-foreground/[0.035] blur-3xl" />
        <div className="absolute bottom-1/4 left-1/6 h-[440px] w-[440px] rounded-full bg-foreground/[0.04] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 z-[60] flex h-16 w-full items-center border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex w-full items-center justify-between gap-8 px-4 lg:px-8">
          <Link
            to="/"
            className="group flex shrink-0 items-center whitespace-nowrap font-display text-xl font-bold tracking-tighter"
          >
            SS<span className="transition-transform duration-300 group-hover:scale-125">.</span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
            {NAV.map((item) => {
              const isActive = item.label === "Thankful";
              const isInternal = item.href.startsWith("/");
              return isInternal ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`relative shrink-0 whitespace-nowrap text-xs uppercase tracking-wider transition-all duration-200 hover:text-foreground ${
                    isActive
                      ? "font-bold text-foreground"
                      : "font-semibold text-muted-foreground/80"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-primary" />
                  )}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="relative shrink-0 whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 transition-all duration-200 hover:text-foreground"
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <PWAInstallButton variant="header" />
            <Link
              to="/contact"
              className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90"
            >
              Let's Collaborate
            </Link>
            <Link
              to="/account"
              aria-label="Account"
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border shadow-sm transition-transform duration-200 hover:scale-105"
            >
              <img
                src={UPLOADED_PHOTOS[0]}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-top"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <PWAInstallButton variant="header" />
            <button className="p-2" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <MobileHeaderMenu open={open} activePath="/thankful" onClose={() => setOpen(false)} />
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-28 sm:px-6 md:pt-36 lg:px-8">
        {/* Hero Tribute Header & Short Description */}
        <section className="mb-14 md:mb-20">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/45 p-6 shadow-xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl sm:p-10 lg:p-12">
            <div className="max-w-4xl">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Thankful · Silent Architects
              </p>
              <h1 className="mb-6 font-display text-4xl font-bold leading-[1.08] tracking-tight [text-wrap:balance] sm:text-5xl lg:text-6xl">
                To the souls who stood by me{" "}
                <span className="text-muted-foreground/80">selflessly.</span>
              </h1>
              <p className="max-w-3xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg md:leading-[1.8]">
                In this brief journey of life, coming this far alone would never have been possible
                without the people who stood by me selflessly. This space is a heartfelt thank you
                to everyone who has contributed, even in the smallest way, to making me who I am
                today. Long after I am gone, if anyone ever visits this page, I want them to know
                the souls whose unconditional love and support made my short life truly meaningful.
                This tribute is dedicated to those silent architects of my journey.
              </p>
            </div>

            {/* Interactive Section Filter Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeFilter === "all"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  All Sections (16)
                </button>
                {TRIBUTE_SECTIONS.map((sec) => {
                  const isActive = activeFilter === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveFilter(sec.id)}
                      className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      {sec.title}
                    </button>
                  );
                })}
              </div>

              <span className="text-xs text-muted-foreground">
                Click any portrait card to view full tribute
              </span>
            </div>
          </div>
        </section>

        {/* Tribute Sections: Teachers, Friends, Relatives, Well-wishers */}
        <div className="space-y-20 md:space-y-28">
          {visibleSections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              {/* Section Heading */}
              <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end md:mb-10">
                <div>
                  <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {section.index}. Tribute Category
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    {section.title}
                    <span className="text-muted-foreground/70">.</span>
                  </h2>
                </div>
                <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                  {section.subtitle}
                </p>
              </div>

              {/* 4-Items-Per-Row Glassmorphism Photo Cards Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {section.people.map((person) => (
                  <article
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedPerson(person);
                      }
                    }}
                    className="group flex cursor-pointer flex-col rounded-3xl border border-border/80 bg-background/35 p-3.5 shadow-xl shadow-black/[0.04] ring-1 ring-inset ring-foreground/[0.05] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 hover:border-foreground/25 hover:bg-background/50 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {/* Transparent Glass Container for Rounded-Rectangle Image */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border/60 bg-background/25 p-1.5 backdrop-blur-xl">
                      <div className="relative h-full w-full overflow-hidden rounded-xl bg-muted/40">
                        <img
                          src={person.image}
                          alt={person.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      </div>
                    </div>

                    {/* Transparent Glass Container for Name, Designation & Brief Description */}
                    <div className="mt-3 flex flex-1 flex-col justify-between rounded-2xl border border-border/60 bg-background/45 p-4 backdrop-blur-xl transition-colors duration-200 group-hover:border-border/90 group-hover:bg-background/65">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                            {person.name}
                          </h3>
                          <Heart className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-colors duration-200 group-hover:text-foreground" />
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-foreground/75">
                          {person.designation}
                        </p>
                      </div>

                      <p className="mt-3 border-t border-border/50 pt-3 text-xs font-light leading-relaxed text-muted-foreground">
                        {person.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Lightbox Tribute Modal when clicking a card */}
      {selectedPerson && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="relative flex w-full max-w-2xl flex-col gap-6 overflow-hidden rounded-3xl border border-border/90 bg-background/85 p-6 shadow-2xl ring-1 ring-inset ring-foreground/10 backdrop-blur-2xl sm:flex-row sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPerson(null)}
              aria-label="Close tribute details"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="aspect-[4/5] w-full shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-background/40 p-1.5 backdrop-blur-md sm:w-56">
              <img
                src={selectedPerson.image}
                alt={selectedPerson.name}
                referrerPolicy="no-referrer"
                className="h-full w-full rounded-xl object-cover object-top"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between py-1">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {selectedPerson.category} · Silent Architect
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {selectedPerson.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-foreground/80">
                  {selectedPerson.designation}
                </p>
                <div className="mt-5 rounded-2xl border border-border/70 bg-background/50 p-4 backdrop-blur-xl">
                  <p className="text-sm font-light leading-relaxed text-muted-foreground">
                    "{selectedPerson.description}"
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span>With eternal gratitude</span>
                <button
                  type="button"
                  onClick={() => setSelectedPerson(null)}
                  className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activePath="/thankful" />
    </div>
  );
}
