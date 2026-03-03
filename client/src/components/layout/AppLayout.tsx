import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AppLayout({ children }: { children: ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full overflow-hidden relative">
          
          {/* Subtle background decorative elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <header className="flex-none h-16 flex items-center justify-between px-6 border-b border-border/40 bg-background/50 backdrop-blur-xl z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground hover-elevate" />
              
              <div className="relative w-64 hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search inventory..." 
                  className="pl-9 bg-white/50 dark:bg-slate-900/50 border-border/50 focus-visible:ring-primary/20 h-9 rounded-full"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover-elevate rounded-full">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
              </button>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 z-0">
            <div className="max-w-7xl mx-auto h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
