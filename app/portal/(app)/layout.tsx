import { PortalNav } from "@/components/portal/PortalNav";
import { OfflineBanner } from "@/components/offline/OfflineBanner";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <OfflineBanner />
      <div className="flex flex-col md:flex-row">
        <PortalNav />
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="hidden md:flex justify-end items-center px-8 py-3 border-b border-border">
            <ThemeToggle />
          </div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
