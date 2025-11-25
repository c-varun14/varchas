import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const leftImages = [
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=400&q=80", // Sports
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=400&q=80", // Football
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=400&q=80", // Volleyball
];

const rightImages = [
  "https://picsum.photos/id/24/400/300", // Literature
  "https://picsum.photos/id/1082/400/300", // Music
  "https://picsum.photos/id/203/400/300", // Dance
  "https://picsum.photos/id/342/400/300", // Acting
];

function ImageRail({
  images,
  align,
}: {
  images: string[];
  align: "left" | "right";
}) {
  const alignmentClass = align === "left" ? "items-start" : "items-end";

  return (
    <div className={`hidden flex-col ${alignmentClass} gap-4 lg:flex`}>
      {images.map((src) => (
        <div
          key={src}
          className="overflow-hidden rounded-[1.25rem] border border-white/40 bg-white/60 shadow-lg shadow-indigo-200/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Event" className="h-28 w-28 object-cover" />
        </div>
      ))}
    </div>
  );
}

const HeroSection = () => {
  return (
    <main className="relative grid items-center gap-8 rounded-[2.5rem] px-6 py-10 lg:grid-cols-[auto_1fr_auto]">
      <ImageRail images={leftImages} align="left" />

      <div className="flex flex-col items-center gap-6 text-center lg:px-16">
        <Badge className="rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-4 py-1.5 text-sm text-white shadow-xl shadow-orange-300/40">
          ✨ Championship 2025
        </Badge>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
            MVJ College
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-foreground sm:text-5xl">
            Inter-Department Championship
          </h1>
        </div>
        <div className="flex items-center gap-4 rounded-full bg-secondary/70 px-3 py-2 text-sm font-medium text-secondary-foreground">
          <span className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-primary">
            🏅 Sports
          </span>
          <span className="text-muted-foreground">+</span>
          <span className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-pink-500">
            🎵 Cultural
          </span>
        </div>
        {/* <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Join us in celebrating excellence, talent, and teamwork as
              departments compete across sports and cultural events. Experience
              the energy, witness the passion, and be part of the ultimate
              college championship!
            </p> */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/sports"
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-full bg-linear-to-r from-blue-500 to-indigo-500 px-8 py-6 text-base shadow-lg shadow-blue-400/50"
            )}
          >
            🏆 View Sports Events
          </Link>
          <Link
            href="/cultural"
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-full bg-linear-to-r from-pink-500 to-purple-500 px-8 py-6 text-base text-white shadow-lg shadow-pink-400/50"
            )}
          >
            🎭 View Cultural Events
          </Link>
        </div>
      </div>

      <ImageRail images={rightImages} align="right" />
    </main>
  );
};
export default HeroSection;
