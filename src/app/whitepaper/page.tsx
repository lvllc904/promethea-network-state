import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WhitepaperPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-4xl">
            The Promethea Whitepaper
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none text-foreground/90">
          <p>
            Please provide the content for the whitepaper, and I will place it here.
          </p>
          <p>
            For now, this page serves as a placeholder for the full document. Once you provide the text, I'll format it correctly with headings, lists, and any other elements needed to make it readable and professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
