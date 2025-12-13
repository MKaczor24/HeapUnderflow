import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { DotPattern } from "@/components/ui/dot-pattern";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "HeapUnderflow",
  description:
    "A community-driven Q&A platform for developers to ask and answer technical questions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ubuntu.className} flex min-h-screen flex-col overflow-x-hidden bg-neutral-950 antialiased`}
      >
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#171717",
              color: "#F9FAFB",
              border: "1px solid #374151",
              borderRadius: "0.75rem",
              padding: "12px 16px",
              boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
            },
            success: {
              style: {
                border: "1px solid #1f2937",
                background: "#0f1720",
              },
            },
            error: {
              style: {
                border: "1px solid #991b1b",
                background: "#7f1d1d",
              },
            },
            iconTheme: {
              primary: "#8B5CF6",
              secondary: "#FFFFFF",
            },
          }}
        />
        <DotPattern
          width={32}
          height={32}
          cx={1}
          cy={1}
          cr={1}
          glow={true}
          className={cn(
            "fixed top-0 right-0 left-0 -z-10 mx-auto h-full w-full mask-[linear-gradient(to_bottom_right,white,gray,transparent)]",
          )}
        />
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
