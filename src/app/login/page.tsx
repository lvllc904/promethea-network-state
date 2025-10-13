
'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, Copy, ShieldAlert, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ethers } from 'ethers';

function LoginPageSuspenseFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
}

function LoginPageContent() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupStep, setSignupStep] = useState(1);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [generatedWallet, setGeneratedWallet] = useState<{ address: string; privateKey: string } | null>(null);
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoggingIn(true);
    
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast({
        title: 'Login Successful!',
        description: 'Redirecting you to the dashboard.',
      });
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGenerateDid = (e: React.FormEvent) => {
    e.preventDefault();
    const wallet = ethers.Wallet.createRandom();
    const newWallet = { address: wallet.address, privateKey: wallet.privateKey };
    setGeneratedWallet(newWallet);
    // Securely store the private key in localStorage
    localStorage.setItem(`promethea_pk_${wallet.address}`, wallet.privateKey);
    setSignupStep(2);
  };

  const handleDownloadKeystore = async () => {
    if (!generatedWallet || !signupPassword) return;
    setIsSigningUp(true); // Reuse spinner for encryption process
    try {
        const wallet = new ethers.Wallet(generatedWallet.privateKey);
        const keystoreJson = await wallet.encrypt(signupPassword);

        const blob = new Blob([keystoreJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `UTC--${new Date().toISOString().replace(/:/g, '-')}--${generatedWallet.address}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
         toast({
            title: "Keystore Saved",
            description: "Your encrypted backup file has been downloaded.",
        });
    } catch (error) {
        console.error("Failed to create keystore:", error);
        toast({
            variant: "destructive",
            title: "Backup Failed",
            description: "Could not create your encrypted backup file.",
        });
    } finally {
        setIsSigningUp(false);
    }
  };


  const handleCreatePassport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !generatedWallet) return;
    setIsSigningUp(true);

    try {
      await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      // Pass the generated DID in the URL to the provider. This is a temporary mechanism.
      const redirectWithDid = `${redirectUrl}?did=${generatedWallet.address}`;

      toast({
          title: 'Welcome to Promethea!',
          description: 'Your account is being created. You will be redirected shortly.',
      });
      router.push(redirectWithDid);
    } catch (error: any) {
        console.error("Signup failed:", error);
        toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: error.message || "Could not create your account. Please try again.",
        });
    } finally {
        setIsSigningUp(false);
    }
  };
  
  const handleLogout = async () => {
    if (!auth) return;
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message || "Could not log you out. Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  if (isUserLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
  }

  if (user && !user.isAnonymous) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Card className="w-full max-w-md">
                 <CardHeader>
                    <CardTitle className="font-headline text-2xl">Logout</CardTitle>
                    <CardDescription>
                        You are currently logged in as {user.email}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>Click the button below to securely log out of your account.</p>
                     <Button onClick={handleLogout} disabled={isLoggingOut} className="w-full" variant="destructive">
                        {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                        Logout
                    </Button>
                </CardContent>
                 <CardFooter className="justify-center">
                    <Button variant="link" asChild>
                        <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Mint Passport</TabsTrigger>
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
              {!auth ? (
                <Alert variant="destructive">
                  <AlertTitle>Authentication Service Unavailable</AlertTitle>
                  <AlertDescription>
                    Login and Sign-up are currently disabled.
                  </AlertDescription>
                </Alert>
              ) : (
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
                  <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Login
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="link" asChild>
                <Link href="/">Return to Promethea</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
             {signupStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Create Your Passport</CardTitle>
                  <CardDescription>
                    Step 1: Create your secure login credentials.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    {!auth ? (
                      <Alert variant="destructive">
                        <AlertTitle>Authentication Service Unavailable</AlertTitle>
                        <AlertDescription>
                          Minting is currently disabled.
                        </AlertDescription>
                      </Alert>
                    ) : (
                    <form onSubmit={handleGenerateDid} className="space-y-4">
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
                      <Button type="submit" className="w-full">
                          Generate Decentralized ID (DID)
                      </Button>
                    </form>
                  )}
                </CardContent>
              </>
            )}

            {signupStep === 2 && generatedWallet && (
              <>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Identity Genesis</CardTitle>
                  <CardDescription>
                    Step 2: Secure your Self-Sovereign Identity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>CRITICAL: Back Up Your Identity</AlertTitle>
                        <AlertDescription>
                            Your identity is stored on this device. To prevent permanent loss, download your encrypted Keystore file. This is the ONLY way to recover your account.
                        </AlertDescription>
                    </Alert>
                    <div>
                      <Label htmlFor="did-address">Your Decentralized ID (DID)</Label>
                      <div className="flex items-center gap-2">
                        <Input id="did-address" readOnly value={`did:prmth:${generatedWallet.address}`} className="font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(`did:prmth:${generatedWallet.address}`)}><Copy className="h-4 w-4"/></Button>
                      </div>
                    </div>
                    
                    <Button onClick={handleDownloadKeystore} className="w-full" variant="secondary" disabled={isSigningUp}>
                        <Download className="mr-2 h-4 w-4"/>
                        Download Keystore Backup
                    </Button>
                    

                    <form onSubmit={handleCreatePassport}>
                      <Button type="submit" className="w-full" disabled={isSigningUp}>
                        {isSigningUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Passport & Login
                      </Button>
                    </form>
                </CardContent>
              </>
            )}

            <CardFooter className="justify-center">
              <Button variant="link" asChild>
                  <Link href="/">Return to Promethea</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function LoginPage() {
  return (
    <FirebaseClientProvider>
      <Suspense fallback={<LoginPageSuspenseFallback />}>
        <LoginPageContent />
      </Suspense>
    </FirebaseClientProvider>
  );
}

    