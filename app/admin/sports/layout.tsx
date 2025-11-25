import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import { verifyAdmin } from "@/app/utils/VerifyAdmin";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Varchas Admin page",
  description:
    "The official website of Varchas 2025. Varchas is the annual inter-department sports and cultural competition of MVJCE.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuth = await verifyAdmin("sports");

  return (
    <>
      {isAuth ? (
        children
      ) : (
        <div className="text-center font-bold text-3xl mt-20">Unauthorized</div>
      )}
    </>
  );
}
