import type { Metadata } from "next";
import { Lato, Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CyberSecurityProvider } from "@/contexts/CyberSecurityProvider";
import { RMProvider } from "@/contexts/RMContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { ERPProvider } from "@/contexts/ERPContext";
import { BatchProvider } from "@/contexts/BatchContext";
import { StudentProvider } from "@/contexts/StudentContext";
import { TrainerProvider } from "@/contexts/TrainerContext";
import { AssignmentProvider } from "@/contexts/AssignmentContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { cn } from "@/lib/utils";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
    <html lang="en" className={cn("h-full", "antialiased", lato.variable, "font-sans", inter.variable, poppins.variable)}>
      <body className="min-h-full">
        {/* Collects MUI/Emotion styles during SSR so they hydrate without mismatches. */}
        <AppRouterCacheProvider>
        <AuthProvider>
          <RMProvider>
            <ContentProvider>
              <ERPProvider>
                <BatchProvider>
                  <StudentProvider>
                    <TrainerProvider>
                      <AssignmentProvider>
                        <CourseProvider>
                          {/* <CyberSecurityProvider> */}
                          {children}
                          {/* </CyberSecurityProvider> */}
                        </CourseProvider>
                      </AssignmentProvider>
                    </TrainerProvider>
                  </StudentProvider>
                </BatchProvider>
              </ERPProvider>
            </ContentProvider>
          </RMProvider>
        </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
