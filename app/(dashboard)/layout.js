import { Inter } from "next/font/google";
import "../globals.css";
import ToasterProvider from "@/components/ToasterProvider";
import SideBar from "@/components/dashboard/SideBar";
import Header from "@/components/dashboard/Header";
import ScrollContainer from "@/components/dashboard/ScrollContainer";

const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: "400",
});

const geistMono = Inter({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: "400",
});

export const metadata = {
  title: "Asset Management Dashboard",
  description: "Asset Management Dashboard",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen p-6">
      {/*  */}
      <main className="flex-1 min-w-0 flex flex-col">
        <Header />
        <div className="flex">
          <SideBar />
          <ScrollContainer>{children}</ScrollContainer>
        </div>
      </main>
    </div>
  );
}
