import Header from "@/components/Header";
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "PayMesh Web UI",
  description: "Test providers and visualize agent flow with style"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Header />
{children}
      </body>
    </html>
  );
}
