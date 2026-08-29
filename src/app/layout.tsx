import type { Metadata } from "next";
import { Lato, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CyberSecurityProvider } from "@/contexts/CyberSecurityProvider";
import { RMProvider } from "@/contexts/RMContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { ERPProvider } from "@/contexts/ERPContext";
import { BatchProvider } from "@/contexts/BatchContext";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LMS | Connecting Cyber Networks",
  description: "LMS platform for Connecting Cyber Networks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", lato.variable, "font-sans", inter.variable)}>
      <body className="min-h-full">
        <AuthProvider>
          <RMProvider>
            <ContentProvider>
              <ERPProvider>
                <BatchProvider>
            {/* <CyberSecurityProvider> */}
              {children}
            {/* </CyberSecurityProvider> */}
                </BatchProvider>
              </ERPProvider>
            </ContentProvider>
          </RMProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
