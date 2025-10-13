
'use client';
import { useState, Suspense, useRef } from 'react';
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
import { Loader2, LogOut, Copy, ShieldAlert, Download, Upload } from 'lucide-react';
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

  const [loginPassword, setLoginPassword] = useState('');
  const [keystoreFile, setKeystoreFile] = useState<File | null>(null);
  const keystoreInputRef = useRef<HTMLInputElement>(null);
  
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
    if (!auth || !keystoreFile) {
        toast({
            variant: "destructive",
            title: "Login Error",
            description: "Please select your keystore file and enter your password.",
        });
        return;
    }
    setIsLoggingIn(true);
    
    try {
        const keystoreJson = await keystoreFile.text();
        
        // Extract the email from the keystore filename.
        // Format: promethea-keystore--[email]--[address].json
        const parts = keystoreFile.name.split('--');
        if (parts.length < 3 || !parts[1]) {
            throw new Error("Invalid keystore filename format. Cannot extract email.");
        }
        const emailFromFilename = parts[1];
        
        // We must attempt to decrypt the wallet first to ensure the password is correct.
        await ethers.Wallet.fromEncryptedJson(keystoreJson, loginPassword);

        await signInWithEmailAndPassword(auth, emailFromFilename, loginPassword);

        toast({
            title: 'Login Successful!',
            description: 'Redirecting you to the dashboard.',
        });
        router.push(redirectUrl);

    } catch (error: any) {
      console.error(error);
      let description = "An unexpected error occurred during login. Please check the console for details.";
      if (error.message?.includes('incorrect password')) {
        description = "Incorrect password for the provided keystore file. Please try again.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        description = "No Promethean Passport is associated with this keystore. Please mint a new passport.";
      } else if (error.message?.includes("Invalid keystore filename format")) {
        description = "The keystore file has an invalid name. It may be corrupted or not a valid Promethean passport file.";
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: description,
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
        // The filename now includes the email for recovery during login
        a.download = `promethea-keystore--${signupEmail}--${generatedWallet.address}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
         toast({
            title: "Keystore Saved",
            description: "Your encrypted backup file has been downloaded. Keep it safe!",
        });
        setSignupStep(3);
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
      // createUserWithEmailAndPassword will also sign the user in.
      await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      
      // Pass the DID to the dashboard so it can be used in profile creation
      const redirectWithDid = `/dashboard?did=${generatedWallet.address}`;

      toast({
          title: 'Welcome to Promethea!',
          description: 'Your account has been created. Redirecting...',
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
              <CardTitle className="font-headline text-2xl">Login with Passport</CardTitle>
              <CardDescription>
                Upload your encrypted keystore file to access your identity.
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
                    <Label htmlFor="keystore-file">Keystore File</Label>
                    <Input
                      id="keystore-file"
                      type="file"
                      ref={keystoreInputRef}
                      onChange={(e) => setKeystoreFile(e.target.files ? e.target.files[0] : null)}
                      className="cursor-pointer"
                      accept=".json"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="The password used to encrypt your keystore"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoggingIn || !keystoreFile}>
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
                  <CardTitle className="font-headline text-2xl">Mint Your Passport</CardTitle>
                  <CardDescription>
                    Step 1: Create your secure account and identity.
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
                            placeholder="your@email.com"
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
                          placeholder="Choose a strong, memorable password"
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                      />
                      </div>
                      <Button type="submit" className="w-full" disabled={!signupPassword || !signupEmail}>
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
                    Step 2: Secure your Self-Sovereign Identity. Your identity has been generated and stored on this device.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>CRITICAL: Back Up Your Identity</AlertTitle>
                        <AlertDescription>
                            To prevent permanent loss, download your encrypted Keystore file. This is the ONLY way to recover your account on a new device.
                        </AlertDescription>
                    </Alert>
                    <div>
                      <Label htmlFor="did-address">Your Decentralized ID (DID)</Label>
                      <div className="flex items-center gap-2">
                        <Input id="did-address" readOnly value={`did:prmth:${generatedWallet.address}`} className="font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(`did:prmth:${generatedWallet.address}`)}><Copy className="h-4 w-4"/></Button>
                      </div>
                    </div>
                    
                    <Button onClick={handleDownloadKeystore} className="w-full" disabled={isSigningUp}>
                        {isSigningUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Download Keystore Backup & Proceed
                    </Button>
                </CardContent>
              </>
            )}

            {signupStep === 3 && (
                <>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Final Step</CardTitle>
                  <CardDescription>
                    Your backup is saved. Finalize your Passport creation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Your encrypted keystore file has been downloaded. You can now complete the process to create your passport and log in to the Promethea Network State.</p>
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


    