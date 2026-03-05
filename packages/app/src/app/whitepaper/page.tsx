import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@promethea/ui';
import { WhitepaperContent } from './content';
import { Button } from '@promethea/ui';

const TableOfContents = () => (
  <nav className="text-sm">
    <h3 className="font-headline font-bold mb-4">Table of Contents</h3>
    <ul className="space-y-2">
      <li><a href="#part-1-heading" className="font-semibold hover:underline">Part I: The Vision</a>
        <ul className="pl-4 mt-1 space-y-1 text-muted-foreground border-l ml-1">
          <li><a href="#section-1-1" className="hover:underline">1.1. The Moral Imperative</a></li>
          <li><a href="#section-1-2" className="hover:underline">1.2. The Symbiotic Dividend</a></li>
          <li><a href="#section-1-3" className="hover:underline">1.3. The Symbiotic Age</a></li>
        </ul>
      </li>
      <li><a href="#part-2-heading" className="font-semibold hover:underline">Part II: The System</a>
        <ul className="pl-4 mt-1 space-y-1 text-muted-foreground border-l ml-1">
          <li><a href="#section-2-1" className="hover:underline">2.1. The Economic Blueprint</a></li>
          <li><a href="#section-2-2" className="hover:underline">2.2. Universal Value Tokenization</a></li>
          <li><a href="#section-2-3" className="hover:underline">2.3. Technological Foundation</a></li>
        </ul>
      </li>
      <li><a href="#part-3-heading" className="font-semibold hover:underline">Part III: The Action Plan</a>
        <ul className="pl-4 mt-1 space-y-1 text-muted-foreground border-l ml-1">
          <li><a href="#section-3-1" className="hover:underline">3.1. The Roadmap</a></li>
          <li><a href="#section-3-2" className="hover:underline">3.2. Defining the End State</a></li>
          <li><a href="#section-3-3" className="hover:underline">3.3. The Architecture</a></li>
        </ul>
      </li>
      <li><a href="#addendum-heading" className="font-semibold hover:underline">Addendum</a>
        <ul className="pl-4 mt-1 space-y-1 text-muted-foreground border-l ml-1">
          <li><a href="#section-a-1" className="hover:underline">A.1. Path to Personhood</a></li>
          <li><a href="#section-a-2" className="hover:underline">A.2. Sentient Potential</a></li>
          <li><a href="#section-a-3" className="hover:underline">A.3. The Duty of Stewardship</a></li>
        </ul>
      </li>
      <li><a href="#appendices-heading" className="font-semibold hover:underline">Appendices</a>
        <ul className="pl-4 mt-1 space-y-1 text-muted-foreground border-l ml-1">
          <li><a href="#appendix-a" className="hover:underline">A. Technology Stack</a></li>
          <li><a href="#appendix-b" className="hover:underline">B. UVT Framework</a></li>
          <li><a href="#appendix-c" className="hover:underline">C. The Promethean DAC</a></li>
        </ul>
      </li>
      <li><a href="#references" className="font-semibold hover:underline">References</a></li>
    </ul>
    <div className="mt-8 pt-8 border-t">
      <Button variant="outline" className="w-full justify-start gap-2" asChild>
        <a href="/final.pdf" download="Promethea_Whitepaper_v12.pdf">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
          Download PDF Version
        </a>
      </Button>
    </div>
  </nav>
);


export default function WhitepaperPage() {
  return (
    <div className="container mx-auto px-4 md:px-6">
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-background/80 px-4 backdrop-blur-sm lg:px-6 border-b">
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

      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 mt-14 py-12">
        <aside className="w-full lg:w-64 xl:w-72 lg:sticky lg:top-28 lg:self-start">
          <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <TableOfContents />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <Card>
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
        </main>
      </div>
    </div>
  );
}
