import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyHall UBC",
  description: "AI-powered complementary study groups for UBC students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Nav />
        <main className="flex flex-1 flex-col">{children}</main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
