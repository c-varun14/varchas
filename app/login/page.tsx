// app/login/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 text-card-foreground shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <div className="space-y-4">
          <Button
            onClick={async () => {
              await signIn.social({
                provider: "google",
                callbackURL: "/admin/sports",
              });
            }}
            variant="outline"
            className="w-full"
          >
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
