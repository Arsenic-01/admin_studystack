import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";
import ReactQueryProvider from "./QueryProvider";
import ConditionalHeader from "@/components/core/ConditionalHeader";
import ConditionalFooter from "@/components/core/ConditionalFooter";

// const inter = Inter({ subsets: ["latin"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "Admin Login | StudyStack",
  description:
    "Administrative dashboard for managing StudyStack content and users.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased`}>
        <Providers>
          <ReactQueryProvider>
            <ConditionalHeader />
            {children}
            <Toaster richColors />
            <ConditionalFooter />
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  );
}
