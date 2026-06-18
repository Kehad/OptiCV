import Link from 'next/link';
import { ArrowRight, FileText, Sparkles, Send, Target, BarChart, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* Background Effects */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <main className="relative container mx-auto px-4 pt-32 pb-16">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Resume Optimization</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            Land Your Dream Job with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Intelligent Tailoring
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Automatically customize your resume, generate perfect cover letters, and auto-submit applications to outsmart ATS and wow recruiters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-primary hover:bg-primary/90 rounded-full transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-foreground bg-white/5 hover:bg-white/10 border border-border rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              View Demo
            </Link>
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
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              delay: "animate-fade-in-up animation-delay-200"
            },
            {
              title: "Application Tracking",
              description: "Monitor your success rate, manage interview schedules, and keep all your tailored resumes organized.",
              icon: BarChart,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
              delay: "animate-fade-in-up animation-delay-400"
            }
          ].map((feature, i) => (
            <div key={i} className={`glass-panel rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 ${feature.delay}`}>
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        {/* Interactive Preview Section */}
        <section className="mt-32 max-w-5xl mx-auto glass-panel rounded-3xl overflow-hidden border border-border shadow-panel animate-fade-in-up">
          <div className="bg-muted/50 border-b border-border p-4 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="mx-auto bg-background/50 rounded-md px-4 py-1 text-sm text-muted-foreground border border-border">
              app.opticv.ai/optimize
            </div>
          </div>
          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold">Beat the ATS Every Time</h3>
              <ul className="space-y-4">
                {[
                  "Keyword gap analysis",
                  "Action verb optimization",
                  "Quantifiable achievements check",
                  "Format compatibility verification"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl blur-xl"></div>
              <div className="relative bg-card border border-border rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Match Score</div>
                    <div className="text-4xl font-bold text-primary flex items-baseline gap-1">
                      94<span className="text-xl">%</span>
                    </div>
                  </div>
                  <Target className="w-10 h-10 text-primary opacity-20" />
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[94%] rounded-full"></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Required Skills: 10/10</span>
                    <span>Keywords: 15/16</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
