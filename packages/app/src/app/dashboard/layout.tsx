'use client';

import { GuildhallCockpit } from '@/components/cockpit/GuildhallCockpit';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <GuildhallCockpit>{children}</GuildhallCockpit>;
}
