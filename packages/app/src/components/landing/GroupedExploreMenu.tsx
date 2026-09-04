'use client';

import Link from 'next/link';
import { ArrowUpRight, BookOpen, Building2, FileText, Info, Map, Network, ShieldCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@promethea/ui';

const groups = [
  {
    label: 'Understand',
    items: [
      { label: 'Our vision', detail: 'Why the network exists.', href: '/about', icon: Info },
      { label: 'Substrate whitepaper', detail: 'Holographic P2P architecture.', href: '/sovereign-substrate-whitepaper', icon: ShieldCheck },
      { label: 'Constitution', detail: 'The founding digital law.', href: '/constitution', icon: FileText },
      { label: 'Press kit', detail: 'Official media resources.', href: '/press', icon: BookOpen },
    ],
  },
  {
    label: 'Operate',
    items: [
      { label: 'Audio town square', detail: 'Open-air spatial voice commons.', href: '#audio-commons', icon: ShieldCheck },
      { label: 'Enter cockpit', detail: 'Identity, treasury, and governance.', href: '/dashboard', icon: ShieldCheck },
      { label: 'Org chart', detail: 'Credentialed offices and stewards.', href: '/org-chart', icon: Building2 },
      { label: 'Pitch deck', detail: 'Capital mechanics and architecture.', href: '/pitch-deck.html', icon: BookOpen, external: true },
    ],
  },
  {
    label: 'Build',
    items: [
      { label: 'Architecture', detail: 'Real-world assets and ownership.', href: '#architecture', icon: Map },
      { label: 'Ecosystem', detail: 'Developer tools and protocols.', href: '#ecosystem', icon: Network },
      { label: 'CPP integration pack', detail: 'DSG and dialogue orchestration.', href: '/cpp-integration-pack', icon: FileText },
    ],
  },
  {
    label: 'Legal',
    items: [
      { label: 'Full LPA', detail: 'Limited Partnership Agreement.', href: '/lpa', icon: FileText },
      { label: 'Full PPM', detail: 'Private Placement Memorandum.', href: '/ppm', icon: FileText },
      { label: 'Knowledge hub', detail: 'Whitepapers and system notes.', href: '/whitepaper', icon: BookOpen },
    ],
  },
];

export function GroupedExploreMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="guildhall-nav-link" aria-label="Open platform navigation">
          Explore
          <span aria-hidden="true">+</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(42rem,calc(100vw-2rem))] border-guildhall-line bg-guildhall-panel p-3 text-guildhall-text shadow-2xl">
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((group, index) => (
            <DropdownMenuGroup key={group.label}>
              <DropdownMenuLabel className="px-2 pb-1 pt-2 text-xs font-medium text-guildhall-muted">{group.label}</DropdownMenuLabel>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild className="focus:bg-guildhall-panel-raised">
                    <Link href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} className="flex items-start gap-3 py-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-guildhall-muted" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1 font-medium">
                          {item.label}
                          {item.external && <ArrowUpRight className="h-3.5 w-3.5 text-guildhall-subtle" aria-hidden="true" />}
                        </span>
                        <span className="mt-0.5 block text-xs text-guildhall-muted">{item.detail}</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              {index < groups.length - 2 && <DropdownMenuSeparator className="bg-guildhall-line sm:hidden" />}
            </DropdownMenuGroup>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
