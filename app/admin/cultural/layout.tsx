import type { Metadata } from "next";
import "@/app/globals.css";
import { verifyAdmin } from "@/utils/VerifyAdmin";

export const metadata: Metadata = {
  title: "Interdepartment championship Cultural Admin page",
  description:
    "The official website of Interdepartment championship 2025 website of MVJCE.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuth = await verifyAdmin("cultural");

  return (
    <>
      {isAuth ? (
        <div className="min-h-screen bg-muted/20">{children}</div>
      ) : (
        <div className="text-center font-bold text-3xl mt-20">Unauthorized</div>
      )}
    </>
  );
}
