"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

interface NavLink {
  name: string;
  path: string;
  isExternal?: boolean;
}

const navLinks: NavLink[] = [
  { name: "Home", path: "/" },
  { name: "Sports Events", path: "/sports" },
  { name: "Cultural Events", path: "/cultural" },
  { name: "Leaderboard", path: "#leaderboard", isExternal: true },
  // { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/40 bg-white/70 px-4 py-3 shadow-lg shadow-primary/5 backdrop-blur sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-indigo-500 text-primary-foreground shadow-lg sm:size-12">
            🏆
          </div>
          <div className="hidden sm:block">
            <p className="text-lg font-semibold text-foreground">MVJ College</p>
            <p className="text-sm text-muted-foreground">Championship 2025</p>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 flex-wrap items-center justify-center gap-4 text-sm font-medium sm:flex">
          {navLinks.map((link) => (
            <Link
              href={link.path}
              key={link.name}
              className={`rounded-full px-3.5 py-1 transition-colors ${
                link.path === "/"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              target={link.isExternal ? "_blank" : undefined}
              rel={link.isExternal ? "noopener noreferrer" : undefined}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <Link
          href="#leaderboard"
          className={cn(
            buttonVariants({ variant: "default" }),
            "hidden rounded-full bg-linear-to-r from-primary to-indigo-500 px-5 text-base shadow-lg shadow-primary/40 sm:block"
          )}
        >
          View Full Results
        </Link>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur sm:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                href={link.path}
                key={link.name}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  link.path === "/"
                    ? "bg-indigo-50 text-primary"
                    : "text-foreground hover:bg-gray-50"
                }`}
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noopener noreferrer" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="#leaderboard"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full rounded-full bg-linear-to-r from-primary to-indigo-500 py-3 text-base shadow-lg shadow-primary/40"
              )}
            >
              View Full Results
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;
