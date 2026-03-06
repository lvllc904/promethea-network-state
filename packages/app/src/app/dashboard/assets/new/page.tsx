'use client';
export const dynamic = 'force-dynamic';
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@promethea/ui";
import { Input } from "@promethea/ui";
import { Label } from "@promethea/ui";
import { Button } from "@promethea/ui";
import { Textarea } from "@promethea/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@promethea/ui";
import { useUser } from "@promethea/firebase";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, PartyPopper } from "lucide-react";
import { handleUnderwrite, handleAutoList } from "./actions";
import { handleProposeAsset } from "@/lib/client-actions";
import { useFirestore } from "@promethea/firebase";
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

    const onPromote = async () => {
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
        )
    }


    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline">Underwriting Analysis</CardTitle>
                <CardDescription>The AI's assessment of the submitted asset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {analysis.isViable ? (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Asset Deemed Viable</AlertTitle>
                        <AlertDescription>
                            The AI has determined this asset is a potentially sound investment for the community.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Asset Deemed Not Viable</AlertTitle>
                        <AlertDescription>
                            The AI has flagged potential issues with this asset. See assessment for details.
                        </AlertDescription>
                    </Alert>
                )}

                <div>
                    <h3 className="font-semibold">Viability Assessment</h3>
                    <p className="text-sm text-muted-foreground">{analysis.viabilityAssessment}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Enterprise Value</h3>
                        <p className="text-2xl font-bold">{formatCurrency(analysis.enterpriseValue)}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Key Assumptions</h3>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{analysis.keyAssumptions}</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold">Path to Value</h3>
                    <div className="space-y-2 mt-2">
                        {analysis.pathTovalue.map((task, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                                <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
                                <span>{task.description}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {listingResult?.error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Proposal Failed</AlertTitle>
                        <AlertDescription>{listingResult.error}</AlertDescription>
                    </Alert>
                )}

                <Button onClick={onPromote} disabled={isListing || !analysis.isViable} className="w-full">
                    {isListing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Propose for Funding
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
            window.location.href = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001';
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
                        <OneClickLister onComplete={handleAutoListComplete} onAutoList={handleAutoList} />
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
