"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Mail, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Resumes', href: '/dashboard/resumes', icon: FileText, countKey: 'resumes' },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase, countKey: 'jobs' },
  { name: 'Cover Letters', href: '/dashboard/cover-letters', icon: Mail, countKey: 'coverLetters' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState<{ resumes?: number; jobs?: number; coverLetters?: number }>({});

  useEffect(() => {
    const supabase = createClient();
    let isSubscribed = true;

    const fetchCounts = async (uid: string) => {
      try {
        const [resumesRes, jobsRes, coverLettersRes] = await Promise.all([
          supabase.from('Resume').select('id', { count: 'exact', head: true }).eq('userId', uid),
          supabase.from('JobDescription').select('id', { count: 'exact', head: true }).eq('userId', uid),
          supabase.from('CoverLetter').select('id', { count: 'exact', head: true }).eq('userId', uid),
        ]);

        if (isSubscribed) {
          setCounts({
            resumes: resumesRes.count || 0,
            jobs: jobsRes.count || 0,
            coverLetters: coverLettersRes.count || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching dynamic sidebar counts:', err);
      }
    };

    let channel: any = null;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isSubscribed) return;
      
      await fetchCounts(user.id);

      // Subscribe to real-time additions/deletions on the tables
      channel = supabase
        .channel('sidebar-db-counts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'Resume' },
          () => fetchCounts(user.id)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'JobDescription' },
          () => fetchCounts(user.id)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'CoverLetter' },
          () => fetchCounts(user.id)
        )
        .subscribe();
    };

    init();

    return () => {
      isSubscribed = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col w-64 bg-card/45 backdrop-blur-xl border-r border-border/40 min-h-screen relative z-10 transition-all duration-300">
      {/* Sidebar Header - Height aligned with Topnav (h-20) */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-border/40 bg-card/10">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow group cursor-pointer hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:opacity-100 transition-opacity duration-300"></div>
          <Sparkles className="w-5 h-5 text-white animate-pulse relative z-10" />
        </div>
        <span className="font-outfit font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent select-none cursor-pointer">
          OptiCV
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href as any}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                isActive 
                  ? 'bg-gradient-to-r from-primary/15 to-accent/5 text-primary font-bold border-l-4 border-primary shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:translate-x-1 border-l-4 border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs font-semibold tracking-wider uppercase">{item.name}</span>
              
              {item.countKey && counts[item.countKey as keyof typeof counts] !== undefined && counts[item.countKey as keyof typeof counts]! > 0 && (
                <span className="ml-auto px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary border border-primary/20 shadow-glow relative z-10 transition-all duration-300 group-hover:scale-105">
                  {counts[item.countKey as keyof typeof counts]}
                </span>
              )}

              {!isActive && !item.countKey && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary/60 rounded-full scale-0 group-hover:scale-100 transition-all duration-300"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sign Out */}
      <div className="p-4 border-t border-border/40">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 border border-transparent transition-all duration-300 group font-semibold text-xs tracking-wider uppercase"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

