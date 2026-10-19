import type { Metadata } from "next";
import { Orbitron, Chakra_Petch } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "APEX // BMW M4 GT3 — Immersive 3D Racing Experience",
  description:
    "A cinematic, scroll-driven 3D showcase of the BMW M4 GT3. 590 HP of twin-turbo brutality, sculpted aerodynamics and weapon-grade engineering — rendered live in your browser.",
  keywords: [
    "BMW M4 GT3",
    "3D website",
    "racing",
    "motorsport",
    "WebGL",
    "Three.js",
    "scroll animation",
  ],
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23050505'/%3E%3Cpath d='M6 22 L14 8 L18 8 L10 22 Z' fill='%23e10600'/%3E%3Cpath d='M16 22 L24 8 L28 8 L20 22 Z' fill='%23ffffff'/%3E%3C/svg%3E",
  },
  openGraph: {
    title: "APEX // BMW M4 GT3",
    description: "Cinematic scroll-driven 3D racing experience. Desktop only.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${chakra.variable} antialiased bg-[#050505] text-[#f4f4f0] grain`}
      >
        {children}
      </body>
    </html>
  );
}
