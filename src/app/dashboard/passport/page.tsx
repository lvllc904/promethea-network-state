import { mainUser } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function PassportPage() {
  const userAvatar = PlaceHolderImages.find(p => p.id === mainUser.avatarUrl);
  const userDID = `did:prmth:${mainUser.id}`;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
              {userAvatar && <Image src={userAvatar.imageUrl} alt={mainUser.name} width={96} height={96} data-ai-hint={userAvatar.imageHint} />}
              <AvatarFallback className="text-3xl">{mainUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold font-headline">{mainUser.name}</h2>
            <p className="text-muted-foreground">Founding Member</p>
            <div className="flex items-center gap-2 mt-4">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-xl font-bold">{mainUser.reputation}</span>
              <span className="text-sm text-muted-foreground">Reputation</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Promethean Passport</CardTitle>
            <CardDescription>Your Self-Sovereign Identity in the Network State.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Decentralized Identifier (DID)</h3>
              <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
                <code className="text-sm font-mono truncate">{userDID}</code>
                <Button variant="ghost" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Verifiable Credentials</h3>
              <div className="flex flex-wrap gap-2">
                {mainUser.credentials.map((cred, index) => (
                  <Badge key={index} variant="secondary" className="text-base py-1 px-3 border-primary/50 text-primary-foreground bg-primary/80">
                    {cred}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Ownership Value</h3>
                    <p className="text-2xl font-bold">${mainUser.ownershipValue.toLocaleString()}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Proposals Voted On</h3>
                    <p className="text-2xl font-bold">42</p>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Sweat Equity Tasks</h3>
                    <p className="text-2xl font-bold">17 Completed</p>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                    <p className="text-2xl font-bold">2024</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
