import type { ReactNode } from "react";

export const metadata = {
  title: "Cultural Events Admin",
};

export default function CulturalAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="min-h-screen bg-muted/20">{children}</div>;
}
