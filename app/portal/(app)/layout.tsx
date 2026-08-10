import { PortalNav } from "@/components/portal/PortalNav";
import { OfflineBanner } from "@/components/offline/OfflineBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <OfflineBanner />
      <div className="flex flex-col md:flex-row">
        <PortalNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
