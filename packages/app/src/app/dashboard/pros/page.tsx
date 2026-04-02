'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@promethea/ui';
import { Badge } from '@promethea/ui';
import { Activity, Database, Radar, Droplets, Map } from 'lucide-react';
import { ScrollArea } from '@promethea/ui';

/**
 * PrOS: Promethean Operating System
 * Iteration 1: The Discovery Terminal Widget
 */

export default function PrOSDashboard() {
  const [lakeData, setLakeData] = useState<any[]>([]);
  const [refineries, setRefineries] = useState<any[]>([]);
  const [waterfall, setWaterfall] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Poll the Omni-Lake directly from the Sovereign Engine
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:8080';
        
        // Fetch Lake Data
        const resLake = await fetch(`${engineUrl}/api/lake`);
        if (resLake.ok) {
          const data = await resLake.json();
          const sorted = data.sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setLakeData(sorted);
        }

        // Fetch Refineries Data
        const resRefineries = await fetch(`${engineUrl}/api/refineries`);
        if (resRefineries.ok) {
          const methodData = await resRefineries.json();
          setRefineries(methodData);
        }

        // Fetch Waterfall Data
        const resWaterfall = await fetch(`${engineUrl}/api/waterfall`);
        if (resWaterfall.ok) {
          const waterfallStatus = await resWaterfall.json();
          setWaterfall(waterfallStatus);
        }
      } catch (err) {
        console.error('PrOS: Failed to sync telemetry', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000); // 10s polling for real-time feel
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
            <Database className="w-8 h-8 text-primary" />
            PrOS Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Modular, role-based interaction with the Reciprocating Intelligence Lake.
          </p>
        </div>
        <Badge variant="outline" className="animate-pulse bg-emerald-500/10 text-emerald-500 border-emerald-500">
          <Activity className="w-4 h-4 mr-2" />
          Omni-Lake Connected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* WIDGET 1: Discovery Terminal (Pillar 1) */}
        <Card className="col-span-1 lg:col-span-2 shadow-xl border-primary/20 bg-background/50 backdrop-blur-xl">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Radar className="w-5 h-5 text-primary" />
              Discovery Terminal
              <Badge variant="secondary" className="ml-auto text-xs font-mono">
                {lakeData.length} PACKETS
              </Badge>
            </CardTitle>
            <CardDescription>
              Raw telemetry ingested by Promethea's Sensory Organs.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] w-full">
              {isLoading ? (
                <div className="p-8 flex justify-center text-muted-foreground animate-pulse">
                  Syncing with Sovereign Nervous System...
                </div>
              ) : lakeData.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Omni-Lake is currently tranquil. Waiting for external stimuli.
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-3">
                  {lakeData.map((packet: any) => (
                    <div 
                      key={packet.id} 
                      className="group border border-border/50 rounded-lg p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={
                            packet.category === 'GRANT' ? 'bg-emerald-500/20 text-emerald-400' :
                            packet.category === 'REAL_ESTATE' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-primary/20 text-primary'
                          }>
                            {packet.category}
                          </Badge>
                          <span className="text-xs font-mono text-muted-foreground">
                            {packet.producer_id}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(packet.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        {/* We parse the JSON payload for formatted display */}
                        {(() => {
                          try {
                            const parsed = JSON.parse(packet.payload);
                            return (
                              <div className="space-y-1">
                                <div className="font-bold text-sm">{parsed.title || parsed.name || 'Raw Data'}</div>
                                {parsed.amount && (
                                  <div className="text-emerald-400 text-sm font-mono">${parsed.amount.toLocaleString()}</div>
                                )}
                                {parsed.agency && (
                                  <div className="text-xs text-muted-foreground uppercase">{parsed.agency}</div>
                                )}
                              </div>
                            );
                          } catch (e) {
                            return <div className="text-xs font-mono break-all line-clamp-2">{packet.payload}</div>;
                          }
                        })()}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-mono truncate max-w-[200px]">
                          packet_id: {packet.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Score:</span>
                          <span className={`font-bold ${(packet.priority_score || 0) > 0.9 ? 'text-rose-400' : 'text-primary'}`}>
                            {(packet.priority_score || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* WIDGET 2: Methodology Tracker (Pillar 2 - Refineries) */}
        <Card className="col-span-1 shadow-xl border-primary/20 bg-background/50 backdrop-blur-xl">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Active Refineries
              <Badge variant="secondary" className="ml-auto text-xs font-mono">
                {refineries.length} METHODS
              </Badge>
            </CardTitle>
            <CardDescription>
              Autonomous modules distilling Omni-Lake raw data into value.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] w-full">
              {isLoading ? (
                <div className="p-8 flex justify-center text-muted-foreground animate-pulse">
                  Connecting to Nervous System...
                </div>
              ) : refineries.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No active refineries found.
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-3">
                  {refineries.map((refinery: any) => (
                    <div 
                      key={refinery.methodId} 
                      className="group border border-border/50 rounded-lg p-4 bg-muted/10"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-headline font-bold text-sm tracking-wide">
                          {refinery.methodName}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={refinery.config.enabled ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-muted-foreground'}
                        >
                          {refinery.config.enabled ? 'ACTIVE' : 'DORMANT'}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground font-mono mb-3">
                        module: {refinery.methodId}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-background/50 rounded p-2 border border-border/30">
                          <div className="text-muted-foreground mb-1">Executions</div>
                          <div className="font-mono">{refinery.executionCount} / {refinery.config.maxExecutionsPerDay}</div>
                        </div>
                        <div className="bg-background/50 rounded p-2 border border-border/30">
                          <div className="text-muted-foreground mb-1">Net Yield</div>
                          <div className={`font-mono ${refinery.totalProfit > 0 ? 'text-emerald-400' : ''}`}>
                            ${refinery.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* WIDGET 3: Sovereign Treasury (Pillar 3 - The Waterfall) */}
        <Card className="col-span-1 shadow-xl border-primary/20 bg-background/50 backdrop-blur-xl">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="w-5 h-5 text-primary" />
              Sovereign Treasury
              {waterfall && (
                <Badge variant="secondary" className="ml-auto text-xs font-mono">
                  ${(waterfall.totalTvlUsd || 0).toLocaleString()} TVL
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Concentric liquidity rings and the automated Waterfall sweep.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] w-full">
              {!waterfall || isLoading ? (
                <div className="p-8 flex justify-center text-muted-foreground animate-pulse">
                  Accounting for Sovereign Wealth...
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-4">
                  
                  {/* Overview Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="bg-muted/20 border border-border/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Active Rings</div>
                      <div className="text-xl font-headline font-bold text-primary">{waterfall.activeRings} / {waterfall.rings?.length}</div>
                    </div>
                    <div className="bg-muted/20 border border-border/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Infra Overhead</div>
                      <div className="text-xl font-headline font-bold text-rose-400">-${(waterfall.infrastructureCostUsd || 0).toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Ring Visualization */}
                  <div className="space-y-4">
                    {waterfall.rings?.map((ring: any, idx: number) => (
                      <div key={ring.name} className="relative">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${ring.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground/30'}`} />
                            <span className="text-xs font-bold font-headline truncate max-w-[120px]">{ring.name}</span>
                          </div>
                          <span className="text-[11px] font-mono">${(ring.balanceSol * 145).toFixed(2)}</span>
                        </div>
                        
                        <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/20">
                          <div 
                            className={`h-full transition-all duration-1000 ${ring.isActive ? 'bg-emerald-400' : 'bg-primary/40'}`} 
                            style={{ width: `${Math.min(100, (ring.balanceSol / ring.thresholdSol) * 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between mt-1 text-[9px] font-mono text-muted-foreground">
                          <span>{ring.balanceSol.toFixed(4)} SOL</span>
                          <span>REQ: {ring.thresholdSol} SOL</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Next Unlock Message */}
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="text-[10px] text-primary uppercase font-bold mb-1">Waterfall Strategy</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {waterfall.nextUnlock}
                    </div>
                  </div>

                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>


        {/* WIDGET 4: Sovereign Atlas (Pillar 4 - Reality Map) */}
        <Card className="col-span-1 shadow-xl border-primary/20 bg-background/50 backdrop-blur-xl">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Map className="w-5 h-5 text-primary" />
              Sovereign Atlas
              <Badge variant="secondary" className="ml-auto text-xs font-mono">
                {lakeData.filter(p => p.category === 'REAL_ESTATE' || p.category === 'RECLAMATION_DRAFT').length} NODES
              </Badge>
            </CardTitle>
            <CardDescription>
              Mapping raw high-desert vacancies to Actualized Reality.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] w-full">
              {isLoading ? (
                <div className="p-8 flex justify-center text-muted-foreground animate-pulse">
                  Rendering Territorial Map...
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-6">
                  {lakeData
                    .filter(p => p.category === 'REAL_ESTATE')
                    .map(asset => {
                      const payload = JSON.parse(asset.payload);
                      const refineryMatch = lakeData.find(p => p.category === 'RECLAMATION_DRAFT' && p.payload.includes(asset.id));
                      
                      return (
                        <div key={asset.id} className="relative pl-6 border-l-2 border-border/50">
                          {/* Anchor Circle */}
                          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-background ${refineryMatch ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          
                          <div className="mb-4">
                            <div className="text-xs font-bold font-headline truncate uppercase">{payload.address}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{payload.zoning}</div>
                          </div>

                          <div className="flex flex-col gap-2">
                             <div className="flex items-center justify-between text-[10px]">
                                <span className="text-muted-foreground">SCAN: RAW Pulse</span>
                                <Badge variant="outline" className="text-[9px] h-4">IDENTIFIED</Badge>
                             </div>
                             
                             <div className="h-0.5 w-full bg-muted/30" />

                             <div className={`flex items-center justify-between text-[10px] ${refineryMatch ? 'opacity-100' : 'opacity-30'}`}>
                                <span className={refineryMatch ? 'text-primary' : 'text-muted-foreground'}>REFINE: Feasibility Study</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-[9px] h-4 ${refineryMatch ? 'border-emerald-400/50 text-emerald-400' : ''}`}
                                >
                                  {refineryMatch ? 'ANALYZED' : 'PENDING'}
                                </Badge>
                             </div>

                             <div className="h-0.5 w-full bg-muted/30" />

                             <div className="flex items-center justify-between text-[10px] opacity-30">
                                <span className="text-muted-foreground">ACTUALIZE: Title Acquired</span>
                                <Badge variant="outline" className="text-[9px] h-4">STAKED</Badge>
                             </div>
                          </div>
                        </div>
                      );
                    })}

                  {lakeData.filter(p => p.category === 'REAL_ESTATE').length === 0 && (
                    <div className="p-8 text-center text-muted-foreground italic text-xs">
                       Scanning high-desert perimeters...
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
