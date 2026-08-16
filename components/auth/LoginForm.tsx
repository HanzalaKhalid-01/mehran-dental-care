"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OfflineNotice } from "@/components/offline/OfflineNotice";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";

export function LoginForm() {
  const router = useRouter();
  const { isOffline } = useOnlineStatus();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOffline) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Incorrect email or password. Please try again.");
      return;
    }

    router.push("/portal/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@mehrandental.pk"
        autoComplete="username"
      />

      <Input
        label="Password"
        required
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        rightElement={
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
          >
            {showPassword
              ? <EyeOff className="h-4 w-4" />
              : <Eye className="h-4 w-4" />
            }
          </button>
        }
      />

      <OfflineNotice />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg" disabled={isOffline}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
