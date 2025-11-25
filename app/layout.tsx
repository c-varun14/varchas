import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Varchas 2025",
  description:
    "The official website of Varchas 2025. Varchas is the annual inter-department sports and cultural competition of MVJCE.",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff,_#e0e6ff_60%,_#f4f1ff)]">
          <div className="absolute inset-x-0 top-[-40%] h-[70%] w-full max-w-4xl translate-x-1/2 rounded-full bg-linear-to-r from-[#d6b6ff]/40 to-[#9ec8ff]/50 blur-3xl opacity-70 sm:left-1/2"></div>

          <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-28">
            <Navbar />
            <main className="flex-1 py-8">{children}</main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
