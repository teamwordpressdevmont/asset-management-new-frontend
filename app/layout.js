import { Inter } from "next/font/google";
import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Asset Management System",
  description: "Asset Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className={`${inter.className} min-h-screen`}>
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
