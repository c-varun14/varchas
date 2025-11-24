import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const leftImages = [
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1502810190503-830027b6c59b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80",
];

const rightImages = [
  "https://images.unsplash.com/photo-1454922915609-78549ad709bb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1431068799455-80bae0caf685?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1435224654926-ecc9f7fa028c?auto=format&fit=crop&w=400&q=80",
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff,_#e0e6ff_60%,_#f4f1ff)]">
      <div className="absolute inset-x-0 top-[-40%] h-[70%] w-full max-w-4xl translate-x-1/2 rounded-full bg-linear-to-r from-[#d6b6ff]/40 to-[#9ec8ff]/50 blur-3xl opacity-70 sm:left-1/2"></div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-10">
        <Navbar />

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
              <Button className="rounded-full bg-linear-to-r from-blue-500 to-indigo-500 px-8 py-6 text-base shadow-lg shadow-blue-400/50">
                🏆 View Sports Events
              </Button>
              <Button className="rounded-full bg-linear-to-r from-pink-500 to-purple-500 px-8 py-6 text-base text-white shadow-lg shadow-pink-400/50">
                🎭 View Cultural Events
              </Button>
            </div>
          </div>

          <ImageRail images={rightImages} align="right" />
        </main>
      </div>
    </div>
  );
}

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
