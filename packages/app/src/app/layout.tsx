import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

export const metadata: Metadata = {
    title: "Promethean Network State",
    description: "Sovereign Digital Nation",
    icons: {
        icon: '/favicon.png',
        apple: '/favicon.png',
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="dark">
            <body className="antialiased font-sans">
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    );
}
