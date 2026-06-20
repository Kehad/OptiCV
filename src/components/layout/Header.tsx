"use client";

import { useEffect, useState, useRef } from 'react';
import { Bell, Search, User, Sun, Moon, ChevronDown, Settings, LogOut, FileText, Loader2, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // User details state
  const [user, setUser] = useState<any>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    resumes: any[];
    jobs: any[];
  }>({ resumes: [], jobs: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
    
    // Close dropdowns on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch current authenticated user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error('Failed to get user session:', err);
      }
    };
    fetchUser();
  }, []);

  // Search keyboard shortcut ⌘K / Ctrl+K focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search logic for Resume and JobDescription tables
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ resumes: [], jobs: [] });
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        // Query Resumes
        const resumesPromise = supabase
          .from('Resume')
          .select('id, title, isOriginal')
          .eq('userId', currentUser.id)
          .ilike('title', `%${searchQuery}%`)
          .limit(5);

        // Query Jobs
        const jobsPromise = supabase
          .from('JobDescription')
          .select('id, title, company, matchScore')
          .eq('userId', currentUser.id)
          .or(`title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
          .limit(5);

        const [resumesRes, jobsRes] = await Promise.all([resumesPromise, jobsPromise]);

        setSearchResults({
          resumes: resumesRes.data || [],
          jobs: jobsRes.data || [],
        });
      } catch (err) {
        console.error('Error during search query:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  const initials = getInitials(displayName);

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-card/45 backdrop-blur-xl border-b border-border/40 sticky top-0 z-40 transition-all duration-300">
      {/* Expanding Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80 sm:w-96 focus-within:sm:w-[28rem] group transition-all duration-300 ease-out" ref={searchContainerRef}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search applications, resumes, jobs..." 
            className="w-full pl-11 pr-14 py-2.5 bg-muted/30 hover:bg-muted/50 rounded-full border border-border/40 focus:border-primary/20 text-sm outline-none transition-all duration-300 shadow-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground/60 bg-muted/80 rounded border border-border/50 select-none pointer-events-none group-focus-within:opacity-0 transition-opacity duration-200">
            ⌘K
          </kbd>

          {/* Search Dropdown Card */}
          {showResults && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-12 max-h-96 overflow-y-auto p-2 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl space-y-3 z-50 animate-fade-in-up">
              {isSearching ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs font-medium">Searching...</span>
                </div>
              ) : (searchResults.resumes.length === 0 && searchResults.jobs.length === 0) ? (
                <div className="text-center py-6 text-muted-foreground text-xs font-medium">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <>
                  {searchResults.resumes.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        Resumes ({searchResults.resumes.length})
                      </div>
                      {searchResults.resumes.map((resume) => (
                        <button
                          key={resume.id}
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery('');
                            router.push(`/dashboard/resumes`);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 text-left"
                        >
                          <FileText className="w-4 h-4 text-primary/70" />
                          <div className="flex-1 truncate">
                            <p className="font-semibold text-foreground truncate">{resume.title}</p>
                            <p className="text-[10px] text-muted-foreground/75 font-normal">
                              {resume.isOriginal ? 'Base Resume' : 'Tailored Version'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.jobs.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                        Jobs ({searchResults.jobs.length})
                      </div>
                      {searchResults.jobs.map((job) => (
                        <button
                          key={job.id}
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery('');
                            router.push(`/dashboard/jobs/${job.id}`);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 text-left"
                        >
                          <Briefcase className="w-4 h-4 text-accent/70" />
                          <div className="flex-1 truncate">
                            <p className="font-semibold text-foreground truncate">{job.title}</p>
                            <p className="text-[10px] text-muted-foreground/75 font-normal truncate">
                              {job.company} {job.matchScore !== null ? `• ${job.matchScore}% Match` : ''}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-4">
        {mounted && (
          <button 
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground transition-all rounded-full hover:bg-muted duration-200 active:scale-90"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 rotate-0 transition-transform duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300 rotate-0 transition-transform duration-300" />
            )}
          </button>
        )}
        
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-all rounded-full hover:bg-muted duration-200 hover-bell-shake">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        
        <div className="w-px h-6 bg-border/60 mx-2"></div>
        
        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/40 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center border border-primary/20 shadow-glow group-hover:scale-105 transition-transform duration-300 text-white font-semibold text-xs font-outfit">
              {initials || <User className="w-4 h-4 text-white" />}
            </div>
            <span className="text-sm font-semibold hidden sm:block text-foreground/80 group-hover:text-foreground transition-colors">{displayName}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 hidden sm:block ${dropdownOpen ? 'rotate-180 text-foreground' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-56 p-2 bg-card/90 backdrop-blur-md border border-border/60 rounded-2xl shadow-xl space-y-1 animate-fade-in-up">
              <div className="px-3 py-2 border-b border-border/40 mb-1">
                <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{email || 'No email'}</p>
              </div>
              <button 
                onClick={() => { setDropdownOpen(false); router.push('/dashboard/settings'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
              >
                <User className="w-4 h-4 text-primary" />
                My Profile
              </button>
              <button 
                onClick={() => { setDropdownOpen(false); router.push('/dashboard/settings'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
              >
                <Settings className="w-4 h-4 text-accent" />
                Settings
              </button>
              <div className="h-px bg-border/40 my-1"></div>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

