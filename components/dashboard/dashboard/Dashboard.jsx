"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/utlis/auth";
import { API } from "@/utlis/api";

import {
  FaBoxOpen,
  FaUsers,
  FaBuilding,
  FaTruck,
  FaExclamationTriangle,
  FaClipboardList,
  FaUndo,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaUserPlus,
  FaUser,
  FaTags,
  FaBell,
  FaPlus,
} from "react-icons/fa";

const ROLE_CONFIG = {
  super_admin: {
    title: "Super Admin Dashboard",
    subtitle:
      "Platform-wide overview of organizations, users and subscriptions",
    badge: "⚡ Super Admin",
    quickActions: [
      {
        label: "Add Organization",
        href: "/company/add",
        icon: <FaPlus size={24} />,
      },
      {
        label: "Organizations",
        href: "/company",
        icon: <FaBuilding size={24} />,
      },
      { label: "Add User", href: "/users/add", icon: <FaUserPlus size={24} /> },
      { label: "Users", href: "/users", icon: <FaUsers size={24} /> },
      { label: "Assets", href: "/assets", icon: <FaBoxOpen size={24} /> },
      {
        label: "Asset Categories",
        href: "/assets-category",
        icon: <FaTags size={24} />,
      },
      { label: "Vendors", href: "/vendors", icon: <FaTruck size={24} /> },
      {
        label: "Issue Reports",
        href: "/issue-reports",
        icon: <FaExclamationTriangle size={24} />,
      },
    ],
  },
  admin: {
    title: "Admin Dashboard",
    subtitle: "Manage your organization's assets, vendors and team",
    badge: "🛠️ Admin",
    quickActions: [
      { label: "Add Asset", href: "/assets/add", icon: <FaPlus size={24} /> },
      { label: "Assets", href: "/assets", icon: <FaBoxOpen size={24} /> },
      {
        label: "Asset Categories",
        href: "/assets-category",
        icon: <FaTags size={24} />,
      },
      {
        label: "Add Vendor",
        href: "/vendors/add",
        icon: <FaTruck size={24} />,
      },
      { label: "Vendors", href: "/vendors", icon: <FaTruck size={24} /> },
      { label: "Add User", href: "/users/add", icon: <FaUserPlus size={24} /> },
      {
        label: "Return Requests",
        href: "/return-requests",
        icon: <FaUndo size={24} />,
      },
      {
        label: "Issue Reports",
        href: "/issue-reports",
        icon: <FaExclamationTriangle size={24} />,
      },
    ],
  },
  user: {
    title: "My Dashboard",
    subtitle: "Overview of your assigned assets and requests",
    badge: "👋 Welcome",
    quickActions: [
      {
        label: "My Assets",
        href: "/own-assets",
        icon: <FaBoxOpen size={24} />,
      },
      {
        label: "My Issues",
        href: "/issue",
        icon: <FaClipboardList size={24} />,
      },
      {
        label: "Report an Issue",
        href: "/issue/create",
        icon: <FaPlus size={24} />,
      },
      { label: "My Profile", href: "/profile", icon: <FaUser size={24} /> },
    ],
  },
};

/* ─── Dot color by severity ─── */
const DOT_COLOR = {
  red: "bg-[#C6212F]",
  orange: "bg-amber-400",
  green: "bg-emerald-400",
  blue: "bg-blue-400",
  purple: "bg-violet-400",
};

/* ─── Stat icon bg tints ─── */
const ICON_TINT = {
  blue: "bg-blue-50   text-blue-600",
  purple: "bg-violet-50 text-violet-600",
  green: "bg-emerald-50 text-emerald-600",
  pink: "bg-pink-50   text-pink-600",
  orange: "bg-amber-50  text-amber-600",
  red: "bg-red-50    text-[#C6212F]",
};

const BAR_FILL = {
  blue: "bg-blue-600",
  purple: "bg-violet-600",
  green: "bg-emerald-600",
  pink: "bg-pink-600",
  orange: "bg-amber-600",
  red: "bg-red-600",
};

