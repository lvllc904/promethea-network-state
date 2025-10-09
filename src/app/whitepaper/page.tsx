
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhitepaperContent } from './content';

export default function WhitepaperPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center bg-background/80 px-4 backdrop-blur-sm lg:px-6"></header>
      <Card className="mx-auto max-w-4xl">
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
