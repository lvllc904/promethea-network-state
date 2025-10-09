
'use client';
import { useState } from 'react';
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
import { Loader2, LogOut } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { FirebaseClientProvider } from '@/firebase/client-provider';

function LoginPageContent() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsSigningUp(true);

    try {
      await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      toast({
          title: 'Welcome to Promethea!',
          description: 'Your account is being created. You will be redirected shortly.',
      });
      router.push(redirectUrl);
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
      // The onAuthStateChanged listener in FirebaseProvider will handle the user state change.
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      // We don't need to force a redirect. The app state will change naturally.
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

  // If user is authenticated (not anonymous), show the logout page.
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

  // Otherwise, show the Login/Sign Up forms.
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
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Create Your Passport</CardTitle>
              <CardDescription>
                Join the Promethean Network State by creating your Self-Sovereign Identity.
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
                  <Button type="submit" className="w-full" disabled={isSigningUp}>
                      {isSigningUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create Passport
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
      </Tabs>
    </div>
  );
}


export default function LoginPage() {
  return (
    <FirebaseClientProvider>
      <LoginPageContent />
    </FirebaseClientProvider>
  );
}
