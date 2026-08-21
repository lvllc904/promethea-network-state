"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UiVersionToggle } from "@/components/layout/UiVersionToggle";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@promethea/ui";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  FileText,
  Shield,
  BookOpen,
  Settings,
  GitMerge,
  Scale,
  Users,
  Store,
  HandCoins,
  Activity,
  Globe,
  Handshake,
  TrendingUp,
  Terminal
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/intel", icon: Activity, label: "Intel" },
  { href: "/blog", icon: FileText, label: "Blog" }, // Integrated Promethean Blog
  { href: "/dashboard/passport", icon: Wallet, label: "Passport" },
  { href: "/dashboard/founder", icon: Users, label: "Founders" },
  { href: "/dashboard/treasury", icon: Landmark, label: "Treasury (Cap Table)" },
  { href: "/dashboard/governance", icon: Scale, label: "Governance" },
  { href: "/dashboard/assets", icon: Store, label: "Marketplace" },
  { href: "/dashboard/exchange", icon: TrendingUp, label: "Exchange DEX" },
  { href: "/dashboard/financing", icon: HandCoins, label: "Financing" },
  { href: "/dashboard/ledger", icon: BookOpen, label: "My Assets" },
  { href: "/dashboard/ledger/public", icon: Globe, label: "Sovereign Ledger" },
  { href: "/dashboard/developers", icon: Terminal, label: "Cartographer CLI" },
  { href: "/dashboard/security", icon: Shield, label: "Immune System" },
  { href: "/dashboard/diplomatic-portal", icon: Handshake, label: "Diplomatic Portal" },
  { href: "/roadmap", icon: GitMerge, label: "Roadmap" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="flex-grow-0 justify-center p-2">
        <Link href="/" prefetch={false}>
          <SidebarMenuButton tooltip="Home" className="h-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <span className="font-black text-black text-xs tracking-tighter">PNS</span>
              </div>
              <span className="font-headline font-black tracking-[0.2em] text-xs text-white">PROMETHEAN</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 justify-center flex">
        <SidebarMenu className="justify-center">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={!!pathname && pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 flex-grow-0 flex flex-col gap-2">
        <UiVersionToggle className="w-full justify-between scale-95" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
