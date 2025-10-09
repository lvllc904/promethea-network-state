"use client";

import { useState } from "react";
import type { DetectNetworkThreatsInput, DetectNetworkThreatsOutput } from "@/ai/flows/detect-network-threats";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ShieldAlert, ShieldCheck, Siren } from "lucide-react";

type Props = {
  onDetect: (data: DetectNetworkThreatsInput) => Promise<DetectNetworkThreatsOutput>;
};

export function ThreatDetector({ onDetect }: Props) {
  const [networkActivityLogs, setNetworkActivityLogs] = useState("");
  const [physicalAssetStatus, setPhysicalAssetStatus] = useState("");
  const [result, setResult] = useState<DetectNetworkThreatsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const res = await onDetect({ networkActivityLogs, physicalAssetStatus });
      setResult(res);
    } catch (error) {
      console.error("Error detecting threats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Siren className="w-6 h-6 text-destructive" />
            AI Threat Detection
        </CardTitle>
        <CardDescription>
          Monitor network activity and physical asset status to identify and neutralize threats.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="networkActivityLogs">Network Activity Logs</Label>
              <Textarea
                id="networkActivityLogs"
                placeholder="Paste network activity logs here..."
                className="min-h-[150px] font-mono text-xs"
                value={networkActivityLogs}
                onChange={(e) => setNetworkActivityLogs(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physicalAssetStatus">Physical Asset Status</Label>
              <Textarea
                id="physicalAssetStatus"
                placeholder="Paste physical asset status reports..."
                className="min-h-[150px] font-mono text-xs"
                value={physicalAssetStatus}
                onChange={(e) => setPhysicalAssetStatus(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !networkActivityLogs || !physicalAssetStatus} variant="destructive">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : "Scan for Threats"}
          </Button>
        </form>

        <div className="mt-6">
            {isLoading && (
                <div className="flex items-center justify-center h-40 rounded-md border border-dashed text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>AI is analyzing for potential threats...</span>
                </div>
            )}
            {result && (
                result.threatDetected ? (
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Threat Detected!</AlertTitle>
                        <AlertDescription>
                            <p className="font-semibold mt-2">Description:</p>
                            <p>{result.threatDescription}</p>
                            <p className="font-semibold mt-4">Suggested Action:</p>
                            <p>{result.suggestedAction}</p>
                            <div className="mt-4">
                               <Button variant="outline" className="border-destructive text-destructive-foreground bg-destructive/90 hover:bg-destructive">Initiate Community Vote</Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert>
                        <ShieldCheck className="h-4 w-4" />
                        <AlertTitle>No Threats Detected</AlertTitle>
                        <AlertDescription>
                            The submitted logs and status reports appear to be normal. The network is secure.
                        </AlertDescription>
                    </Alert>
                )
            )}
        </div>
      </CardContent>
    </Card>
  );
}
