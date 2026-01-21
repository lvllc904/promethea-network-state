'use client';

import { useState } from 'react';
import type {
  DetectNetworkThreatsInput,
  DetectNetworkThreatsOutput,
} from '@promethea/ai';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@promethea/ui';
import { Button } from '@promethea/ui';
import { Alert, AlertDescription, AlertTitle } from '@promethea/ui';
import { Loader2, ShieldAlert, ShieldCheck, Siren } from 'lucide-react';
import { ScrollArea } from '@promethea/ui';

type Props = {
  onDetect: (
    data: DetectNetworkThreatsInput
  ) => Promise<DetectNetworkThreatsOutput>;
  actionLedgerData: {
    pledges: any[] | null;
    votes: any[] | null;
  };
};

export function ThreatDetector({ onDetect, actionLedgerData }: Props) {
  const [result, setResult] = useState<DetectNetworkThreatsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const networkActivityLogs = JSON.stringify(
    {
      recentPledges: actionLedgerData.pledges,
      recentVotes: actionLedgerData.votes,
    },
    null,
    2
  );
  // For this simulation, we'll pass the same data for physical status.
  const physicalAssetStatus = JSON.stringify(
    { note: 'Physical asset sensors are nominal.' },
    null,
    2
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const res = await onDetect({ networkActivityLogs, physicalAssetStatus });
      setResult(res);
    } catch (error) {
      console.error('Error detecting threats:', error);
      setResult({
        threatDetected: true,
        threatDescription: 'An unexpected error occurred during analysis.',
        suggestedAction: 'Review application logs and retry the scan.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Siren className="w-6 h-6 text-destructive" />
          Live Ledger Threat Scan
        </CardTitle>
        <CardDescription>
          The AI will analyze the latest on-ledger activities for patterns
          indicative of threats, such as Sybil attacks or economic manipulation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
                 <h3 className="text-sm font-medium text-muted-foreground mb-2">On-Chain Activity (Sample)</h3>
                <ScrollArea className="h-48 w-full rounded-md border bg-muted p-4">
                    <pre className="text-xs font-mono">
                        {networkActivityLogs}
                    </pre>
                </ScrollArea>
            </div>
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Physical Asset Status (Sample)</h3>
                 <ScrollArea className="h-48 w-full rounded-md border bg-muted p-4">
                    <pre className="text-xs font-mono">
                        {physicalAssetStatus}
                    </pre>
                 </ScrollArea>
            </div>
        </div>


        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="destructive"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning Ledger...
            </>
          ) : (
            'Scan Ledger Activity for Threats'
          )}
        </Button>

        <div className="mt-6">
          {isLoading && (
            <div className="flex items-center justify-center h-40 rounded-md border border-dashed text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>AI is analyzing for potential threats...</span>
            </div>
          )}
          {result &&
            (result.threatDetected ? (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Threat Detected!</AlertTitle>
                <AlertDescription>
                  <p className="font-semibold mt-2">Description:</p>
                  <p>{result.threatDescription}</p>
                  <p className="font-semibold mt-4">Suggested Action:</p>
                  <p>{result.suggestedAction}</p>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="border-destructive text-destructive-foreground bg-destructive/90 hover:bg-destructive"
                    >
                      Initiate Community Vote
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>No Threats Detected</AlertTitle>
                <AlertDescription>
                  The submitted logs and status reports appear to be normal. The
                  network is secure.
                </AlertDescription>
              </Alert>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
