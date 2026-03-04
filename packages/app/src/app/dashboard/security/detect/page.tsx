'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@promethea/ui';
import { Radar, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { ThreatDetector } from '@promethea/components';

export default function SecurityDetectPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-headline flex items-center gap-2">
                        <Radar className="w-8 h-8 text-primary" />
                        Live Threat Radar
                    </h1>
                    <p className="text-muted-foreground mt-1">Real-time surveillance of the Network State's digital perimeter.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-primary/20 bg-primary/5 min-h-[400px]">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Active Signal Analysis
                        </CardTitle>
                        <CardDescription>Filtering incoming requests and identifying bot patterns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ThreatDetector onDetect={async () => ({ threatDetected: false, threatDescription: "Perimeter secure. No active threats detected.", suggestedAction: "Maintain standard surveillance." })} />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md font-headline flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Perimeter Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Firewall Level</span>
                                    <span className="font-mono text-primary">AGGRESSIVE</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Bot Filtering</span>
                                    <span className="font-mono text-green-500">ACTIVE</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>SSL Integrity</span>
                                    <span className="font-mono text-green-500">VERIFIED</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-black border-primary/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md font-headline flex items-center gap-2 text-primary font-mono">
                                <Terminal className="w-4 h-4" />
                                Immune Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="font-mono text-[10px] space-y-1 text-green-500/80">
                            <p>[12:54:21] FILTER: Blocked request to /wp-admin from 45.12.3.4</p>
                            <p>[12:54:25] FILTER: Blocked request to /config.php from 192.16.8.1</p>
                            <p>[12:55:01] SIGNAL: Normal human traffic detected on /roadmap</p>
                            <p>[12:55:10] PERIMETER: All systems nominal.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
