import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
});

const plex = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Spot the Implant — What's my implant?",
    template: "%s — Spot the Implant",
  },
  description:
    "Two implant companies from a periapical or one CBCT crop. Decision support for dentists. Not a medical device.",
};

export const viewport = {
  themeColor: "#e6dccb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${plex.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </TooltipProvider>
      </body>
    </html>
  );
}
