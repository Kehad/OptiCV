import Link from 'next/link';
import { ArrowRight, FileText, Sparkles, Send, Target, BarChart, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 overflow-hidden relative selection:bg-primary/30 font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-accent/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="font-outfit font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OptiCV
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/95 rounded-xl transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 pt-24 pb-24">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20 backdrop-blur-sm shadow-glow">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Next-Gen AI Resume Optimizer</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-outfit text-white leading-[1.1]">
            Land Your Dream Job with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-accent">
              Intelligent Tailoring
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-sans font-light">
            Automatically customize your resume, generate high-converting cover letters, and auto-submit applications to outsmart ATS algorithms.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 rounded-2xl transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5"
            >
              Tailor Your Resume Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:border-white/20"
            >
              Create Free Account
            </Link>
          </div>
        </section>

        {/* High Fidelity Visual Dashboard Preview */}
        <section className="mt-24 max-w-5xl mx-auto glass-panel rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl animate-fade-in-up animation-delay-200 relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-30 pointer-events-none"></div>
          
          {/* Mockup Header */}
          <div className="bg-slate-950/60 border-b border-white/5 p-4 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500/80"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-green-500/80"></div>
            </div>
            <div className="bg-slate-900/80 rounded-lg px-6 py-1 text-xs text-slate-400 border border-white/5 font-mono select-none">
              https://app.opticv.ai/optimize
            </div>
            <div className="w-14"></div> {/* spacer */}
          </div>
          
          {/* Mockup Content */}
          <div className="p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center bg-slate-950/30">
            <div className="md:col-span-7 space-y-6">
              <span className="text-xs font-bold tracking-wider text-accent uppercase bg-accent/10 px-3 py-1 rounded-full">Real-time Analysis</span>
              <h3 className="text-3xl md:text-4xl font-bold font-outfit text-white leading-tight">Beat ATS filters by matching keywords automatically.</h3>
              <p className="text-slate-400 leading-relaxed font-sans font-light">
                Our AI parses the target job description and restructures your bullet points to emphasize key achievements using exact matching criteria recruiters look for.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  "Action verb optimization & keyword spacing",
                  "Automated skills gap extraction and indexing",
                  "Quantifiable impact metric generation",
                  "Form compatibility & layout checking"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="md:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-3xl blur-2xl opacity-60"></div>
              
              {/* Dynamic Interactive Card */}
              <div className="relative bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400">Match score for Senior Architect</span>
                    <h4 className="font-bold text-white text-lg">Google, Inc.</h4>
                  </div>
                  <Target className="w-8 h-8 text-primary/80" />
                </div>
                
                <div className="flex items-center justify-between gap-6">
                  {/* SVG Circle Progress */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                      <circle cx="56" cy="56" r="48" className="stroke-primary" strokeWidth="8" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 48} 
                        strokeDashoffset={2 * Math.PI * 48 * (1 - 0.94)} 
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-white">94</span>
                      <span className="text-sm font-semibold text-primary">%</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Keywords Checked</span>
                        <span className="text-accent font-semibold">15 / 16</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-[93.7%] rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Required Skills</span>
                        <span className="text-primary font-semibold">10 / 10</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-full rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Parsed Skill</span>
                    <span>Status</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-mono">React / Next.js</span>
                    <span className="text-accent font-semibold">Matched</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-mono">CI/CD Pipelines</span>
                    <span className="text-accent font-semibold">Matched</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mt-32 grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Smart Resume Tailoring",
              description: "Upload your base resume and match it against any job description instantly for optimal ATS scoring.",
              icon: FileText,
              color: "text-primary",
              bg: "bg-primary/10",
              delay: "animate-fade-in-up"
            },
            {
              title: "1-Click Applications",
              description: "Let our AI agent auto-fill forms and draft personalized emails directly to hiring managers.",
              icon: Send,
              color: "text-accent",
              bg: "bg-accent/10",
              delay: "animate-fade-in-up animation-delay-200"
            },
            {
              title: "Application Tracking",
              description: "Monitor your success rate, manage interview schedules, and keep all your tailored resumes organized.",
              icon: BarChart,
              color: "text-indigo-400",
              bg: "bg-indigo-500/10",
              delay: "animate-fade-in-up animation-delay-400"
            }
          ].map((feature, i) => (
            <div key={i} className={`glass-panel glass-panel-hover rounded-3xl p-8 ${feature.delay}`}>
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-bold font-outfit text-white mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed font-sans font-light text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/40 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} OptiCV. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
