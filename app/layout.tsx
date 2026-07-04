import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meisterwissen",
  description:
    "KI-Wissensklon für das Malerhandwerk (Modul Innenanstrich) – Schmid Die Malerwerkstätte GmbH",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <div className="glass-bar sticky top-0 z-30">
          <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3">
            <Link href="/" aria-label="Startseite">
              <Logo variant="dark" compact />
            </Link>
            <Link href="/bibliothek" className="text-sm font-medium text-neutral-500">
              Bibliothek
            </Link>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
