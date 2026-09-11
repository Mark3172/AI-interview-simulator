import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Interview Simulator",
  description:
    "Practice technical interviews with an AI-powered hiring manager. Paste a job description and get realistic interview questions with detailed feedback.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent text-accent-foreground font-bold text-sm">
              AI
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Interview Simulator
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-powered mock interviews
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col">{children}</main>

        <footer className="border-t border-border py-4">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <p className="text-xs text-center text-muted-foreground">
              Powered by Vercel AI SDK &middot; Your responses are not stored
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
