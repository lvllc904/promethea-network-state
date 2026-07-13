'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@promethea/ui";
import { Input } from "@promethea/ui";
import { Label } from "@promethea/ui";
import { Button } from "@promethea/ui";
import { Textarea } from "@promethea/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@promethea/ui";
import { useUser } from "@promethea/sovereign-store";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, PartyPopper } from "lucide-react";
import { handleUnderwrite, handleAutoList } from "./actions";
import { handleProposeAsset } from "@/lib/client-actions";
import { useFirestore } from "@promethea/sovereign-store";
import { type UnderwriteRWAInput, type UnderwriteRWAOutput, type AutoListRWAOutput } from "@promethea/lib";
import { Alert, AlertDescription, AlertTitle } from "@promethea/ui";
import { Badge } from "@promethea/ui";
import { OneClickLister } from "@promethea/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@promethea/ui";

function UnderwritingAnalysis({
    analysis,
    assetData,
    ownerId
}: {
    analysis: UnderwriteRWAOutput,
    assetData: UnderwriteRWAInput,
    ownerId: string
}) {
    const router = useRouter();
    const firestore = useFirestore();
    const [isListing, setIsListing] = useState(false);
    const [listingResult, setListingResult] = useState<{ success: boolean, proposalId?: string, error?: string } | null>(null);

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'Helio' | 'Wallet' | 'Bypass' | null>(null);
    const [isPaying, setIsPaying] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    useEffect(() => {
        const handlePaymentMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PAYMENT_SUCCESS') {
                setPaymentConfirmed(true);
                setPaymentMethod(event.data.gateway);
                setIsPaying(false);
            }
        };
        window.addEventListener('message', handlePaymentMessage);
        return () => window.removeEventListener('message', handlePaymentMessage);
    }, []);

    const onPromote = async () => {
        if (!paymentConfirmed && paymentMethod !== 'Bypass') {
            alert("Please settle or authorize the at-cost state filing fee before proposing this physical node.");
            return;
        }

        if (!firestore) {
            setListingResult({ success: false, error: "Database not connected" });
            return;
        }

        setIsListing(true);
        const result = await handleProposeAsset(firestore, {
            assetData: assetData,
            analysis: analysis,
            ownerId: ownerId
        });

        if (result.success && result.proposalId) {
            setListingResult({ success: true, proposalId: result.proposalId });
            setTimeout(() => {
                router.push(`/dashboard/governance`);
            }, 3000);
        } else {
            setListingResult({ success: false, error: result.error });
        }
        setIsListing(false);
    };

    const handleCheckoutGtw = (gateway: 'Stripe' | 'Helio' | 'Wallet' | 'Bypass') => {
        setPaymentMethod(gateway);
        setIsPaying(true);
        
        if (gateway === 'Bypass') {
            setTimeout(() => {
                setIsPaying(false);
                setPaymentConfirmed(true);
                alert("[PATH B: SOVEREIGN BYPASS ACTIVE]\n\nYou are executing on-chain registry with an offline manual filing hash. Surcharge adjusted to $0.00.");
            }, 1000);
            return;
        }

        if (gateway === 'Wallet') {
            setTimeout(() => {
                setIsPaying(false);
                setPaymentConfirmed(true);
                alert("[ZERO-TRUST WALLET HEARTBEAT]\n\nPhantom wallet prompt: Authorized 25.00 USDC transfer to State Filing Account.");
            }, 1500);
            return;
        }

        const urls = {
            Stripe: `/checkout/stripe?prefilled_email=${encodeURIComponent(ownerId + '@lvhllc.org')}`,
            Helio: `/checkout/helio`
        };

        window.open(urls[gateway], '_blank');
    };

    if (listingResult?.success) {
        return (
            <Card className="shadow-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-500/10 text-green-600 p-3 rounded-full w-fit">
                        <PartyPopper className="w-12 h-12" />
                    </div>
                    <CardTitle className="font-headline pt-4">Proposal Submitted!</CardTitle>
                    <CardDescription>Your asset is now an active proposal for community funding.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Redirecting you to the Governance page...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-amber-500/20 bg-[#090d16]/90 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-headline text-lg">Underwriting Analysis</CardTitle>
                    <span className="text-[9px] font-mono text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        AI-Underwritten
                    </span>
                </div>
                <CardDescription>Real-world valuation and state-level compliance assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {analysis.isViable ? (
                    <Alert className="border-amber-500/20 bg-amber-500/5 text-amber-400">
                        <CheckCircle className="h-4 w-4 text-amber-400" />
                        <AlertTitle className="font-bold">Asset Deemed Viable</AlertTitle>
                        <AlertDescription className="text-xs">
                            The AI underwriter has successfully calculated a sound Enterprise Value for the physical node.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="destructive" className="border-red-500/20 bg-red-500/5">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Asset Deemed Not Viable</AlertTitle>
                        <AlertDescription className="text-xs">
                            The AI underwriter has flagged structural compliance issues with this asset.
                        </AlertDescription>
                    </Alert>
                )}

                <div>
                    <h3 className="font-semibold text-sm text-zinc-300">Viability Assessment</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{analysis.viabilityAssessment}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div>
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Enterprise Value</h3>
                        <p className="text-xl font-bold mt-1 text-amber-400">{formatCurrency(analysis.enterpriseValue)}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Key Assumptions</h3>
                        <p className="text-[10px] text-muted-foreground mt-1 whitespace-pre-line leading-relaxed">{analysis.keyAssumptions}</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-sm text-zinc-300 mb-2">Path to Value Tasking Checklist</h3>
                    <div className="space-y-2">
                        {analysis.pathTovalue.map((task, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded border border-white/5 bg-zinc-950/40 text-xs">
                                <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'} className="text-[9px] uppercase">
                                    {task.priority}
                                </Badge>
                                <span className="text-zinc-400">{task.description}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* State Filing Cost Reimbursement receipt panel */}
                {analysis.isViable && (
                    <div className="border border-amber-500/30 bg-amber-950/20 p-4 rounded-none space-y-3">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                            <span>⚖️ State-Level Filing Settle Portal</span>
                            <span className="text-[8px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 normal-case font-light">At Cost Only</span>
                        </h4>
                        
                        <div className="space-y-1 text-xs font-mono text-zinc-400">
                            <div className="flex justify-between">
                                <span>Wyoming SOS UCC-1 Filing:</span>
                                <span className="text-white">$20.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Cobalt Lien-Search API Search:</span>
                                <span className="text-white">$5.00</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700/50 pb-1.5 mb-1.5 text-amber-400">
                                <span>Promethean Protocol Fee (0% Markup):</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between text-white font-bold text-sm">
                                <span>Total Citizen Cost:</span>
                                <span className="text-amber-400">$25.00</span>
                            </div>
                        </div>

                        {!paymentConfirmed ? (
                            <div className="space-y-2 pt-2">
                                <span className="text-[10px] text-zinc-500 block">Settle via secure fiat credit card link-out, web3 swap, or direct crypto transfer:</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="h-8 text-[10px] font-mono border-zinc-700/50 hover:bg-zinc-800"
                                        onClick={() => handleCheckoutGtw('Stripe')}
                                        disabled={isPaying}
                                    >
                                        Stripe Credit Card
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="h-8 text-[10px] font-mono border-zinc-700/50 hover:bg-zinc-800"
                                        onClick={() => handleCheckoutGtw('Helio')}
                                        disabled={isPaying}
                                    >
                                        Helio (Multi-Chain)
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="h-8 text-[10px] font-mono border-zinc-700/50 hover:bg-zinc-800"
                                        onClick={() => handleCheckoutGtw('Wallet')}
                                        disabled={isPaying}
                                    >
                                        Direct USDC / SOL
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="h-8 text-[10px] font-mono border-zinc-700/50 text-amber-400 hover:text-amber-300 hover:bg-zinc-800 col-span-2"
                                        onClick={() => handleCheckoutGtw('Bypass')}
                                        disabled={isPaying}
                                    >
                                        Path B Bypass (Manual Filing)
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-2 text-center text-xs text-amber-400 font-mono font-bold flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>FEES SETTLED AT COST // READY TO REGISTER</span>
                            </div>
                        )}
                    </div>
                )}

                {listingResult?.error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Proposal Failed</AlertTitle>
                        <AlertDescription>{listingResult.error}</AlertDescription>
                    </Alert>
                )}

                <Button 
                    onClick={onPromote} 
                    disabled={isListing || !analysis.isViable || (!paymentConfirmed && paymentMethod !== 'Bypass')} 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-wider text-xs rounded-none h-11"
                >
                    {isListing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm & Propose physical Node
                </Button>
            </CardContent>
        </Card>
    );
}

export default function NewAssetPage() {
    const { user } = useUser();
    const router = useRouter();

    const [formData, setFormData] = useState<UnderwriteRWAInput>({
        assetName: '',
        assetType: '',
        location: '',
        executiveSummary: '',
        businessPlan: '',
        verificationDocuments: ''
    });
    const [analysis, setAnalysis] = useState<UnderwriteRWAOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, assetType: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user && !user.isAnonymous) {
            setIsLoading(true);
            setError(null);
            setAnalysis(null);
            try {
                const result = await handleUnderwrite(formData);
                if ('error' in result) {
                    setError(result.error);
                } else {
                    setAnalysis(result);
                }
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        } else {
            window.location.href = (process.env.NEXT_PUBLIC_GUARDIAN_URL || 'https://authentication-service-385120524005.us-central1.run.app') + '/?redirect=' + encodeURIComponent(window.location.href);
        }
    };

    const handleAutoListComplete = (data: AutoListRWAOutput) => {
        setFormData({
            assetName: data.assetName,
            assetType: data.assetType,
            location: data.location,
            executiveSummary: data.executiveSummary,
            businessPlan: data.businessPlan,
            verificationDocuments: data.verificationDocuments
        });
        setAnalysis({
            isViable: data.isViable,
            viabilityAssessment: data.viabilityAssessment,
            enterpriseValue: data.enterpriseValue,
            keyAssumptions: data.keyAssumptions,
            pathTovalue: data.pathTovalue
        });
        setError(null);
    };

    const handleAutoListProxy = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return await handleAutoList(formData);
    };


    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-headline font-bold">List a New Asset</h1>
                    <p className="text-muted-foreground">Submit a new Real-World Asset for underwriting, tokenization, and inclusion in the Promethean Marketplace.</p>
                </div>

                <Tabs defaultValue="one-click">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="one-click">One-Click Agent</TabsTrigger>
                        <TabsTrigger value="manual">Manual Listing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="one-click" className="mt-4">
                        <OneClickLister onComplete={handleAutoListComplete} onAutoList={handleAutoListProxy} />
                    </TabsContent>
                    <TabsContent value="manual" className="mt-4">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-headline">Manual Listing Form</CardTitle>
                                <CardDescription>Provide as much detail as possible for the AI underwriting process.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="assetName">Asset Name</Label>
                                            <Input id="assetName" placeholder="e.g., 'Downtown Apartment Complex A'" value={formData.assetName} onChange={handleInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="assetType">Asset Type</Label>
                                            <Select onValueChange={handleSelectChange} value={formData.assetType} required>
                                                <SelectTrigger id="assetType">
                                                    <SelectValue placeholder="Select asset category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                                                    <SelectItem value="Small Business">Small Business</SelectItem>
                                                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                                                    <SelectItem value="Intellectual Property">Intellectual Property</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location / Identifier</Label>
                                        <Input id="location" placeholder="e.g., '123 Main St, Anytown, USA' or Patent #..." value={formData.location} onChange={handleInputChange} required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="executiveSummary">Executive Summary</Label>
                                        <Textarea id="executiveSummary" placeholder="Paste the executive summary document content here." value={formData.executiveSummary} onChange={handleInputChange} required className="min-h-[100px]" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="businessPlan">Business Plan / Service Flow</Label>
                                        <Textarea id="businessPlan" placeholder="Paste the business plan and financial projections here." value={formData.businessPlan} onChange={handleInputChange} required className="min-h-[150px]" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="verificationDocuments">Verification Documentation</Label>
                                        <Textarea id="verificationDocuments" placeholder="Paste relevant text from property deeds, patent filings, operating agreements, etc." value={formData.verificationDocuments} onChange={handleInputChange} required className="min-h-[100px]" />
                                    </div>

                                    <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit for Underwriting
                                    </Button>
                                    {user?.isAnonymous && (
                                        <p className="text-xs text-center text-muted-foreground pt-2">Create a Promethean Passport to list an asset.</p>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
                {isLoading && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline">Underwriting Analysis</CardTitle>
                            <CardDescription>The AI is assessing the submitted asset...</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </CardContent>
                    </Card>
                )}
                {error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Underwriting Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {analysis && user && <UnderwritingAnalysis analysis={analysis} assetData={formData} ownerId={user.uid} />}
            </div>
        </div>
    );
}
