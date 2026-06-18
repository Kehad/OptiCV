"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex items-center gap-2">
          <img src="/logo.png" alt="OptiCV Logo" className="w-10 h-10 rounded-xl object-cover" />
          <span className="font-bold text-2xl tracking-tight">OptiCV</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Your personal <br /> AI job search assistant
          </h1>
          <p className="text-xl text-muted-foreground max-w-md">
            Optimize your resume, craft perfect cover letters, and auto-apply to jobs while you sleep.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-muted-foreground font-medium">
          © {new Date().getFullYear()} OptiCV. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card/50 focus:bg-card focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <Link href="#" className="text-sm text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card/50 focus:bg-card focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
