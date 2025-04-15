import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "SAST Report Explorer",
  description:
    "Simple viewer for GitLab Static Application Security Testing (SAST) reports.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {children}
        <footer className="py-6 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>SAST Report Explorer &copy; {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
