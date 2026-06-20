"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
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
        if (data.session) {
          router.push("/dashboard");
        } else {
          setError("Please check your email to confirm registration.");
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
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-row-reverse relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob"></div>
      <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-accent/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob animation-delay-2000"></div>

      {/* Right side - Branding Graphics */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 bg-slate-950/40 border-l border-white/5 relative z-10 backdrop-blur-xl">
        <div className="flex items-center gap-3 justify-end">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="font-outfit font-outfit font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OptiCV
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
          </Link>
        </div>

        <div className="space-y-6 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-xs border border-accent/20 backdrop-blur-sm ml-auto">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" style={{ animationDuration: '4s' }} />
            <span>Interactive Application Suite</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight font-outfit text-white leading-tight">
            Start automating <br /> your job search
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md ml-auto font-sans font-light">
            Join thousands of modern job seekers landing interviews faster with customized resumes and letters.
          </p>
        </div>
        
        <div className="text-xs text-slate-500 font-medium text-right">
          © {new Date().getFullYear()} OptiCV. All rights reserved.
        </div>
      </div>

      {/* Left side - Register Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 md:p-16 relative z-10">
        <Link href="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="w-full max-w-md mx-auto space-y-8 glass-panel border border-white/5 rounded-3xl p-8 shadow-2xl bg-slate-900/40 backdrop-blur-xl animate-fade-in-up">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight font-outfit text-white mb-2">Create an account</h2>
            <p className="text-slate-400 text-sm font-sans font-light">Get started with OptiCV today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold border border-destructive/20 animate-fade-in">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/40 text-slate-100 placeholder-slate-500 focus:bg-slate-950/80 outline-none transition-all duration-200 text-sm font-sans"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/40 text-slate-100 placeholder-slate-500 focus:bg-slate-950/80 outline-none transition-all duration-200 text-sm font-sans"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/40 text-slate-100 placeholder-slate-500 focus:bg-slate-950/80 outline-none transition-all duration-200 text-sm"
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
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold rounded-xl hover:from-primary/95 hover:to-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
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

          <p className="text-center text-sm text-slate-400 font-medium pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary-foreground font-semibold hover:underline transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
