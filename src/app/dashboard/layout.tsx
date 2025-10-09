
'use client';

import { Header } from "@/components/layout/header";
import { MainNav } from "@/components/layout/main-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
    return (
        <div className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
             <div className="grid gap-4 md:gap-8 lg:grid-cols-2 mt-8">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
             </div>
        </div>
    )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUserLoading } = useUser();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <MainNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <SidebarInset>
                <Header />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {/* With auth disconnected, we never show the skeleton */}
                    {children}
                </main>
            </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
