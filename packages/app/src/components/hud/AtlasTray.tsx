'use client';

import React, { useState, useEffect } from 'react';
import { 
    Map as MapIcon, 
    Layers, 
    Building2, 
    Droplet, 
    PlusCircle, 
    Database,
    Zap,
    Wind,
    ShieldCheck,
    Cpu,
    ArrowUpRight,
    Activity,
    Server,
    Box,
    AlertTriangle
} from 'lucide-react';
import { useHUD, defaultPOI } from '@/lib/hud-store';

const CircularGauge = ({ value, label, color, unit, icon: Icon }: { value: number; label: string; color: string; unit: string; icon: any }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-2 bg-black/40 border border-white/5 rounded-lg relative hover:border-amber-500/30 transition-all duration-300 group">
            <div className="relative w-12 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="24"
                        cy="28"
                        r={radius}
                        stroke="#27272a"
                        strokeOpacity="0.4"
                        strokeWidth="2.5"
                        fill="transparent"
                    />
                    <circle
                        cx="24"
                        cy="28"
                        r={radius}
                        stroke={color}
                        strokeWidth="2.5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:scale-110 transition-transform duration-300" style={{ color }} />
                </div>
            </div>
            <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase mt-1 tracking-wider text-center">{label}</span>
            <div className="flex items-baseline gap-0.5 mt-0.5 font-mono">
                <span className="text-[9px] font-black text-zinc-100">{value}%</span>
                <span className="text-[5.5px] text-zinc-600 uppercase font-bold">{unit}</span>
            </div>
        </div>
    );
};

const getMockData = (path: string): any => {
    const cleanPath = path.split('?')[0];
    switch (cleanPath) {
        case '/api/assets':
            return [
                {
                    id: 'asset-1',
                    name: 'Neo-Tokyo Energy Grid Claim',
                    title: 'Neo-Tokyo Energy Grid Claim',
                    type: 'ENERGY_ZONE',
                    category: 'ENERGY_ZONE',
                    status: 'ACTUALIZED',
                    value: '1,450,000',
                    description: 'Micro-grid power yield tokenized asset backing sovereign reserve pools.',
                    yesVotes: 48,
                    noVotes: 2,
                    fundingTotal: 1450000
                },
                {
                    id: 'asset-2',
                    name: 'Sovereign Fibre Link Alpha',
                    title: 'Sovereign Fibre Link Alpha',
                    type: 'COMMUNICATIONS',
                    category: 'COMMUNICATIONS',
                    status: 'ACTIVE',
                    value: '820,000',
                    description: 'High-speed encrypted physical fiber routing between sovereign micro-regions.',
                    yesVotes: 32,
                    noVotes: 1,
                    fundingTotal: 820000
                },
                {
                    id: 'asset-3',
                    name: 'Planetary Desalination Node-4',
                    title: 'Planetary Desalination Node-4',
                    type: 'WATER_RIGHTS',
                    category: 'WATER_RIGHTS',
                    status: 'PENDING',
                    value: '2,100,000',
                    description: 'Atmospheric water harvesting array claiming physical water production rights.',
                    yesVotes: 25,
                    noVotes: 0,
                    fundingTotal: 500000
                }
            ];
        case '/api/refineries':
            return [
                {
                    id: 'land-scanner',
                    methodId: 'land-scanner',
                    name: 'Solar Potential',
                    roi: '1.4',
                    totalProfit: 142.5,
                    executionCount: 24,
                    config: { conservationTier: 'ZERO_COST' }
                },
                {
                    id: 'bio-node',
                    methodId: 'bio-node',
                    name: 'Wind Yield',
                    roi: '1.2',
                    totalProfit: 98.2,
                    executionCount: 18,
                    config: { conservationTier: 'ZERO_COST' }
                },
                {
                    id: 'data-scraping',
                    methodId: 'data-scraping',
                    name: 'Water Rights Scanner',
                    roi: '1.8',
                    totalProfit: 320.0,
                    executionCount: 45,
                    config: { conservationTier: 'STANDARD' }
                },
                {
                    id: 'real-estate-tokenization',
                    methodId: 'real-estate-tokenization',
                    name: 'Zoning Status Monitor',
                    roi: '1.5',
                    totalProfit: 88.0,
                    executionCount: 12,
                    config: { conservationTier: 'STANDARD' }
                },
                {
                    id: 'seo-blog',
                    methodId: 'seo-blog',
                    name: 'Sovereign SEO Engine',
                    roi: '2.1',
                    totalProfit: 450.5,
                    executionCount: 88,
                    config: { conservationTier: 'ZERO_COST' }
                }
            ];
        case '/api/engine/intelligence':
            return [
                {
                    category: 'ENVIRONMENTAL',
                    timestamp: new Date().toISOString(),
                    payload: JSON.stringify({
                        wind_speed_10m: 14.2,
                        temperature_2m: 19.5,
                        shortwave_radiation: 340.0
                    })
                }
            ];
        case '/api/institutions':
            return [
                {
                    name: 'Sovereign Land Trust',
                    type: 'REAL_ESTATE_TRUST',
                    status: 'ACTIVE',
                    stake: '45,000 UVT'
                },
                {
                    name: 'OmniLake Data Syndicate',
                    type: 'DATA_UNION',
                    status: 'ACTUALIZED',
                    stake: '120,000 UVT'
                },
                {
                    name: '3-Body Metabolic DAO',
                    type: 'BIO_COOPERATIVE',
                    status: 'ACTIVE',
                    stake: '85,000 UVT'
                }
            ];
        default:
            return undefined;
    }
};

