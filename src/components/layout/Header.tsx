import { Bell, Search, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-card border-b border-border">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search applications, resumes, jobs..." 
            className="w-full pl-10 pr-4 py-2 bg-muted rounded-full border-none focus:ring-2 focus:ring-primary/50 text-sm outline-none transition-all duration-200"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <div className="w-px h-6 bg-border mx-2"></div>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium hidden sm:block">John Doe</span>
        </button>
      </div>
    </header>
  );
}
