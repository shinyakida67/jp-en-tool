import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EN ↔ JP Translator & Polisher",
  description: "English–Japanese translation and paragraph polishing tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}