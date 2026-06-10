"use client";
import { useEffect, useRef, useState } from "react";
import { getUser, clearAuthData } from "@/utlis/auth";
import Image from "next/image";
import { logOut } from "@/utlis/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaBell } from "react-icons/fa";
import Link from "next/link";

function HeaderSkeleton() {
  return (
    <div className="card p-4 flex items-center justify-between mb-4 animate-pulse">
      {/* Left skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-36 rounded-lg bg-black/10" />
        <div className="h-3 w-24 rounded-lg bg-black/6" />
      </div>

      {/* Right skeleton */}
      <div className="flex items-center gap-2.5 px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-black/10 shrink-0" />
        <div className="h-3.5 w-24 rounded-lg bg-black/10 hidden sm:block" />
        <div className="h-3 w-3 rounded bg-black/6" />
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    : parts[0][0].toUpperCase();
}

export default function Header() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    setLoggingOut(true);
    const res = await logOut();
    if (res.success) {
      clearAuthData();
      toast.success(res.message?.message || "Logged out successfully.");
      router.push("/login");
    } else {
      toast.error(res.message || "Logout failed. Please try again.");
      setLoggingOut(false);
    }
  };

  const initials = getInitials(user?.name);

  if (!user) return <HeaderSkeleton />;

  return (
    <div className="card py-4 px-6 flex items-center justify-between mb-6 bg-white rounded-3xl shadow-lg">
      {/* Left — page title or greeting */}
      <div className="flex items-center">
        <div className="w-62.5 flex items-center gap-2">
          <Image
            src="/favico.png"
            alt="avatar"
            width={50}
            height={50}
            className=""
          />
          <Image
            src="/logo2.png"
            alt="avatar"
            width={100}
            height={100}
            className=""
          />
        </div>
        <div className="">
          <h2 className="text-base font-semibold text-gray-900">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
          </h2>
          <p className="text-xs text-gray-900/50 mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Right — avatar dropdown */}
      <div className="relative flex items-center gap-4" ref={dropdownRef}>
        {/* Notification */}
        <div className="notification shadow-lg border border-[#C6212F] rounded-xl p-3.25 cursor-pointer">
          <FaBell className="w-5 h-5 text-[#C6212F]" />
        </div>

        {/* Trigger button */}
        <button
          onClick={() => setOpen(!open)}
          className="outline-0 cursor-pointer h-12 w-48 flex items-center gap-2.5 rounded-xl transition-all duration-150"
        >
          {/* Avatar */}
          <div className="rounded-xl bg-[#F4F1EA] shadow-lg border border-[#d8d6d0] p-1.5 h-12 w-12 flex items-center justify-center">
            <Image
              src="/dashboard/avatar/avatar.png"
              alt="avatar"
              width={100}
              height={100}
              className="rounded-xl"
            />
          </div>

          {/* Name */}
          <span className="text-sm font-medium text-black hidden sm:block">
            {user?.name || "User"}
          </span>

          {/* Chevron */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={`text-black transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {/* Dropdown panel */}
        {open && (
          <div className="absolute right-0 top-full mt-5 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
            {/* User info */}
            <div className="px-4 py-3 border-b border-black/5 flex items-center justify-center gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>

            {/* Menu items */}
            <ul className="py-1.5">
              {[
                {
                  label: "Profile",
                  icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />,
                  circle: <circle cx="12" cy="7" r="4" />,
                  link: "/profile",
                },
                {
                  label: "Settings",
                  link: "/settings",
                  icon: (
                    <>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </>
                  ),
                },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.link}>
                    <button className="cursor-pointer w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-white/60 hover:text-gray-800 transition-colors text-left">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400 shrink-0"
                      >
                        {item.icon}
                        {item.circle}
                      </svg>
                      {item.label}
                    </button>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Divider + Logout */}
            <div className="border-t border-black/5 py-1.5">
              <button
                disabled={loggingOut}
                onClick={handleLogout}
                className="cursor-pointer w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50/60 transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loggingOut ? (
                  <svg
                    className="animate-spin shrink-0"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                )}
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
