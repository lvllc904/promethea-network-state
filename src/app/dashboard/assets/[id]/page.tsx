import { assets, users } from "@/lib/data"
import { notFound } from "next/navigation"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, MapPin, CheckCircle, Clock, Wrench } from "lucide-react"
import { TaskAllocationTool } from "@/components/ai/task-allocation-tool"
import { allocateRWATasks, type AllocateRWATasksInput } from "@/ai/flows/allocate-rwa-tasks"

async function handleAllocate(data: AllocateRWATasksInput) {
    "use server";
    try {
        // In a real app, you might add more complex logic or data fetching here.
        // For the mock, we can hardcode a response or make it more dynamic.
        if (data.taskDescription.toLowerCase().includes('electrician')) {
            return { suggestedMembers: ['user3'] };
        }
        if (data.taskDescription.toLowerCase().includes('manage')) {
            return { suggestedMembers: ['user2'] };
        }
        return await allocateRWATasks(data);
    } catch (error) {
        console.error(error);
        return { suggestedMembers: [] };
    }
}

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  const asset = assets.find(a => a.id === params.id)

  if (!asset) {
    notFound()
  }

  const assetImage = PlaceHolderImages.find(p => p.id === asset.imageId)

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <Card className="shadow-lg overflow-hidden">
            {assetImage && (
                <div className="relative h-64 w-full">
                    <Image
                        src={assetImage.imageUrl}
                        alt={asset.name}
                        fill
                        className="object-cover"
                        data-ai-hint={assetImage.imageHint}
                    />
                </div>
            )}
            <CardHeader>
                <CardTitle className="font-headline text-3xl">{asset.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    <MapPin className="w-4 h-4" /> {asset.location}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-lg text-foreground/80">{asset.description}</p>
                 <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Assets Under Management (AUM)</h3>
                        <p className="text-2xl font-bold flex items-center gap-2"><DollarSign className="w-5 h-5"/>{asset.aum.toLocaleString()}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Monthly Net Cash Flow</h3>
                        <p className="text-2xl font-bold flex items-center gap-2"><DollarSign className="w-5 h-5"/>{asset.cashFlow.toLocaleString()}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Wrench className="w-6 h-6"/>
                    Sweat Equity Tasks
                </CardTitle>
                <CardDescription>Contribute labor to earn ownership in this asset.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Value (UVT)</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {asset.tasks.map(task => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell>
                                    <Badge variant={task.status === 'Open' ? "default" : "secondary"}
                                        className={
                                            task.status === 'Open' ? "bg-green-500/10 text-green-700"
                                            : task.status === 'In Progress' ? "bg-blue-500/10 text-blue-700"
                                            : "bg-gray-500/10 text-gray-700"
                                        }
                                    >
                                        {task.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono">{task.value}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" disabled={task.status !== 'Open'}>Apply</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <TaskAllocationTool onAllocate={handleAllocate} />
      </div>
    </div>
  )
}
