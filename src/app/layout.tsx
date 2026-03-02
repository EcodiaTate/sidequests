import type { Metadata, Viewport } from "next";
import { Fjalla_One, Inter } from "next/font/google";
import "./globals.css";

const fjallaOne = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fjalla",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sidequests",
    template: "%s | Sidequests",
  },
  description:
    "Turn everyday actions into real environmental impact. Complete sidequests, earn ECO, and support local sustainable businesses.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#396041",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fjallaOne.variable} ${inter.variable}`}>
      <body
        className="bg-surface-base font-body antialiased"
        style={{ color: "var(--text-base)" }}
      >
        {children}
      </body>
    </html>
  );
}