function useBFFData<T>(path: string, defaultValue: T): { data: T; refetch: () => void } {
    const [data, setData] = useState<T>(() => {
        const mock = getMockData(path);
        return mock !== undefined ? (mock as unknown as T) : defaultValue;
    });

    const fetchData = () => {
        fetch(path)
            .then(r => {
                if (r.ok) {
                    return r.json();
                } else {
                    const mock = getMockData(path);
                    return mock !== undefined ? mock : null;
                }
            })
            .then(d => {
                if (d !== null) setData(d);
            })
            .catch(() => {
                const mock = getMockData(path);
                if (mock !== undefined) setData(mock as unknown as T);
            });
    };

    useEffect(() => { fetchData(); }, [path]);
    return { data, refetch: fetchData };
}

export const AtlasTray = () => {
    const { activateFocusPanel, activePOI, activeHazards } = useHUD();
    const { data: liveAssets, refetch: refetchAssets } = useBFFData<any[]>('/api/assets', []);
    const { data: refineries } = useBFFData<any[]>('/api/refineries', []);
    const { data: intelligence } = useBFFData<any[]>('/api/engine/intelligence', []);
    const { data: institutions } = useBFFData<any[]>('/api/institutions', []);
    
    const [extraAssets, setExtraAssets] = useState<any[]>([]);
    const [chartMetric, setChartMetric] = useState<'solar' | 'wind' | 'water'>('solar');
    const [hoveredPoint, setHoveredPoint] = useState<{ idx: number; val: number; x: number; y: number } | null>(null);

    // Resolve active coordinate metrics (falling back gracefully to defaultPOI if undefined)
    const poi = activePOI || defaultPOI;
    const frame = poi.referenceFrame || 'EARTH';
    
    const baseSolar = poi.metrics?.solar ?? 85;
    const baseWind = poi.metrics?.wind ?? 45;
    const baseWater = poi.metrics?.water ?? 92;
    const baseZoning = poi.metrics?.zoning ?? 75;

    const lat = poi.coordinates?.lat || 30.2672;
    const lng = poi.coordinates?.lng || -97.7431;

    // Coordinate-specific phase and wave multiplier seed for seasonal variations
    const coordSeed = Math.sin(lat * 0.05) * Math.cos(lng * 0.05);

    const getMonthlyYield = (monthIndex: number, metric: 'solar' | 'wind' | 'water') => {
        let baseValue = 0;
        let multiplier = 1.0;
        let phaseShift = coordSeed * 2.0;
        let seasonalAmplitude = 15.0;

        if (metric === 'solar') {
            baseValue = baseSolar;
            const angle = ((monthIndex - 2.5) / 12) * 2 * Math.PI + phaseShift;
            const seasonalEffect = Math.sin(angle) * seasonalAmplitude;
            
            if (frame === 'LUNA') {
                multiplier = 1.4;
            } else if (frame === 'MARS') {
                multiplier = 0.6;
            } else {
                multiplier = 1.0;
            }
            return Math.min(100, Math.max(0, (baseValue + seasonalEffect) * multiplier));
        } else if (metric === 'wind') {
            baseValue = baseWind;
            const angle = ((monthIndex * 2 - 1) / 12) * 2 * Math.PI + phaseShift;
            const seasonalEffect = Math.sin(angle) * seasonalAmplitude;
            
            if (frame === 'LUNA') {
                multiplier = 0.0;
            } else if (frame === 'MARS') {
                multiplier = 0.4;
            } else {
                multiplier = 1.0;
            }
            return Math.min(100, Math.max(0, (baseValue + seasonalEffect) * multiplier));
        } else { // water
            baseValue = baseWater;
            const angle = ((monthIndex - 3.5) / 12) * 2 * Math.PI + phaseShift;
            const seasonalEffect = Math.sin(angle) * seasonalAmplitude;
            
            if (frame === 'LUNA') {
                multiplier = 0.1;
            } else if (frame === 'MARS') {
                multiplier = 0.2;
            } else {
                multiplier = 1.0;
            }
            return Math.min(100, Math.max(0, (baseValue + seasonalEffect) * multiplier));
        }
    };

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartPoints = MONTHS.map((name, idx) => {
        const val = getMonthlyYield(idx, chartMetric);
        return { name, val };
    });

    const width = 340;
    const height = 110;
    const paddingLeft = 20;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 20;

    const usableWidth = width - paddingLeft - paddingRight;
    const usableHeight = height - paddingTop - paddingBottom;

    const points = chartPoints.map((p, idx) => {
        const x = paddingLeft + (idx / 11) * usableWidth;
        const y = paddingTop + usableHeight - (p.val / 100) * usableHeight;
        return { x, y, val: p.val, name: p.name, idx };
    });

    let linePath = '';
    if (points.length > 0) {
        linePath = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            linePath += ` L ${points[i].x} ${points[i].y}`;
        }
    }

    let areaPath = '';
    if (points.length > 0) {
        areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + usableHeight} L ${points[0].x} ${paddingTop + usableHeight} Z`;
    }

    const strokeColor = chartMetric === 'solar' ? '#f59e0b' : chartMetric === 'wind' ? '#06b6d4' : '#3b82f6';
    const fillColor = chartMetric === 'solar' ? 'url(#solarGradient)' : chartMetric === 'wind' ? 'url(#windGradient)' : 'url(#waterGradient)';


    useEffect(() => {
        const handleOmniUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.type === 'AUTO_UNDERWRITE') {
                const newAsset = {
                    id: 'extra-' + Date.now(),
                    name: detail.title,
                    type: 'ENERGY_ZONE',
                    value: '1,250,000',
                    simulated: true
                };
                setExtraAssets(prev => [newAsset, ...prev]);
            }
        };
        window.addEventListener('sovereign-omni-update', handleOmniUpdate);
        return () => window.removeEventListener('sovereign-omni-update', handleOmniUpdate);
    }, []);

    const combinedAssets = [...extraAssets, ...liveAssets];

    const [activeTab, setActiveTab] = useState<'awareness' | 'rwa' | 'institutions' | 'healing'>('awareness');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleAction = async (actionId: string, params: any = {}) => {
        setIsProcessing(actionId);
        try {
            await fetch('/api/market/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: actionId, ...params })
            });
            refetchAssets();
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(null);
        }
    };

    const envData = intelligence
        ?.filter((i: any) => i.category === 'ENVIRONMENTAL')
        ?.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const envPayload = envData ? JSON.parse(envData.payload) : null;

    return (
        <div className="space-y-4 text-zinc-100">
            {activeHazards && activeHazards.length > 0 && (
                <div 
                    onClick={() => setActiveTab('healing')}
                    className="p-3 bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-lg cursor-pointer hover:bg-red-500/15 transition-all group relative overflow-hidden animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                >
                    {/* Pulsing hazard background circle */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-red-500/15 animate-ping pointer-events-none" />
                    
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <div className="flex-1 min-w-0">
                            <span className="text-[8px] text-red-400 font-mono font-black uppercase tracking-widest block">OSIRIS CRITICAL HAZARD ALERT</span>
                            <span className="text-[10px] font-bold text-white uppercase block mt-0.5 truncate">
                                {activeHazards.length} threat vectors detected near Citadels
                            </span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </div>
            )}

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 border border-white/5 rounded-lg">
                <button
                    onClick={() => handleAction('initialize_scan')}
                    disabled={isProcessing !== null}
                    className="py-1 px-1 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 rounded transition-all text-[8px] font-black uppercase text-zinc-400 hover:text-white disabled:opacity-50"
                >
                    <Activity className="w-3 h-3 text-amber-400" />
                    <span>Global Scan</span>
                </button>
                <button
                    onClick={() => activateFocusPanel('MINER_NODE')}
                    className="py-1 px-1 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 rounded transition-all text-[8px] font-black uppercase text-zinc-400 hover:text-white"
                >
                    <Server className="w-3 h-3 text-amber-400" />
                    <span>Miner Node</span>
                </button>
                <button
                    onClick={() => activateFocusPanel('MARKETPLACE')}
                    className="py-1 px-1 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 rounded transition-all text-[8px] font-black uppercase text-zinc-400 hover:text-white"
                >
                    <Box className="w-3 h-3 text-amber-400" />
                    <span>Marketplace</span>
                </button>
                <button
                    onClick={() => handleAction('sync_substrate')}
                    disabled={isProcessing !== null}
                    className="py-1 px-1 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 rounded transition-all text-[8px] font-black uppercase text-zinc-400 hover:text-white disabled:opacity-50"
                >
                    <Cpu className="w-3 h-3 text-amber-400" />
                    <span>Sync Substrate</span>
                </button>
                <button
                    onClick={() => activateFocusPanel('SWEAT_CLAIM')}
                    className="py-1 px-1 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 rounded transition-all text-[8px] font-black uppercase text-zinc-400 hover:text-white"
                >
                    <PlusCircle className="w-3 h-3 text-purple-400" />
                    <span>Land Claim</span>
                </button>
                <button
                    onClick={() => activateFocusPanel('BIOLOGICAL_POW')}
                    className="py-1 px-1 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 rounded transition-all text-[8px] font-black uppercase text-amber-400 hover:text-amber-300"
                >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>PoW Oracle</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg border border-white/10 p-0.5 bg-black/40">
                {(['awareness', 'rwa', 'institutions', 'healing'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-md transition-all ${
                            activeTab === tab ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-white'
                        }`}
                    >
                        {tab === 'awareness' ? 'Zoning' : tab === 'rwa' ? 'RWA' : tab === 'institutions' ? 'Entity' : 'Healing'}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'awareness' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <MapIcon className="w-3 h-3 text-amber-400" /> Territorial Zoning
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                        <CircularGauge value={Math.round(poi.metrics?.solar ?? 85)} label="Solar Potential" color="#f59e0b" unit="MW" icon={Zap} />
                        <CircularGauge value={Math.round(poi.metrics?.wind ?? 45)} label="Wind Yield" color="#06b6d4" unit="M/S" icon={Wind} />
                        <CircularGauge value={Math.round(poi.metrics?.water ?? 92)} label="Water Rights" color="#3b82f6" unit="L/S" icon={Droplet} />
                        <CircularGauge value={Math.round(poi.metrics?.zoning ?? 75)} label="Zoning Status" color="#10b981" unit="PCT" icon={MapIcon} />
                    </div>

                    <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-2 relative">
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Seasonal Yield Projections</span>
                            <div className="flex gap-1.5 select-none z-10">
                                {(['solar', 'wind', 'water'] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setChartMetric(m)}
                                        className={`px-1.5 py-0.5 rounded text-[7px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                            chartMetric === m
                                                ? m === 'solar' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : m === 'wind' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                : 'bg-black/50 text-zinc-500 border-transparent hover:text-zinc-300'
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SVG Chart area */}
                        <div className="relative h-[110px] w-full mt-1.5">
                            {/* Floating tooltip hover stats overlay */}
                            <div className="absolute top-1 left-1.5 px-2 py-0.5 bg-black/70 border border-white/5 rounded text-[8px] font-mono select-none pointer-events-none">
                                {hoveredPoint ? (
                                    <span className="flex items-center gap-1.5 text-zinc-300 uppercase">
                                        <span className="font-bold">{chartPoints[hoveredPoint.idx].name}:</span>
                                        <span className={chartMetric === 'solar' ? 'text-amber-400' : chartMetric === 'wind' ? 'text-amber-400' : 'text-blue-400'}>
                                            {hoveredPoint.val.toFixed(1)}%
                                        </span>
                                    </span>
                                ) : (
                                    <span className="text-zinc-500 uppercase">Hover chart columns</span>
                                )}
                            </div>

                            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                                    </linearGradient>
                                    <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                                    </linearGradient>
                                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Horizontal grid lines */}
                                {[0, 25, 50, 75, 100].map((gridVal) => {
                                    const y = paddingTop + usableHeight - (gridVal / 100) * usableHeight;
                                    return (
                                        <g key={gridVal}>
                                            <line
                                                x1={paddingLeft}
                                                y1={y}
                                                x2={width - paddingRight}
                                                y2={y}
                                                stroke="#ffffff"
                                                strokeOpacity="0.03"
                                                strokeWidth="1"
                                            />
                                            <text
                                                x={paddingLeft - 4}
                                                y={y + 2}
                                                fill="#71717a"
                                                fontSize="5.5"
                                                fontFamily="monospace"
                                                textAnchor="end"
                                            >
                                                {gridVal}%
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Vertical guidelines */}
                                {points.map((pt) => (
                                    <line
                                        key={pt.idx}
                                        x1={pt.x}
                                        y1={paddingTop}
                                        x2={pt.x}
                                        y2={paddingTop + usableHeight}
                                        stroke="#ffffff"
                                        strokeOpacity="0.015"
                                        strokeWidth="1"
                                    />
                                ))}

                                {/* Render Area Path */}
                                {areaPath && (
                                    <path
                                        d={areaPath}
                                        fill={fillColor}
                                        className="transition-all duration-500 ease-in-out"
                                    />
                                )}

                                {/* Render Line Path */}
                                {linePath && (
                                    <path
                                        d={linePath}
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="transition-all duration-500 ease-in-out"
                                    />
                                )}

                                {/* Chart nodes */}
                                {points.map((pt) => {
                                    const isHovered = hoveredPoint?.idx === pt.idx;
                                    return (
                                        <circle
                                            key={pt.idx}
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={isHovered ? 4 : 2}
                                            fill={isHovered ? '#000000' : strokeColor}
                                            stroke={strokeColor}
                                            strokeWidth={isHovered ? 2 : 0}
                                            className="transition-all duration-300"
                                        />
                                    );
                                })}

                                {/* Hover guideline vertical dashed */}
                                {hoveredPoint && (
                                    <line
                                        x1={hoveredPoint.x}
                                        y1={paddingTop}
                                        x2={hoveredPoint.x}
                                        y2={paddingTop + usableHeight}
                                        stroke="#ffffff"
                                        strokeOpacity="0.15"
                                        strokeDasharray="2,2"
                                        strokeWidth="1"
                                    />
                                )}

                                {/* X-axis Month labels */}
                                {points.map((pt) => (
                                    <text
                                        key={pt.idx}
                                        x={pt.x}
                                        y={paddingTop + usableHeight + 11}
                                        fill={hoveredPoint?.idx === pt.idx ? '#ffffff' : '#71717a'}
                                        fontSize="6"
                                        fontFamily="monospace"
                                        textAnchor="middle"
                                        className="transition-colors duration-300 font-bold"
                                    >
                                        {pt.name}
                                    </text>
                                ))}

                                {/* Transparent hover catcher rects over columns */}
                                {points.map((pt) => {
                                    const colWidth = usableWidth / 11;
                                    const hoverX = pt.x - colWidth / 2;
                                    return (
                                        <rect
                                            key={pt.idx}
                                            x={hoverX}
                                            y={paddingTop}
                                            width={colWidth}
                                            height={usableHeight + 15}
                                            fill="transparent"
                                            className="cursor-crosshair"
                                            onMouseEnter={() => setHoveredPoint({ idx: pt.idx, val: pt.val, x: pt.x, y: pt.y })}
                                            onMouseLeave={() => setHoveredPoint(null)}
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'rwa' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-amber-400" /> Real-World Assets
                    </p>

                    {combinedAssets.length === 0 ? (
                        <div className="p-8 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-center gap-2">
                            <Database className="w-6 h-6 text-zinc-700" />
                            <div>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase block">No Claims Underwritten</span>
                                <span className="text-[8px] text-zinc-600 uppercase block mt-0.5">Submit new real-world claims to docket.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {combinedAssets.map((asset) => {
                                const displayType = asset.type || asset.assetType || 'Claim';
                                const displayName = asset.name || asset.title || 'Sovereign Claim';
                                const isStatusActive = (asset.status || '').toUpperCase() === 'ACTUALIZED' || (asset.status || '').toUpperCase() === 'ACTIVE';
                                const rawVal = asset.value || asset.price || '500,000';
                                const displayVal = typeof rawVal === 'number' ? rawVal.toLocaleString() : String(rawVal).replace(/^\$/, '');

                                return (
                                    <div key={asset.id} className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-2 hover:border-amber-500/20 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[7px] text-zinc-500 font-bold uppercase">{displayType}</span>
                                                <h4 className="text-[10px] font-black uppercase text-white truncate max-w-[200px]">{displayName}</h4>
                                            </div>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase font-mono ${
                                                isStatusActive 
                                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                                {asset.status || 'SIMULATED'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[9px] font-mono">
                                            <span className="text-zinc-500">Valuation:</span>
                                            <span className="text-zinc-300 font-bold">${displayVal}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleAction('actualize_claim', { assetId: asset.id })}
                                            disabled={isProcessing !== null}
                                            className="w-full py-1.5 bg-zinc-900 hover:bg-amber-600 hover:text-black text-[8px] font-black uppercase tracking-widest rounded transition-all text-zinc-400 disabled:opacity-50"
                                        >
                                            {isProcessing === 'actualize_claim' ? 'Syncing...' : 'Actualize Claim'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'institutions' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-amber-400" /> Institutional Mappings
                    </p>

                    {institutions && institutions.length > 0 ? institutions.map((org: any, idx: number) => (
                        <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[7px] text-zinc-600 font-bold uppercase">{org.type || 'ORG'}</span>
                                    <h4 className="text-[10px] font-black uppercase text-zinc-200 leading-tight">{org.name}</h4>
                                </div>
                                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase font-mono ${
                                    org.status === 'ACTUALIZED' || org.status === 'ACTIVE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>{org.status || 'STAKED'}</span>
                            </div>
                            <div className="flex justify-between items-end text-[8px]">
                                <div>
                                    <span className="text-zinc-500 block">Reputation Stake</span>
                                    <span className="font-mono text-amber-400 font-bold">{org.stake || '0 UVT'}</span>
                                </div>
                                <button className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded text-[7px] font-black uppercase tracking-wider transition-colors">
                                    Charter
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-4 text-center text-zinc-500 text-[9px] uppercase tracking-widest border border-white/5 border-dashed rounded">
                            No Mapped Entities Found
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'healing' && (
                <div className="space-y-3">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Droplet className="w-3 h-3 text-amber-400" /> Planetary Telemetry
                    </p>

                    {envPayload ? (
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-black/40 border border-white/5 rounded-lg text-center space-y-1">
                                <Wind className="w-3.5 h-3.5 text-zinc-500 mx-auto" />
                                <span className="text-[7px] text-zinc-500 uppercase font-bold block">Wind</span>
                                <span className="text-xs font-black font-mono text-white block">{envPayload.wind_speed_10m} <span className="text-[7px] text-zinc-600">km/h</span></span>
                            </div>
                            <div className="p-2 bg-black/40 border border-white/5 rounded-lg text-center space-y-1">
                                <Zap className="w-3.5 h-3.5 text-zinc-500 mx-auto" />
                                <span className="text-[7px] text-zinc-500 uppercase font-bold block">Temp</span>
                                <span className="text-xs font-black font-mono text-white block">{envPayload.temperature_2m}°C</span>
                            </div>
                            <div className="p-2 bg-black/40 border border-white/5 rounded-lg text-center space-y-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 mx-auto" />
                                <span className="text-[7px] text-zinc-500 uppercase font-bold block">Solar</span>
                                <span className="text-xs font-black font-mono text-white block">{envPayload.shortwave_radiation} <span className="text-[7px] text-zinc-600">W/m²</span></span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-[9px] text-zinc-600 uppercase font-bold tracking-widest">
                            Awaiting Telemetry Packet...
                        </div>
                    )}

                    {/* Active Osiris Hazards Panel */}
                    {activeHazards && activeHazards.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-red-500/20 pb-1 mt-1">
                                <span className="text-[8px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 animate-pulse" /> Active Osiris Hazard Threats
                                </span>
                                <span className="text-[7px] font-mono bg-red-500/20 text-red-400 font-black px-1 rounded-sm">{activeHazards.length} SECTOR WARNINGS</span>
                            </div>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {activeHazards.map((haz, idx) => {
                                    const isCritical = haz.severity?.toUpperCase() === 'CRITICAL';
                                    const themeColor = isCritical ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5';
                                    const badgeColor = isCritical ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-amber-500/20 text-amber-400 border-amber-500/20';
                                    const badgeText = isCritical ? 'CRITICAL' : 'WARNING';

                                    return (
                                        <div key={haz.id || idx} className={`p-2.5 border rounded-lg space-y-1.5 transition-all hover:bg-black/60 ${themeColor}`}>
                                            <div className="flex justify-between items-start gap-1">
                                                <div>
                                                    <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider">{haz.type}</span>
                                                    <h4 className="text-[9px] font-black uppercase text-zinc-100 leading-snug">{haz.title}</h4>
                                                </div>
                                                <span className={`text-[6.5px] font-black px-1 py-0.5 rounded border tracking-wider font-mono ${badgeColor}`}>
                                                    {badgeText}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-1.5 text-[8px] font-mono text-zinc-400">
                                                <div className="p-1 bg-black/30 border border-white/5 rounded">
                                                    <span className="text-zinc-500 block text-[6px] uppercase tracking-wider">Distance</span>
                                                    <span className="text-zinc-200 font-bold">{haz.distanceKm.toFixed(2)} km</span>
                                                </div>
                                                <div className="p-1 bg-black/30 border border-white/5 rounded">
                                                    <span className="text-zinc-500 block text-[6px] uppercase tracking-wider">Bearing</span>
                                                    <span className="text-zinc-200 font-bold">{haz.bearingDegrees.toFixed(1)}°</span>
                                                </div>
                                            </div>

                                            <div className="text-[7.5px] font-mono text-zinc-500 flex items-center justify-between">
                                                <span>CITADEL PROXIMITY:</span>
                                                <span className="text-zinc-300 font-bold uppercase">{haz.citadelName}</span>
                                            </div>

                                            {haz.remediationAction && (
                                                <div className="p-1.5 bg-black/50 border border-white/5 rounded font-mono text-[7px]">
                                                    <div className="flex items-center justify-between text-[6px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                                                        <span>Remediation Guideline</span>
                                                        <span className="flex items-center gap-0.5 text-amber-400 animate-pulse font-black">
                                                            <span className="w-1 h-1 rounded-full bg-amber-400" /> ACTIVE
                                                        </span>
                                                    </div>
                                                    <code className="text-amber-400/90 break-all select-all font-bold">
                                                        {haz.remediationAction}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-1.5">
                        <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wider block">Carbon Sequestration Node</span>
                        <div className="flex justify-between items-baseline font-mono">
                            <span className="text-zinc-200 text-xs font-bold">428.4 PPM</span>
                            <span className="text-[7px] text-amber-500">-0.2% Daily Shift</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
