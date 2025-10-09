import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { proposals } from "@/lib/data"
import { User, CheckCircle, XCircle, Clock, PlusCircle } from "lucide-react"
import Link from "next/link"

export default function GovernancePage() {

  const renderProposalCard = (proposal) => {
    const totalVotes = proposal.votes.for + proposal.votes.against;
    const forPercentage = totalVotes > 0 ? (proposal.votes.for / totalVotes) * 100 : 0;

    const statusMap = {
        active: { icon: <Clock className="w-4 h-4 text-blue-500" />, text: `Ends in ${proposal.endsIn}`, color: "bg-blue-500/10 text-blue-500" },
        passed: { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: "Passed", color: "bg-green-500/10 text-green-500" },
        failed: { icon: <XCircle className="w-4 h-4 text-red-500" />, text: "Failed", color: "bg-red-500/10 text-red-500" },
        executing: { icon: <CheckCircle className="w-4 h-4 text-purple-500" />, text: "Executing", color: "bg-purple-500/10 text-purple-500" },
    }
    const statusInfo = statusMap[proposal.status];

    return (
        <Card key={proposal.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <Badge variant="outline">{proposal.category}</Badge>
                     <div className={`flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.text}</span>
                    </div>
                </div>
                <CardTitle className="font-headline pt-2">{proposal.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">{proposal.description}</p>
                {proposal.status === 'active' && (
                    <div className="mt-4 space-y-2">
                        <Progress value={forPercentage} />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>For: {proposal.votes.for.toLocaleString()}</span>
                            <span>Against: {proposal.votes.against.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{proposal.proposer.name}</span>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/dashboard/governance/${proposal.id}`}>View & Vote</Link>
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-headline font-bold">Proposals</h1>
                <p className="text-muted-foreground">Participate in the Promethean DAC's decision-making process.</p>
            </div>
            <Button asChild>
                <Link href="/dashboard/governance/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Proposal
                </Link>
            </Button>
        </div>
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="executing">Executing</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {proposals.filter(p => p.status === 'active').map(renderProposalCard)}
            </div>
        </TabsContent>
        <TabsContent value="passed">
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {proposals.filter(p => p.status === 'passed').map(renderProposalCard)}
            </div>
        </TabsContent>
         <TabsContent value="executing">
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {proposals.filter(p => p.status === 'executing').map(renderProposalCard)}
            </div>
        </TabsContent>
        <TabsContent value="failed">
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {proposals.filter(p => p.status === 'failed').map(renderProposalCard)}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
