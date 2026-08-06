"use client";

import { useState } from "react";
import Link from "next/link";

interface NavProps {
  user: { id: string; email?: string } | null;
  displayName?: string | null;
}

export function Nav({ user, displayName }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight">
          StudyHall
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/subjects"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Subjects
          </Link>
          <Link
            href="/notes"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Notes
          </Link>
          <Link
            href="/me"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            My Sessions
          </Link>
          {user ? (
            <span className="inline-flex h-8 items-center gap-2 rounded-full bg-muted px-3 text-sm font-medium">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {(displayName ?? user.email ?? "U").charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[120px] truncate">
                {displayName ?? user.email?.split("@")[0] ?? "User"}
              </span>
            </span>
          ) : (
            <Link
              href="/auth"
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground sm:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
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
          )}
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background sm:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            <Link
              href="/subjects"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Subjects
            </Link>
            <Link
              href="/notes"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Notes
            </Link>
            <Link
              href="/me"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              My Sessions
            </Link>
            <div className="my-2 border-t border-border" />
            {user ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {(displayName ?? user.email ?? "U").charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium">
                  {displayName ?? user.email?.split("@")[0] ?? "User"}
                </span>
              </div>
            ) : (
              <Link
                href="/auth"
                className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
