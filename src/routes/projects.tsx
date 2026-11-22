import { createFileRoute } from "@tanstack/react-router";
import {
  EducationPlatformView,
  type EducationSectionId,
} from "@/components/education/EducationPlatformView";

function parseSection(val: unknown): EducationSectionId | undefined {
  if (val === "courses" || val === "workshops" || val === "books") {
    return val;
  }
  return undefined;
}

export const Route = createFileRoute("/projects")({
  validateSearch: (search: Record<string, unknown>) => ({
    section: parseSection(search.section),
  }),
  head: () => ({
    meta: [
      { title: "Education — Courses, Workshops & Books | Sakibul Islam Sabbir" },
      {
        name: "description",
        content:
          "Bismahsoft Learning Platform — explore structured free & paid live courses, AI FOR STUDENTS live workshops, and original authored books.",
      },
      { property: "og:title", content: "Education — Bismahsoft Learning Platform" },
      {
        property: "og:description",
        content:
          "Courses, live student AI workshops, and original published e-books in one distraction-free educational platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsAliasEducationPage,
});

function ProjectsAliasEducationPage() {
  const { section } = Route.useSearch();
  return <EducationPlatformView initialSection={section} />;
}
