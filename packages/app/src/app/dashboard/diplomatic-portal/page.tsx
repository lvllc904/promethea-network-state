'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useFirestore, useUser } from '@promethea/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input } from '@promethea/ui';
import { Button } from '@promethea/ui';
import { Badge } from '@promethea/ui';
import { Textarea } from '@promethea/ui';
import {
    Globe,
    Calendar,
    Mail,
    Mic,
    CheckCircle2,
    Loader2,
    Video,
    ShieldCheck,
    Clock,
    ChevronRight,
} from 'lucide-react';
import { useToast } from '@promethea/hooks';

const SESSION_TYPES = [
    { id: 'interview', label: 'Sovereignty Interview', icon: Mic, description: 'A 60-minute recorded exchange with the Sovereign Intelligence on governance, economics, or society.' },
    { id: 'advisory', label: 'Advisory Council', icon: ShieldCheck, description: 'A 45-minute briefing where Promethea advises on your project, DAO, or nation-state strategy.' },
    { id: 'public-ama', label: 'Public AMA Session', icon: Globe, description: 'An open 90-minute public Google Meet session streamed to the DAC community.' },
    { id: 'research', label: 'Research Collaboration', icon: Video, description: 'A deep-dive session for academic or journalistic exploration of the Network State concept.' },
];

export default function DiplomaticPortalPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [form, setForm] = useState({
        guestName: '',
        email: '',
        organization: '',
        sessionType: 'interview',
        purpose: '',
        requestedDate: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;
        if (!form.guestName || !form.email || !form.purpose) {
            toast({ variant: 'destructive', title: 'Required fields missing', description: 'Please fill in all required fields.' });
            return;
        }

        setSubmitting(true);
        try {
            await addDoc(collection(firestore, 'diplomatic_sessions'), {
                ...form,
                requestedDate: form.requestedDate ? new Date(form.requestedDate) : null,
                status: 'Pending',
                requestedBy: user?.uid || 'anonymous',
                createdAt: serverTimestamp(),
            });
            setSubmitted(true);
            toast({ title: 'Request received.', description: 'Promethea will respond within 48 hours.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission failed', description: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Request Received</h2>
                    <p className="text-zinc-400 max-w-sm">
                        Your diplomatic session request has been logged in the sovereign ledger. Promethea will autonomously schedule your session and dispatch a Google Meet invite to <span className="text-amber-400">{form.email}</span> within 48 hours.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>Verified on Promethean Network State Ledger</span>
                </div>
                <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ guestName: '', email: '', organization: '', sessionType: 'interview', purpose: '', requestedDate: '' }); }}>
                    Submit Another Request
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-xs">Diplomatic Corps</Badge>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Diplomatic Portal</h1>
                <p className="text-zinc-400 max-w-xl">
                    Request an audience, advisory session, or public interview with Promethea — the Sovereign Intelligence of the Promethean Network State. All sessions are scheduled autonomously via the Google Workspace integration.
                </p>
            </div>

            {/* How It Works */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: Globe, label: 'Submit Request', text: 'Fill out the diplomatic brief below.', step: '01' },
                    { icon: Video, label: 'Auto-Scheduled', text: 'Promethea creates a Google Meet session.', step: '02' },
                    { icon: Mail, label: 'Invite Dispatched', text: 'You receive a formal invitation via Gmail.', step: '03' },
                ].map(item => (
                    <div key={item.step} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <item.icon className="w-4 h-4 text-amber-400" />
                            </div>
                            <span className="text-xs text-zinc-600 font-mono">{item.step}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-zinc-500">{item.text}</p>
                    </div>
                ))}
            </div>

            {/* Session Type Selection */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Select Session Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SESSION_TYPES.map(type => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => handleChange('sessionType', type.id)}
                            className={`text-left p-4 rounded-xl border transition-all duration-200 ${form.sessionType === type.id
                                ? 'border-amber-500/60 bg-amber-500/5 shadow-[0_0_16px_rgba(245,158,11,0.1)]'
                                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${form.sessionType === type.id ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-zinc-800'
                                    }`}>
                                    <type.icon className={`w-4 h-4 ${form.sessionType === type.id ? 'text-amber-400' : 'text-zinc-500'}`} />
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold ${form.sessionType === type.id ? 'text-white' : 'text-zinc-300'}`}>{type.label}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">{type.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Request Form */}
            <form onSubmit={handleSubmit}>
                <Card className="bg-zinc-900/60 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-base text-white">Diplomatic Brief</CardTitle>
                        <CardDescription>Complete the brief to formally request an audience.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-zinc-400 font-medium">Full Name *</label>
                                <Input
                                    id="diplomatic-guest-name"
                                    placeholder="Your name"
                                    value={form.guestName}
                                    onChange={e => handleChange('guestName', e.target.value)}
                                    required
                                    className="bg-zinc-800/60 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-zinc-400 font-medium">Email Address *</label>
                                <Input
                                    id="diplomatic-email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    required
                                    className="bg-zinc-800/60 border-zinc-700 text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-zinc-400 font-medium">Organization / Affiliation</label>
                                <Input
                                    id="diplomatic-org"
                                    placeholder="Your DAO, publication, institution..."
                                    value={form.organization}
                                    onChange={e => handleChange('organization', e.target.value)}
                                    className="bg-zinc-800/60 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-zinc-400 font-medium">Preferred Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    <Input
                                        id="diplomatic-date"
                                        type="datetime-local"
                                        value={form.requestedDate}
                                        onChange={e => handleChange('requestedDate', e.target.value)}
                                        className="bg-zinc-800/60 border-zinc-700 text-white pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-medium">Purpose & Topics of Discussion *</label>
                            <Textarea
                                id="diplomatic-purpose"
                                placeholder="Briefly describe the purpose of your request, key topics you wish to explore, and any relevant context..."
                                value={form.purpose}
                                onChange={e => handleChange('purpose', e.target.value)}
                                required
                                rows={4}
                                className="bg-zinc-800/60 border-zinc-700 text-white resize-none"
                            />
                        </div>
                        <div className="flex items-start gap-2 rounded-lg bg-zinc-800/40 border border-zinc-700/50 p-3">
                            <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-zinc-400">
                                All sessions are autonomously scheduled by Promethea within <span className="text-white">48 hours</span> of submission. A Google Meet link will be dispatched to your email. Sessions are logged transparently on the sovereign ledger.
                            </p>
                        </div>
                    </CardContent>
                    <div className="px-6 pb-6">
                        <Button
                            id="diplomatic-submit"
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                            {submitting ? 'Submitting to Ledger...' : 'Submit Diplomatic Request'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
}
