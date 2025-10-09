import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mainUser, proposals, assets } from "@/lib/data";
import { Landmark, FileText, ArrowUpRight, DollarSign, Users, Activity } from "lucide-react";
import Link from "next/link";


export default function Dashboard() {
  const activeProposals = proposals.filter(p => p.status === 'active');
  const totalAUM = assets.reduce((acc, asset) => acc + asset.aum, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Reputation</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainUser.reputation}</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Ownership Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mainUser.ownershipValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Based on current asset valuation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network AUM</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalAUM / 1_000_000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">
              Across {assets.length} Real-World Assets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activeProposals.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting community vote
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center">
             <div className="grid gap-2">
                <CardTitle>Active Proposals</CardTitle>
                <CardDescription>Proposals currently under review by the DAC.</CardDescription>
             </div>
             <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/governance">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
             </Button>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Proposal</TableHead>
                        <TableHead className="text-right">Ends In</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activeProposals.slice(0, 3).map(proposal => (
                        <TableRow key={proposal.id}>
                            <TableCell>
                                <div className="font-medium">{proposal.title}</div>
                                <div className="text-sm text-muted-foreground">
                                    Proposed by {proposal.proposer.name}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">{proposal.endsIn}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Recent Contributions</CardTitle>
            <CardDescription>A summary of your recent activity on the UVT Ledger.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5"/>
                </div>
                <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">Whitepaper Finalization</p>
                    <p className="text-sm text-muted-foreground">Contributed to V12.777 (Final Draft)</p>
                </div>
                <div className="ml-auto font-medium text-success">+1,000 UVT</div>
            </div>
             <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Landmark className="h-5 w-5"/>
                </div>
                <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">Governance Vote</p>
                    <p className="text-sm text-muted-foreground">Voted on Reputation Decay Algorithm</p>
                </div>
                <div className="ml-auto font-medium">-10 Voice Credits</div>
            </div>
          </CardContent>
           <CardFooter>
             <Button asChild className="w-full">
                <Link href="/dashboard/ledger">View Full Ledger</Link>
             </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
