import Link from 'next/link';
import type { ComponentProps } from 'react';
import { ArrowUpRight, Building2, Code2, Cpu, Database, Map, Network } from 'lucide-react';
import { GuildhallPanel } from '@/components/guildhall/GuildhallPanel';

const concepts = [
  { title: 'Sweat equity', description: 'Convert documented work into fractional ownership.', icon: Building2, accent: 'identity' as const },
  { title: 'Real-world assets', description: 'Anchor the network in land, infrastructure, and productive property.', icon: Map, accent: 'treasury' as const },
  { title: 'Intellectual capital', description: 'Turn ideas and research into governance mandates.', icon: Cpu, accent: 'consensus' as const },
  { title: 'Generative governance', description: 'Make consensus legible, inspectable, and enforceable.', icon: Network, accent: 'consensus' as const },
];

const tools = [
  { title: 'Cartographer', description: 'CLI and SDK for digitizing and securitizing real-world assets on-chain.', href: '/products/cartographer', command: 'npm install @promethean/cartographer', accent: 'identity' as const, icon: Map },
  { title: 'Sovereign Mesh', description: 'Peer-to-peer state synchronization for resilient coordination.', href: '/products/mesh', command: 'npx @promethea/mesh start', accent: 'treasury' as const, icon: Network },
  { title: 'ASGI Consensus', description: 'Economic AI tooling for treasury and liquidity management.', href: '/products/asgi', command: 'npm install @promethean/asgi', accent: 'consensus' as const, icon: Cpu },
  { title: 'Atlas Substrate', description: '3D mapping components for sovereign telemetry.', href: '/products/atlas', command: 'npm install @promethean/atlas-ui', accent: 'treasury' as const, icon: Database },
  { title: 'DepthOS Bridge', description: 'Local-first storage for keys, identity passports, and sensory state.', href: '/products/depthos', command: 'npm install @promethean/depthos-bridge', accent: 'identity' as const, icon: Code2 },
  { title: 'GRAG Gateway', description: 'Grounded agent infrastructure with pre- and post-generation checks.', href: '/products/grag', command: 'npm install @promethean/grag-sdk', accent: 'consensus' as const, icon: ShieldIcon },
];

function ShieldIcon(props: ComponentProps<typeof Network>) {
  return <Network {...props} />;
}

export function ProtocolBento() {
  return (
    <div className="space-y-12">
      <div className="grid gap-px overflow-hidden border border-guildhall-line bg-guildhall-line md:grid-cols-2">
        {concepts.map(({ title, description, icon: Icon, accent }) => (
          <GuildhallPanel key={title} accent={accent} className="border-0 bg-guildhall-panel" padded={false}>
            <Icon className="h-5 w-5 text-guildhall-muted" aria-hidden="true" />
            <h3 className="mt-12 font-command text-xl font-semibold text-guildhall-text">{title}</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-guildhall-muted">{description}</p>
          </GuildhallPanel>
        ))}
      </div>
      <div className="grid gap-px overflow-hidden border border-guildhall-line bg-guildhall-line md:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ title, description, href, command, accent, icon: Icon }) => (
          <Link href={href} key={title} className="group">
            <GuildhallPanel accent={accent} className="h-full border-0 bg-guildhall-panel transition-colors group-hover:bg-guildhall-panel-raised" padded={false}>
              <div className="flex items-start justify-between gap-4"><Icon className="h-5 w-5 text-guildhall-muted" aria-hidden="true" /><ArrowUpRight className="h-4 w-4 text-guildhall-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></div>
              <h3 className="mt-8 font-command text-xl font-semibold text-guildhall-text">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-guildhall-muted">{description}</p>
              <code className="mt-6 block border border-guildhall-line bg-guildhall-bg px-3 py-2 text-xs text-guildhall-subtle">{command}</code>
            </GuildhallPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
