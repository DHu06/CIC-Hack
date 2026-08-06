import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyHall UBC",
  description:
    "AI-powered complementary study groups for UBC students. Upload notes, get matched with classmates who complement your strengths, and study smarter together.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <a href="/" className="text-lg font-bold tracking-tight">
              StudyHall
            </a>
            <div className="hidden items-center gap-6 sm:flex">
              <a
                href="/subjects"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Subjects
              </a>
              <a
                href="/notes"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Notes
              </a>
              <a
                href="/me"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                My Sessions
              </a>
            </div>
            {/* Mobile menu button placeholder */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground sm:hidden"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </nav>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>

        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
