import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { WorkshopRegistrationModal } from "@/components/workshop/WorkshopRegistrationModal";

export const Route = createFileRoute("/workshop")({
  head: () => ({
    meta: [
      { title: "AI FOR STUDENTS — Workshop 2027 | Bizmahoot × Neer Fashion" },
      {
        name: "description",
        content:
          "Preparing Students for an AI-Powered Future. Generative AI Education & Practical Workshop 2027 organized by Bizmahoot and sponsored by Neer Fashion.",
      },
      {
        property: "og:title",
        content: "AI FOR STUDENTS — Workshop 2027",
      },
      {
        property: "og:description",
        content:
          "Hands-on student Generative AI education, smart prompting, productivity workflows, and ethical AI literacy. Organized by Bizmahoot, Main Sponsor Neer Fashion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkshopPage,
});

function WorkshopPage() {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  return (
    <div className="min-h-screen scroll-smooth bg-[#050505] font-['Plus_Jakarta_Sans','Hind_Siliguri',sans-serif] text-white antialiased selection:bg-[#00D978] selection:text-[#050505]">
      <WorkshopNavbar onOpenRegister={() => setRegisterModalOpen(true)} />

      <main>
        <WorkshopHero onOpenRegister={() => setRegisterModalOpen(true)} />
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
        <WorkshopRegistration onOpenRegister={() => setRegisterModalOpen(true)} />
        <WorkshopFAQ />
      </main>

      <WorkshopFooter />

      <WorkshopRegistrationModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
}
