"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { handleAutoList } from "@/app/dashboard/assets/new/actions";
import { type AutoListRWAOutput } from "@promethea/ai";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@promethea/ui";
import { Button } from "@promethea/ui";
import { Loader2, Wand2, Upload } from "lucide-react";

type Props = {
  onComplete: (data: AutoListRWAOutput) => void;
};

export function OneClickLister({ onComplete }: Props) {
  const [documents, setDocuments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = { isAnonymous: false }; // Mock auth for sovereign local execution
  const router = useRouter();


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const fileInput = event.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setError("Please select a file to ingest.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    if (user && !user.isAnonymous) {
      setIsLoading(true);
      setError(null);
      try {
        const result = await handleAutoList(formData);
        if ('error' in result) {
          setError(result.error);
        } else {
          onComplete(result as AutoListRWAOutput);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    } else {
      window.location.href = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001';
    }
  };

  return (
    <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-transparent">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-accent" />
          Sovereign Ingress Agent [v5.3.2]
        </CardTitle>
        <span className="hidden">DIAGNOSTIC_MARKER_V5_3_2</span>
        <CardDescription>
          Upload all your documents. The AI agent will automatically extract the details, underwrite the asset, and fill out the form for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 text-center">
          {/* 
              This input is hidden. In a real implementation, we would trigger this 
              input's click event from the button below and handle the file selection.
            */}
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
