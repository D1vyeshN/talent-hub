import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import ReduxProvider from "./providers/ReduxProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import SocketProvider from "@/app/providers/SocketProvider";
import { BackendWarmUp } from "@/components/layout/BackendWakeUp";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentHub - Find your dream career",
  description:
    "Discover your next opportunity with TalentHub. Browse thousands of jobs, connect with top companies, and take the next step in your career journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-gray-50 text-gray-900 ">
        <ReduxProvider>
          <SocketProvider>
            <TooltipProvider>
              {/* <Navbar /> */}
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: "12px",
                    background: "#333",
                    color: "#fff",
                  },
                }}
              />
            </TooltipProvider>
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}