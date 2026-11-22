import { createFileRoute } from "@tanstack/react-router";
import {
  EducationPlatformView,
  type EducationSectionId,
} from "@/components/education/EducationPlatformView";

function parseSection(val: unknown): EducationSectionId | undefined {
  if (val === "courses" || val === "workshops" || val === "books" || val === "bismah") {
    return val;
  }
  return undefined;
}

export const Route = createFileRoute("/education")({
  validateSearch: (search: Record<string, unknown>) => ({
    section: parseSection(search.section),
  }),
  head: () => ({
    meta: [
      { title: "Education — Courses, Workshops, Books & Bismah Audio | Sakibul Islam Sabbir" },
      {
        name: "description",
        content:
          "Bismahsoft Learning Platform — explore structured free & paid live courses, AI FOR STUDENTS live workshops, original authored books, and the Bismah standalone YouTube & offline podcast audio player.",
      },
      { property: "og:title", content: "Education — Bismahsoft Learning Platform" },
      {
        property: "og:description",
        content:
          "Courses, live student AI workshops, original published e-books, and Bismah audio podcast player in one distraction-free educational platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EducationPage,
});

function EducationPage() {
  const { section } = Route.useSearch();
  return <EducationPlatformView initialSection={section} />;
}
