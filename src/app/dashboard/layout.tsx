import { Header } from "@/components/layout/header";
import { MainNav } from "@/components/layout/main-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <MainNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <SidebarInset>
                <Header />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
