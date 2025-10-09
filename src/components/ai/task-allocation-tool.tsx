"use client";

import { useState } from "react";
import type { AllocateRWATasksInput } from "@/ai/flows/allocate-rwa-tasks";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Citizen } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Wand2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

type Props = {
  onAllocate: (data: AllocateRWATasksInput) => Promise<{ suggestedMembers: string[] }>;
};

export function TaskAllocationTool({ onAllocate }: Props) {
  const [taskDescription, setTaskDescription] = useState("");
  const [suggestedMemberIds, setSuggestedMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const firestore = useFirestore();
  const citizensQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'citizens') : null),
    [firestore]
  );
  const { data: citizens } = useCollection<Citizen>(citizensQuery);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setSuggestedMemberIds([]);
    try {
      const result = await onAllocate({ taskDescription });
      setSuggestedMemberIds(result.suggestedMembers);
    } catch (error) {
      console.error("Error allocating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedMembers = citizens?.filter(c => suggestedMemberIds.includes(c.id)) || [];

  return (
    <Card className="shadow-lg bg-background/50">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-accent" />
          AI Labor Allocation
        </CardTitle>
        <CardDescription>
          Efficiently match member skills with tasks to optimize sweat equity deployment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskDescription">Task Description</Label>
            <Textarea
              id="taskDescription"
              placeholder="e.g., 'Requires certified electrician for rewiring work on 3rd floor. Experience with commercial-grade systems preferred.'"
              className="min-h-[100px]"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading || !taskDescription} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suggesting...
              </>
            ) : (
                <>
                 <Users className="mr-2 h-4 w-4"/>
                Suggest Members
                </>
            )}
          </Button>
        </form>

        {(isLoading || suggestedMembers.length > 0) && (
          <div className="mt-6 space-y-4">
             <h3 className="font-semibold">Suggested Members</h3>
             {isLoading ? (
                 <div className="flex items-center justify-center h-24 rounded-md border border-dashed text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Analyzing member skills...</span>
                </div>
             ) : (
                <div className="space-y-4">
                {suggestedMembers.map(member => {
                    const memberAvatar = PlaceHolderImages.find(p => p.id === `user${member.id}`);
                    return (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-md border">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    {memberAvatar && <Image src={memberAvatar.imageUrl} alt={member.id} width={40} height={40} data-ai-hint={memberAvatar.imageHint} />}
                                    <AvatarFallback>{member.id.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">Citizen {member.id}</p>
                                    <p className="text-sm text-muted-foreground">Rep: {member.reputationScore}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Assign</Button>
                        </div>
                    )
                })}
                </div>
             )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
