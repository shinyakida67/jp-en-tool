import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baymax",
  description: "English–Japanese translation, paragraph polishing, and business phrase reference for workplace communication.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}