/* ══════════════════════════════════════════
   STAT CARD  — compact, full-width grid
═══════════════════════════════════════════ */
function StatCard({ icon, label, value, maxValue = 50, color }) {
  const tint = ICON_TINT[color] ?? ICON_TINT.blue;

  const percentage = maxValue ? (value / maxValue) * 200 : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#f0ebe3] p-5 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      {/* Top */}
      <div className="flex items-center gap-3">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${tint}`}
        >
          {icon}
        </div>

        <div className="flex flex-col">
          <p className="text-2xl font-bold text-[#15100B] leading-none">
            {value}
          </p>
          <p className="text-[13px] text-[#8e8576] mt-1">{label}</p>
          <div className="w-full h-2 bg-[#f0ebe3] rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                BAR_FILL[color] ?? "bg-blue-600"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* BAR */}
    </div>
  );
}

/* ══════════════════════════════════════════
   QUICK ACTION TILE
═══════════════════════════════════════════ */
function QuickActionTile({ icon, label, href }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#f0ebe3] bg-[#fbf8f2]/60 hover:bg-white hover:border-[#C6212F]/20 hover:shadow-sm transition-all duration-200 group text-center"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#fff0f2] text-[#C6212F] group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <span className="text-[11px] font-medium text-[#544b40] leading-tight">
        {label}
      </span>
    </Link>
  );
}

/* ══════════════════════════════════════════
   NOTIFICATION ITEM
═══════════════════════════════════════════ */
function NotificationItem({ title, message, time, unread, color }) {
  const dot = DOT_COLOR[color] ?? DOT_COLOR.red;
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-[#fbf8f2] transition-colors">
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dot} ${!unread ? "opacity-30" : ""}`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12px] truncate ${unread ? "font-semibold text-[#15100B]" : "font-medium text-[#544b40]"}`}
        >
          {title}
        </p>
        <p className="text-[11px] text-[#8e8576] truncate mt-0.5">{message}</p>
      </div>
      <span className="text-[10px] text-[#8e8576] shrink-0 pt-0.5">{time}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   SECTION LABEL
═══════════════════════════════════════════ */
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-4 h-px bg-[#C6212F]" />
      <span className="text-[10px] text-[#C6212F] font-semibold tracking-widest uppercase">
        {children}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════ */
function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-4 h-px bg-gray-200" />
        <div className="w-20 h-3 rounded bg-gray-200" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#f0ebe3] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-gray-100" />
              <div className="w-16 h-4 rounded-full bg-gray-100" />
            </div>
            <div className="h-7 w-14 rounded bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-100" />
          </div>
        ))}
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#f0ebe3] p-4 space-y-3">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#f0ebe3] p-3 flex flex-col items-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100" />
                <div className="h-3 w-12 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#f0ebe3] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f0ebe3]">
            <div className="h-3 w-24 rounded bg-gray-200" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="px-4 py-3 border-b border-[#f0ebe3] last:border-0 flex gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-gray-200 mt-1.5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-40 rounded bg-gray-200" />
                <div className="h-2.5 w-52 rounded bg-gray-100" />
              </div>
              <div className="h-2.5 w-8 rounded bg-gray-100 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function DashboardPage() {
  const [role, setRole] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const fetchDashboard = async () => {
    setLoading(true);
    const res = await API.getDashboardData();
    if (res.success) {
      setDashboard(res.message);
      setRole(res.message.role);
    }
    setLoading(false);
  };

  useEffect(() => {
    setRole(getUser()?.role?.name ?? "user");
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const notificationRes = await API.getNotifications({ limit: 2, page: 1 });
      if (notificationRes.success) {
        setNotifications(notificationRes.message.data || []);
      }
    };
    fetchNotifications();
  }, []);

  if (loading || !dashboard) return <DashboardSkeleton />;

  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.user;

  /* ─── Dynamic stats per role ─── */
  let dynamicStats = [];

  if (role === "super_admin") {
    dynamicStats = [
      {
        label: "Total Assets",
        value: dashboard?.metrics?.totalAssets || 0,
        icon: <FaBoxOpen size={24} />,
        color: "blue",
      },
      {
        label: "Asset Categories",
        value: dashboard?.metrics?.totalCategories || 0,
        icon: <FaTags size={24} />,
        color: "purple",
      },
      {
        label: "Vendors",
        value: dashboard?.metrics?.totalVendors || 0,
        icon: <FaTruck size={24} />,
        color: "green",
      },
      {
        label: "Organizations",
        value: dashboard?.metrics?.totalOrganizations || 0,
        icon: <FaBuilding size={24} />,
        color: "orange",
      },
      {
        label: "Total Users",
        value: dashboard?.metrics?.totalUsers || 0,
        icon: <FaUsers size={24} />,
        color: "pink",
      },
      {
        label: "Issue Reports",
        value: dashboard?.metrics?.totalIssueReports || 0,
        icon: <FaExclamationTriangle size={24} />,
        color: "red",
      },
    ];
  }

  if (role === "admin") {
    dynamicStats = [
      {
        label: "Total Assets",
        value: dashboard?.metrics?.totalAssets || 0,
        icon: <FaBoxOpen size={24} />,
        color: "blue",
      },
      {
        label: "Asset Categories",
        value: dashboard?.metrics?.totalCategories || 0,
        icon: <FaTags size={24} />,
        color: "purple",
      },
      {
        label: "Vendors",
        value: dashboard?.metrics?.totalVendors || 0,
        icon: <FaTruck size={24} />,
        color: "green",
      },
      {
        label: "Users",
        value: dashboard?.metrics?.totalUsers || 0,
        icon: <FaUsers size={24} />,
        color: "pink",
      },
      {
        label: "Return Requests",
        value: dashboard?.metrics?.totalReturnRequests || 0,
        icon: <FaUndo size={24} />,
        color: "orange",
      },
      {
        label: "Issue Reports",
        value: dashboard?.metrics?.totalIssueReports || 0,
        icon: <FaExclamationTriangle size={24} />,
        color: "red",
      },
    ];
  }

  if (role === "user") {
    dynamicStats = [
      {
        label: "My Assets",
        value: dashboard?.metrics?.myAssets || 0,
        icon: <FaBoxOpen size={24} />,
        color: "blue",
      },
      {
        label: "My Issues",
        value: dashboard?.metrics?.myIssues || 0,
        icon: <FaClipboardList size={24} />,
        color: "purple",
      },
      {
        label: "Solved Issues",
        value: dashboard?.metrics?.solvedIssues || 0,
        icon: <FaCheckCircle size={24} />,
        color: "green",
      },
      {
        label: "Rejected Issues",
        value: dashboard?.metrics?.rejectedIssues || 0,
        icon: <FaTimesCircle size={24} />,
        color: "red",
      },
    ];
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-5 ">
      {/* ── Dashboard label ── */}
      <SectionLabel>Dashboard</SectionLabel>

      {/* ── STATS — full width ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {dynamicStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* ── BOTTOM ROW: Quick Actions + Notifications side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-[#f0ebe3] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-semibold text-[#15100B] uppercase tracking-wide">
              Quick Actions
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8e8576]">
              Manage everything
            </span>
          </div>
          {/* <div className="grid grid-cols-3 gap-2 max-h-[190px] overflow-y-auto pr-1 styled-scrollbar"> */}
          <div className="grid grid-cols-3 gap-2 ">
            {config.quickActions.map((action) => (
              <QuickActionTile key={action.label} {...action} />
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-[#f0ebe3] flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#f0ebe3] flex items-center justify-between shrink-0">
            <h3 className="text-[12px] font-semibold text-[#15100B] flex items-center gap-2 uppercase tracking-wide">
              <FaBell className="text-[#C6212F]" size={12} />
              Notifications
            </h3>

            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold bg-[#fff0f2] text-[#C6212F] px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f0ebe3]">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-[#8e8576]">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  title={n.title}
                  message={n.message}
                  time={new Date(n.createdAt).toLocaleDateString()}
                  unread={!n.isRead}
                  color="red"
                />
              ))
            )}
          </div>

          {/* Footer (stays at bottom) */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[#f0ebe3] mt-auto">
              <Link
                href="/notifications"
                className="text-[11px] text-[#C6212F] font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all notifications <FaArrowRight size={9} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
