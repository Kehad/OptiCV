import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in font-sans">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-foreground md:text-4xl">Settings</h1>
        <p className="text-muted-foreground mt-1 font-light text-sm">Manage your account and application preferences.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl space-y-8 border border-border/60 shadow-md">
        <div>
          <h2 className="text-lg font-bold mb-5 font-outfit text-foreground">Profile Settings</h2>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
              <input 
                type="text" 
                defaultValue={user.user_metadata.name || user.user_metadata.full_name || ""} 
                disabled
                className="w-full p-3 bg-muted/60 border border-border rounded-xl text-muted-foreground text-sm cursor-not-allowed select-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <input 
                type="email" 
                defaultValue={user.email || ""} 
                disabled
                className="w-full p-3 bg-muted/60 border border-border rounded-xl text-muted-foreground text-sm cursor-not-allowed select-none"
              />
              <p className="text-xs text-muted-foreground mt-1 font-light">Contact support to change your email address.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/60">
          <h2 className="text-lg font-bold mb-5 font-outfit text-foreground">Application Automation</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-muted/40 rounded-2xl border border-border/40 hover:bg-muted/60 hover:border-primary/20 transition-all duration-300">
              <div>
                <h4 className="font-bold text-sm text-foreground">Email Integration</h4>
                <p className="text-xs text-slate-400 font-light mt-0.5">Connect your email provider to send applications directly.</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:bg-primary/95 transition-all duration-200 shadow-glow hover:shadow-glow-lg hover-lift flex-shrink-0">
                Connect Gmail
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-muted/40 rounded-2xl border border-border/40 hover:bg-muted/60 hover:border-primary/20 transition-all duration-300">
              <div>
                <h4 className="font-bold text-sm text-foreground">Auto-fill Assistant</h4>
                <p className="text-xs text-slate-400 font-light mt-0.5">Enable the browser extension for 1-click form filling.</p>
              </div>
              <button className="px-4 py-2 bg-card text-foreground border border-border hover:bg-muted font-semibold rounded-xl text-xs transition-all duration-200 hover-lift flex-shrink-0">
                Install Extension
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
