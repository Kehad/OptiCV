import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and application preferences.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input 
                type="text" 
                defaultValue={user.user_metadata.name || user.user_metadata.full_name || ""} 
                disabled
                className="w-full p-3 bg-muted border border-border rounded-xl text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input 
                type="email" 
                defaultValue={user.email || ""} 
                disabled
                className="w-full p-3 bg-muted border border-border rounded-xl text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">Contact support to change your email address.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <h2 className="text-xl font-bold mb-4">Application Automation</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
              <div>
                <h4 className="font-semibold">Email Integration</h4>
                <p className="text-sm text-muted-foreground">Connect your email provider to send applications directly.</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg">
                Connect Gmail
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
              <div>
                <h4 className="font-semibold">Auto-fill Assistant</h4>
                <p className="text-sm text-muted-foreground">Enable the browser extension for 1-click form filling.</p>
              </div>
              <button className="px-4 py-2 bg-white text-foreground border border-border hover:bg-muted font-medium rounded-lg transition-colors">
                Install Extension
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
