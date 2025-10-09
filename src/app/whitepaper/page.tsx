import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhitepaperContent } from './content';
import { Button } from '@/components/ui/button';

export default function WhitepaperPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-background/80 px-4 backdrop-blur-sm lg:px-6">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5c0 2.22-0.76 4.26-2.06 5.88L12 21.5l-7.44-3.12A9.5 9.5 0 0 1 2.5 12 9.5 9.5 0 0 1 12 2.5Z" />
            <path d="M12 2.5v19" />
          </svg>
          <span className="font-headline font-semibold">Promethea</span>
        </Link>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </header>
      <Card className="mx-auto max-w-4xl mt-14">
        <CardHeader>
          <CardTitle className="text-center font-headline text-4xl">
            Promethea: A White Paper &amp; Roadmap to a Network State and the New
            World…
          </CardTitle>
          <div className="pt-4 text-center text-muted-foreground">
            <p>Joshua Wicke</p>
            <p>In partnership with Gemini AI</p>
            <p>Version: 12.777 (Final Draft)</p>
            <p>Date: October 8, 2025</p>
            <p>Status: Live Document</p>
          </div>
        </CardHeader>
        <CardContent>
          <WhitepaperContent />
        </CardContent>
      </Card>
    </div>
  );
}
