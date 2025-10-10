
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  FileText,
  Shield,
  BookOpen,
  Settings,
  GitMerge,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/passport", icon: Wallet, label: "Passport" },
  { href: "/dashboard/governance", icon: Landmark, label: "Governance" },
  { href: "/dashboard/assets", icon: FileText, label: "RWA Management" },
  { href: "/dashboard/ledger", icon: BookOpen, label: "UVT Ledger" },
  { href: "/dashboard/security", icon: Shield, label: "Immune System" },
  { href: "/roadmap", icon: GitMerge, label: "Roadmap" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="flex-grow-0 justify-center p-2">
        <Link href="/" prefetch={false}>
            <SidebarMenuButton tooltip={{ children: "Home" }} className="h-auto">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-primary"
                >
                    <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5c0 2.22-0.76 4.26-2.06 5.88L12 21.5l-7.44-3.12A9.5 9.5 0 0 1 2.5 12 9.5 9.5 0 0 1 12 2.5Z" />
                    <path d="M12 2.5v19" />
                </svg>
                <span className="text-lg font-headline font-semibold">Promethea</span>
            </SidebarMenuButton>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 justify-center flex">
        <SidebarMenu className="justify-center">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={{ children: item.label }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 flex-grow-0">
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{ children: "Settings" }}>
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
