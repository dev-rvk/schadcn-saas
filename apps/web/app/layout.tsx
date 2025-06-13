import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
// Removed: import { UserProvider } from '@auth0/nextjs-auth0/client';

export const metadata = {
  title: 'Auth0 Protected App - Server Client', // Updated title slightly for clarity
  description: 'Next.js app with Auth0 authentication using server-side client and middleware',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        {/* UserProvider removed from here */}
        <Providers attribute="class" defaultTheme="system" enableSystem>
          {children}
        </Providers>
      </body>
    </html>
  );
}
