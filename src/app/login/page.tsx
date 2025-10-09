
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useFirestore } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
} from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, User } from 'firebase/auth';
import { createCitizenProfile } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck, UserCheck, Wallet, Loader2 } from 'lucide-react';

const TOTAL_SIGNUP_STEPS = 4;

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  const [signupStep, setSignupStep] = useState(1);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSignupComplete, setIsSignupComplete] = useState(false);

  const progress = (signupStep / TOTAL_SIGNUP_STEPS) * 100;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    initiateEmailSignIn(auth, loginEmail, loginPassword);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsSigningUp(true);
    // This function will now only be responsible for calling firebase
    initiateEmailSignUp(auth, signupEmail, signupPassword);
  };

  const handleNextStep = () => setSignupStep(prev => Math.min(prev + 1, TOTAL_SIGNUP_STEPS));
  const handlePrevStep = () => setSignupStep(prev => Math.max(prev - 1, 1));

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
        if (user && !user.isAnonymous) {
            // This is the key change. We check if `isSigningUp` flag is true,
            // which means this auth change came from our sign-up form.
            if (isSigningUp) {
                const citizenRef = doc(firestore, 'citizens', user.uid);
                const newCitizen = {
                    id: user.uid,
                    decentralizedId: `did:prmth:${user.uid}`,
                    reputationScore: 100, // Starting reputation
                    contributionScore: 0,
                    personhoodScore: 1,
                    skills: ['Founding Member'],
                };
                createCitizenProfile(citizenRef, newCitizen);
                
                toast({
                    title: 'Welcome to Promethea!',
                    description: 'Your Passport has been created. You can now access all features.',
                });
                setIsSignupComplete(true);
                // We no longer redirect here. The UI will update to show completion.
            } else {
                 // This is a standard login
                 toast({
                    title: 'Login Successful!',
                    description: 'Welcome back.',
                  });
                  router.push('/dashboard');
            }
            // Reset the flag
            setIsSigningUp(false);
        }
    });

    return () => unsubscribe();
  }, [auth, firestore, router, toast, isSigningUp]);


  const renderSignupStep = () => {
    if (isSignupComplete) {
        return (
            <CardContent className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-green-500/10">
                        <UserCheck className="w-10 h-10 text-green-500" />
                    </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Passport Created!</h3>
                <p className="text-muted-foreground mb-4">You are now a citizen of Promethea. Welcome to the network state.</p>
                <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </CardContent>
        );
    }

    if (isSigningUp) {
        return (
             <CardContent className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Creating Your Passport...</h3>
                <p className="text-muted-foreground">Please wait while we establish your self-sovereign identity on the network.</p>
                <Progress value={isSignupComplete ? 100 : 50} className="mt-4" />
            </CardContent>
        );
    }


    switch(signupStep) {
        case 1:
            return (
                <CardContent className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <UserCheck className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">The Promethean Passport</h3>
                    <p className="text-muted-foreground">You are about to create a Self-Sovereign Identity. This is more than a login; it's your verified, portable identity for the new digital economy. You will own and control it, always.</p>
                </CardContent>
            );
        case 2:
            return (
                <CardContent className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <Wallet className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">The Bridge to Web3</h3>
                    <p className="text-muted-foreground">Today, you'll create a secure account with an email and password. In the future, this will be upgraded to a crypto wallet (like MetaMask). This ensures your identity is truly yours, secured by a blockchain, not by us.</p>
                </CardContent>
            );
        case 3:
             return (
                 <CardContent className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Your Data, Your Property</h3>
                    <p className="text-muted-foreground">Your personal data will be stored decentrally on your own terms. You'll be able to explicitly consent to—and be paid for—any use of your data, turning it from a liability into an asset you control.</p>
                </CardContent>
            );
        case 4:
            return (
                <CardContent>
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <KeyRound className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-center">Create Your Account</h3>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                            id="signup-email"
                            type="email"
                            placeholder="citizen@promethea.network"
                            required
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                        />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                            id="signup-password"
                            type="password"
                            required
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                        />
                        </div>
                    </form>
                </CardContent>
            );
        default:
            return null;
    }
  }

  const renderSignupFooter = () => {
    if(isSigningUp || isSignupComplete) return null;

    return (
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevStep} disabled={signupStep === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            {signupStep < TOTAL_SIGNUP_STEPS ? (
                <Button onClick={handleNextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button onClick={handleSignup} type="submit">
                    Create Passport
                </Button>
            )}
        </CardFooter>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your Promethean Passport.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="citizen@promethea.network"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Create Your Passport</CardTitle>
              <CardDescription>
                Join the Promethea Network State by creating your Self-Sovereign Identity.
              </CardDescription>
              <Progress value={progress} className="mt-2" />
            </CardHeader>
            
            {renderSignupStep()}
            {renderSignupFooter()}
            
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
