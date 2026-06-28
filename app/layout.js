import { Outfit } from "next/font/google";
import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "Asset Management System",
  description: "Asset Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className={`${outfit.className} min-h-screen tracking-wide `}>
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}