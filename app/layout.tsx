import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baymax",
  description: "English–Japanese translation, paragraph polishing, and business phrase reference for workplace communication.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}