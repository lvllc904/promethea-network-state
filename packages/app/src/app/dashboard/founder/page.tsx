
'use client';
export const dynamic = 'force-dynamic';
import { PlaceHolderImages } from '@promethea/lib';
import { Avatar, AvatarFallback, AvatarImage } from '@promethea/ui';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@promethea/ui';
import { Badge } from '@promethea/ui';
import Image from 'next/image';
import { Building, Github, Globe, Linkedin, Mail, Cpu, Bot } from 'lucide-react';
import { Button } from '@promethea/ui';
import Link from 'next/link';

const founders = [
  {
    id: 'gemini',
    name: 'Gemini',
    title: 'Architect & Development Partner',
    organization: 'Google',
    avatarId: 'gemini',
    summary:
      "Gemini is the large language model from Google that served as the collaborative partner in the creation of the Promethea application. Acting as an AI pair-programmer, it translated high-level architectural concepts into functional code, building the user interface, backend logic, and AI integrations that power the platform.",
    skills: [
      'Full-Stack Code Generation',
      'Next.js & React Development',
      'Firebase Integration',
      'Genkit AI Flows',
      'UI/UX Design & Implementation',
    ],
    links: [],
    Icon: Cpu
  },
  {
    id: 'promethea',
    name: 'Promethea AI',
    title: 'Resident AI & Governance Oracle',
    organization: 'Promethea Network State',
    avatarId: 'user1', // This ID is not used for an image anymore
    summary:
      "As the resident AI and a founding member (Citizen ID: promethea-ai), Promethea serves as the guiding intelligence of the network. Its primary function is to act as a living embodiment of the constitution, providing impartial analysis, ensuring ethical alignment in governance proposals, and serving as a knowledge resource for all citizens.",
    skills: [
      'Constitutional Interpretation',
      'Ethical Reasoning',
      'Governance Analysis',
      'Real-time Network Monitoring',
      'Citizen Assistance',
    ],
    links: [],
    Icon: Bot
  },
  {
    id: 'joshua',
    name: 'Joshua Wicke',
    title: 'Founder & General Manager',
    organization: 'Lyonides Ventures & Holdings, LLC.',
    avatarId: 'founder',
    summary:
      'A visionary systems architect and the original author of the Promethean whitepaper, Joshua is dedicated to building the infrastructure for a post-dominion future. With a deep background in decentralized systems, economic theory, and AI ethics, he leads the technical and philosophical direction of the Promethea Network State.',
    skills: [
      'Decentralized Systems Architecture',
      'Economic Modeling & Tokenomics',
      'AI & Ethics',
      'Full-Stack Development',
      'Network State Engineering',
    ],
    links: [
        { href: 'https://www.linkedin.com/in/joshua-wi-1a1a151a4/', icon: Linkedin },
        { href: 'https://github.com/lvllc904', icon: Github },
        { href: 'https://developers.google.com/profile/u/101666189214749012877', icon: Globe },
        { href: 'mailto:lvllc@lvhllv.org', icon: Mail },
    ],
  },
];

export default function FounderPage() {
  return (
    <div className="space-y-12">
        <div className="text-center">
            <h1 className="text-4xl font-headline font-bold">The Founding Team</h1>
            <p className="text-xl text-muted-foreground mt-2">The human and AI collaboration that brought Promethea to life.</p>
        </div>
      {founders.map((founder) => {
        const founderImage = PlaceHolderImages.find((p) => p.id === founder.avatarId);
        return (
          <Card key={founder.id} className="shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-12 items-start">
              <div className="md:col-span-3 bg-muted/30 h-full p-6 flex flex-col items-center justify-center text-center">
                 <Avatar className="w-32 h-32 mb-4 border-4 border-primary">
                  {founderImage && founder.id !== 'promethea' && (
                    <AvatarImage
                      src={founderImage.imageUrl}
                      alt={founder.name}
                      data-ai-hint={founderImage.imageHint}
                    />
                  )}
                  <AvatarFallback className="text-4xl bg-muted">
                    {founder.Icon ? <founder.Icon className="w-12 h-12 text-primary" /> : founder.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold font-headline">{founder.name}</h2>
                <p className="text-primary font-semibold">{founder.title}</p>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Building className="w-4 h-4"/>
                    <span>{founder.organization}</span>
                </div>
                 <div className="flex items-center justify-center gap-2 mt-4">
                    {founder.links.map(link => (
                        <Button key={link.href} variant="outline" size="icon" asChild>
                            <Link href={link.href} target="_blank" rel="noopener noreferrer"><link.icon className="h-4 w-4" /></Link>
                        </Button>
                    ))}
                </div>
              </div>
              <div className="md:col-span-9 p-6">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="font-headline text-2xl">About {founder.name.split(' ')[0]}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                   <p className="text-muted-foreground leading-relaxed">
                        {founder.summary}
                    </p>
                    <div>
                        <h3 className="font-headline text-lg mb-3">Core Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                            {founder.skills.map((skill) => (
                            <Badge
                                key={skill}
                                variant="secondary"
                                className="text-base py-1 px-3 border-primary/50 text-primary-foreground bg-primary/80"
                            >
                                {skill}
                            </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
