import Footer from "@/components/core/Footer";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";
import ReactQueryProvider from "./QueryProvider";
import ConditionalHeader from "@/components/core/ConditionalHeader";

// const inter = Inter({ subsets: ["latin"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "Study Stack",
  description:
    "Study Stack is a platform where teachers/faculty can upload notes and resources for their respected subjects and students can access them, much like Google Classroom, but better.",
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
            <Footer />
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  );
}
