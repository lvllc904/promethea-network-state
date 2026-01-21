"use client";

import { useState } from "react";
import { useUser } from "@promethea/firebase";
import { useRouter } from "next/navigation";
import { type AutoListRWAOutput } from "@promethea/lib";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@promethea/ui";
import { Button } from "@promethea/ui";
import { Loader2, Wand2, Upload } from "lucide-react";

type Props = {
  onComplete: (data: AutoListRWAOutput) => void;
  onAutoList: (documents: string) => Promise<AutoListRWAOutput | { error: string }>;
};

export function OneClickLister({ onComplete, onAutoList }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const documentsContent = "Simulated content from uploaded files.";

    if (user && !user.isAnonymous) {
      setIsLoading(true);
      setError(null);
      try {
        const result = await onAutoList(documentsContent);
        if ('error' in result) {
          setError(result.error);
        } else {
          onComplete(result);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    } else {
      router.push(`/login?redirect=/dashboard/assets/new`);
    }
  };

  return (
    <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-transparent">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-accent" />
          One-Click Listing Agent
        </CardTitle>
        <CardDescription>
          Upload all your documents. The AI agent will automatically extract the details, underwrite the asset, and fill out the form for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 text-center">
          <input type="file" multiple className="hidden" />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <span className="text-lg">Analyzing...</span>
              </>
            ) : (
              <>
                <Upload className="mr-2 h-6 w-6" />
                <span className="text-lg">Upload Files and Documents</span>
              </>
            )}
          </Button>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          {user?.isAnonymous && (
            <p className="text-xs text-center text-muted-foreground pt-2">Create a Promethean Passport to use the one-click lister.</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
