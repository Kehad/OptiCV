"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        // Redirect to login or check if user was auto-confirmed and logged in
        if (data.session) {
          router.push("/dashboard");
        } else {
          setError("Please check your email to confirm registration.");
          // Give a small delay or let them go to login
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-row-reverse">
      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex justify-end">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tight">OptiCV</span>
            <img src="/logo.png" alt="OptiCV Logo" className="w-10 h-10 rounded-xl object-cover" />
          </div>
        </div>

        <div className="relative z-10 text-right">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Start automating <br /> your job search
          </h1>
          <p className="text-xl text-muted-foreground max-w-md ml-auto">
            Join thousands of professionals landing interviews faster with AI-tailored applications.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-muted-foreground font-medium text-right">
          © {new Date().getFullYear()} OptiCV. All rights reserved.
        </div>
      </div>

      {/* Left side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Create an account</h2>
            <p className="text-muted-foreground">Get started with OptiCV today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card/50 focus:bg-card focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card/50 focus:bg-card focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
