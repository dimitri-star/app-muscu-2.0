import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import DebugRuntimeProbe from "@/components/DebugRuntimeProbe";

const poppins = Poppins({
  variable: "--font-app",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const fontVariable = poppins.variable;

export const metadata: Metadata = {
  title: "FitTrack Pro",
  description: "Application de suivi musculation et nutrition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={fontVariable}>
      <body
        className="antialiased"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <DebugRuntimeProbe />
        <div className="flex min-h-screen">
          <Sidebar />
          <main
            className="flex-1 overflow-y-auto relative z-0"
            style={{ marginLeft: "240px", minHeight: "100vh", backgroundColor: "#FFFFFF" }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
