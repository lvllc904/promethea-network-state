
"use client";

import { useState } from "react";
import type { AllocateRWATasksInput } from "@promethea/ai";
import { useCollection, useFirestore, useMemoFirebase } from '@promethea/firebase';
import { collection, Query } from 'firebase/firestore';
import { Citizen } from '@promethea/lib';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@promethea/ui";
import { Label } from "@promethea/ui";
import { Textarea } from "@promethea/ui";
import { Button } from "@promethea/ui";
import { Loader2, Users, Wand2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@promethea/ui";
import { PlaceHolderImages } from "@promethea/lib";
import Image from "next/image";
import { Badge } from "@promethea/ui";

type Props = {
  onAllocate: (data: AllocateRWATasksInput) => Promise<{ suggestedMembers: string[] }>;
};

export function TaskAllocationTool({ onAllocate }: Props) {
  const [taskDescription, setTaskDescription] = useState("");
  const [suggestedMemberIds, setSuggestedMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const firestore = useFirestore();
  const citizensQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'citizens') as unknown as Query<Citizen> : null),
    [firestore]
  );
  const { data: citizens } = useCollection<Citizen>(citizensQuery as any);

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
                <Users className="mr-2 h-4 w-4" />
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
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/80">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border">
                          {memberAvatar && <Image src={memberAvatar.imageUrl} alt={member.id} width={48} height={48} data-ai-hint={memberAvatar.imageHint} />}
                          <AvatarFallback className="text-lg">{member.id.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-semibold">Citizen {member.id}</p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills?.map(skill => (
                              <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
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

