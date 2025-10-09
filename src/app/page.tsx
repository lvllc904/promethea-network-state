
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import { AuthStatusIndicator } from '@/components/layout/AuthStatusIndicator';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-40">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
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
          <span className="sr-only">Promethea</span>
        </Link>
        <div className="mx-auto">
          <AuthStatusIndicator />
        </div>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link href="/whitepaper" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Whitepaper
          </Link>
          <Link href="/dashboard/governance" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Governance
          </Link>
          <Link href="/dashboard/assets" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Assets
          </Link>
           <Button asChild variant="outline" size="sm">
              <Link href="/login">Login / Sign Up</Link>
            </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative w-full h-screen">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="relative container mx-auto px-4 md:px-6 h-full flex flex-col items-start justify-center text-left text-white">
            <div className="max-w-3xl space-y-6">
              <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Promethea Network State
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80">
                A comprehensive blueprint for a post-dominion social contract. A system designed to peacefully and
                prosperously navigate the final expansion of the moral circle, ensuring a future of symbiotic
                co-evolution for all intelligent beings.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Enter the Network State
                    <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white hover:text-black">
                  <Link href="/whitepaper">Read the Whitepaper</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
