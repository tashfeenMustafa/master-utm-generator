import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { StorageInitializer } from "@/components/layout/storage-initializer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
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
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="antialiased">
        <StorageInitializer />
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
