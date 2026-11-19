import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";

import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { BooksShowcaseSection } from "@/components/books/BooksShowcaseSection";
import {
  BOOKS_CATALOG,
  getBookBySlug,
  getBookSocialImagePath,
  type BookItem,
} from "@/data/books-data";

export const Route = createFileRoute("/books")({
  validateSearch: (search: Record<string, unknown>) => ({
    book: typeof search.book === "string" && search.book.trim() ? search.book.trim() : undefined,
  }),
  loaderDeps: ({ search }) => ({
    bookSlug: search.book,
  }),
  loader: ({ deps }) => {
    const selectedBook: BookItem = getBookBySlug(deps.bookSlug) ?? BOOKS_CATALOG[0];
    return {
      selectedBook,
      requestedSlug: deps.bookSlug,
    };
  },
  head: ({ loaderData }) => {
    const book = loaderData?.selectedBook ?? BOOKS_CATALOG[0];
    const imagePath = getBookSocialImagePath(book);
    const isPng = imagePath.toLowerCase().endsWith(".png");
    const pageTitle = loaderData?.requestedSlug
      ? `${book.title} — ${book.authorBn}`
      : `${book.title} | Published Works — Sakibul Islam Sabbir`;
    const priceSnippet =
      book.accessType === "free"
        ? `পূর্বমূল্য ৳${book.regularPriceBdt ?? 80} কেটে এখন সম্পূর্ণ ফ্রি পড়ুন ওয়েবসাইটের সুরক্ষিত রিডারে।`
        : `মাত্র ৳${book.priceBdt} টাকায় অর্ডার করে ওয়েবসাইটের সুরক্ষিত ফুল-স্ক্রিন রিডারে পড়ুন।`;
    const description = `${book.shortDescription} ${priceSnippet}`;
    const canonicalPath = `/books?book=${encodeURIComponent(book.slug)}`;

    return {
      meta: [
        { title: pageTitle },
        { name: "description", content: description },
        { property: "og:site_name", content: "Sakibul Islam Sabbir — Published Works" },
        { property: "og:type", content: "book" },
        { property: "og:title", content: pageTitle },
        { property: "og:description", content: description },
        { property: "og:url", content: canonicalPath },
        { property: "og:image", content: imagePath },
        { property: "og:image:secure_url", content: imagePath },
        { property: "og:image:type", content: isPng ? "image/png" : "image/jpeg" },
        { property: "og:image:alt", content: `${book.title} — Book Cover` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: pageTitle },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: imagePath },
        { name: "twitter:image:alt", content: `${book.title} — Book Cover` },
      ],
    };
  },
  component: BooksPage,
});

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Me", href: "/about-me" },
  { label: "Thankful", href: "/thankful" },
  { label: "Contact", href: "/contact" },
];

const AVATAR_IMAGE =
  "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png";

function BooksPage() {
  const [open, setOpen] = useState(false);
  const { selectedBook, requestedSlug } = Route.useLoaderData();

  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: selectedBook.title,
    alternateName: selectedBook.englishTitle,
    author: {
      "@type": "Person",
      name: selectedBook.authorEn,
    },
    inLanguage: selectedBook.language,
    image: getBookSocialImagePath(selectedBook),
    description: selectedBook.shortDescription,
    bookFormat: "https://schema.org/EBook",
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: String(selectedBook.priceBdt),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#fafafa] font-sans text-foreground antialiased dark:bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 z-[60] flex h-16 w-full items-center border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex w-full items-center justify-between gap-8 px-4 lg:px-8">
          <Link
            to="/"
            className="group flex shrink-0 items-center whitespace-nowrap font-display text-xl font-bold tracking-tighter"
          >
            SS<span className="transition-transform duration-300 group-hover:scale-125">.</span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
            {NAV.map((item) => {
              const isActive = item.label === "Projects";
              return (
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
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <PWAInstallButton variant="header" />
            <Link
              to="/projects"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Projects
            </Link>
            <Link
              to="/account"
              aria-label="Account"
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border shadow-sm transition-transform duration-200 hover:scale-105"
            >
              <img
                src={AVATAR_IMAGE}
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

        <MobileHeaderMenu open={open} activePath="/projects" onClose={() => setOpen(false)} />
      </header>

      {/* Main Books Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-24 sm:px-6 md:pt-32 lg:px-8">
        <div className="mb-6">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 transition-colors hover:text-neutral-950 dark:text-muted-foreground dark:hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Projects</span>
          </Link>
        </div>

        <BooksShowcaseSection highlightedBookSlug={requestedSlug} />
      </main>

      <MobileBottomNav activePath="/projects" />
    </div>
  );
}
