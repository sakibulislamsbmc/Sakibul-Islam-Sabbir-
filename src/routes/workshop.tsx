import { createFileRoute } from "@tanstack/react-router";
import { WorkshopNavbar } from "@/components/workshop/WorkshopNavbar";
import { WorkshopHero } from "@/components/workshop/WorkshopHero";
import { WorkshopCountdownOrganizers } from "@/components/workshop/WorkshopCountdownOrganizers";
import { WorkshopSponsors } from "@/components/workshop/WorkshopSponsors";
import { WorkshopOverview } from "@/components/workshop/WorkshopOverview";
import { WorkshopModules } from "@/components/workshop/WorkshopModules";
import { WorkshopStats } from "@/components/workshop/WorkshopStats";
import { WorkshopSpeakers } from "@/components/workshop/WorkshopSpeakers";
import { WorkshopGuests } from "@/components/workshop/WorkshopGuests";
import { WorkshopPartners } from "@/components/workshop/WorkshopPartners";
import { WorkshopSchedule } from "@/components/workshop/WorkshopSchedule";
import { WorkshopBenefits } from "@/components/workshop/WorkshopBenefits";
import { WorkshopRegistration } from "@/components/workshop/WorkshopRegistration";
import { WorkshopFAQ } from "@/components/workshop/WorkshopFAQ";
import { WorkshopFooter } from "@/components/workshop/WorkshopFooter";

export const Route = createFileRoute("/workshop")({
  head: () => ({
    meta: [
      { title: "AI FOR STUDENTS — Workshop 2027 | Bismahsoft Ltd × Neer Fashion" },
      {
        name: "description",
        content:
          "One-Night Online Live Meeting on 9 December at 9:30 PM Night via Google Meet. Main Speaker: Sakibul Islam Sabbir. Organized by Bismahsoft Ltd, Main Sponsor Neer Fashion.",
      },
      {
        property: "og:title",
        content: "AI FOR STUDENTS — Workshop 2027 | 9 December · 9:30 PM Night",
      },
      {
        property: "og:description",
        content:
          "Join our One-Night Online Live Meeting on Google Meet. Generative AI education, smart prompting, and practical workflows with Sakibul Islam Sabbir.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkshopPage,
});

function WorkshopPage() {
  return (
    <div className="min-h-screen scroll-smooth bg-[#050505] font-['Plus_Jakarta_Sans','Hind_Siliguri',sans-serif] text-white antialiased selection:bg-[#00D978] selection:text-[#050505]">
      <WorkshopNavbar />

      <main>
        <WorkshopHero />
        <WorkshopCountdownOrganizers />
        <WorkshopSponsors />
        <WorkshopOverview />
        <WorkshopModules />
        <WorkshopStats />
        <WorkshopSpeakers />
        <WorkshopGuests />
        <WorkshopPartners />
        <WorkshopSchedule />
        <WorkshopBenefits />
        <WorkshopRegistration />
        <WorkshopFAQ />
      </main>

      <WorkshopFooter />
    </div>
  );
}
