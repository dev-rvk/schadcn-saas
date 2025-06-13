import { GeistSans } from "geist/font/sans"; // Corrected import if Geist is used
import { GeistMono } from "geist/font/mono";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers"; // Assuming this is for theme providers etc.
import { UserProvider } from '@auth0/nextjs-auth0/client'; // Import UserProvider

export const metadata = {
  title: 'Auth0 Protected App',
  description: 'Next.js app with Auth0 authentication',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`\${GeistSans.variable} \${GeistMono.variable} font-sans antialiased\`}
      >
        <UserProvider> {/* Wrap with UserProvider */}
          <Providers attribute="class" defaultTheme="system" enableSystem> {/* Theme provider from original setup */}
            {children}
          </Providers>
        </UserProvider>
      </body>
    </html>
  );
}
