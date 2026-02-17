import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-primary",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Master UTM Generator",
  description: "Generate and manage UTM parameters for your marketing campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${inter.variable}`}>
      <body className="antialiased">
        <TooltipProvider>
          <div className="flex h-dvh">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-light-bg pb-16 md:pb-0">
              {children}
            </main>
          </div>
          <MobileNav />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
