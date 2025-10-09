import { assets } from "@/lib/data"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, MapPin } from "lucide-react"

export default function RwaManagementPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-headline font-bold">RWA Management</h1>
        <p className="text-muted-foreground">Browse and manage the globally distributed assets of the Promethean Archipelago.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets.map(asset => {
          const assetImage = PlaceHolderImages.find(p => p.id === asset.imageId);
          return (
            <Card key={asset.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
              <CardHeader className="p-0 relative h-48">
                {assetImage && (
                  <Image
                    src={assetImage.imageUrl}
                    alt={asset.name}
                    fill
                    className="object-cover"
                    data-ai-hint={assetImage.imageHint}
                  />
                )}
              </CardHeader>
              <div className="p-6 flex flex-col flex-grow">
                <CardTitle className="font-headline text-xl">{asset.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    {asset.location}
                </CardDescription>

                <p className="text-sm text-muted-foreground mt-4 flex-grow line-clamp-2">{asset.description}</p>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">${asset.aum.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">AUM</span>
                </div>
                
                <Button asChild className="w-full mt-4">
                  <Link href={`/dashboard/assets/${asset.id}`}>
                    Manage Asset
                  </Link>
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
