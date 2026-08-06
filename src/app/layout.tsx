import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/nav";
import { getOptionalUser } from "@/lib/auth/helpers";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let navUser: { id: string; email?: string } | null = null;
  let displayName: string | null = null;

  try {
    const { user, supabase } = await getOptionalUser();
    if (user) {
      navUser = { id: user.id, email: user.email ?? undefined };
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      displayName = profile?.display_name ?? null;
    }
  } catch {
    // During static generation (e.g., _not-found), env may not be available
  }

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Nav
          user={navUser}
          displayName={displayName}
        />

        <main className="flex flex-1 flex-col">{children}</main>

        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
