import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { OfflineBanner } from "@/components/offline/OfflineBanner";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OfflineBanner />
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
              Mehran Dental<span className="text-primary">.</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Sign in to the clinic portal
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
