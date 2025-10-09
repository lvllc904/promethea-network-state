import { proposals } from "@/lib/data"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import Image from "next/image"
import { Clock, Check, X, User } from "lucide-react"

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  const proposal = proposals.find(p => p.id === params.id)

  if (!proposal) {
    notFound()
  }

  const proposerAvatar = PlaceHolderImages.find(p => p.id === proposal.proposer.avatarUrl);
  const totalVotes = proposal.votes.for + proposal.votes.against;
  const forPercentage = totalVotes > 0 ? (proposal.votes.for / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votes.for / totalVotes) * 100 : 0;


  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <Badge variant="outline" className="w-fit">{proposal.category}</Badge>
            <CardTitle className="font-headline text-3xl pt-2">{proposal.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 pt-2">
                <Avatar className="h-6 w-6">
                    {proposerAvatar && <Image src={proposerAvatar.imageUrl} alt={proposal.proposer.name} width={24} height={24} data-ai-hint={proposerAvatar.imageHint} />}
                    <AvatarFallback>{proposal.proposer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                Proposed by {proposal.proposer.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none text-foreground/90">
                <p>{proposal.description}</p>
                <p>This initiative aligns with our core mission of expanding the Promethean Archipelago with productive, community-owned assets. The financial projections indicate a 7% annual yield after accounting for operational costs and a 15% value-add potential upon completion of the sweat equity plan.</p>
                <h3 className="font-headline">Full Proposal Details</h3>
                <p>The complete documentation, including financial audits, risk assessments, and the sweat equity task list, is available on the IPFS-hosted document linked below.</p>
                <Button variant="link" asChild><a href="#">View on IPFS</a></Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-6">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline">Cast Your Vote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Your Voice (voting power) is calculated based on your reputation, contributions, and quadratic voting principles.</p>
                 <div className="grid grid-cols-2 gap-4">
                    <Button variant="default" size="lg" className="bg-green-600 hover:bg-green-700 h-12">
                        <Check className="mr-2 h-5 w-5" />
                        Vote For
                    </Button>
                     <Button variant="destructive" size="lg" className="h-12">
                        <X className="mr-2 h-5 w-5" />
                        Vote Against
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Status</span>
                </div>
                <Badge variant={proposal.status === 'active' ? 'default' : 'secondary'} className="capitalize bg-blue-500/10 text-blue-500">{proposal.status}</Badge>
            </div>
             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Total Voters</span>
                </div>
                <span className="font-medium">{(totalVotes).toLocaleString()}</span>
            </div>
            
            <Separator />

            <div>
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-green-600">For</span>
                    <span className="text-sm text-muted-foreground">{forPercentage.toFixed(2)}%</span>
                </div>
                <Progress value={forPercentage} className="h-3 [&>div]:bg-green-600" />
                 <p className="text-xs text-right text-muted-foreground mt-1">{proposal.votes.for.toLocaleString()} Votes</p>
            </div>
             <div>
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-red-600">Against</span>
                    <span className="text-sm text-muted-foreground">{(100-forPercentage).toFixed(2)}%</span>
                </div>
                <Progress value={100-forPercentage} className="h-3 [&>div]:bg-red-600" />
                 <p className="text-xs text-right text-muted-foreground mt-1">{proposal.votes.against.toLocaleString()} Votes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
