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
  FaArrowUp,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaUserPlus,
  FaUser,
  FaTags,
  FaBell,
  FaPlus,
} from "react-icons/fa";

// ─── Gradient palette (genz-ish, tokens picked up by Tailwind's content scanner) ──
const GRADIENTS = {
  red: "from-[#C6212F] to-[#FF7A59]",
  orange: "from-orange-400 to-amber-500",
  blue: "from-blue-500 to-cyan-400",
  purple: "from-violet-500 to-fuchsia-500",
  green: "from-emerald-400 to-teal-500",
  pink: "from-pink-500 to-rose-400",
  indigo: "from-indigo-500 to-blue-500",
};

const ROLE_CONFIG = {
  super_admin: {
    title: "Super Admin Dashboard",
    subtitle:
      "Platform-wide overview of organizations, users and subscriptions",
    badge: "⚡ Super Admin",
    stats: [
      {
        label: "Total Assets",
        value: "1,284",
        trend: "+34 this month",
        icon: <FaBoxOpen size={20} />,
        color: "blue",
      },
      {
        label: "Asset Categories",
        value: "18",
        trend: "+2 this month",
        icon: <FaTags size={20} />,
        color: "purple",
      },
      {
        label: "Vendors",
        value: "42",
        trend: "+5 this month",
        icon: <FaTruck size={20} />,
        color: "green",
      },
      {
        label: "Organizations",
        value: "24",
        trend: "+3 this month",
        icon: <FaBuilding size={20} />,
        color: "orange",
      },
      {
        label: "Total Users",
        value: "1,248",
        trend: "+56 this month",
        icon: <FaUsers size={20} />,
        color: "pink",
      },
      {
        label: "Issue Reports",
        value: "37",
        trend: "+9 this week",
        icon: <FaExclamationTriangle size={20} />,
        color: "red",
      },
    ],
    quickActionsStyle: "grid",
    quickActions: [
      {
        label: "Add Organization",
        href: "/company/add",
        icon: <FaPlus size={18} />,
        color: "orange",
      },
      {
        label: "Organizations",
        href: "/company",
        icon: <FaBuilding size={18} />,
        color: "indigo",
      },
      {
        label: "Add User",
        href: "/users/add",
        icon: <FaUserPlus size={18} />,
        color: "pink",
      },
      {
        label: "Users",
        href: "/users",
        icon: <FaUsers size={18} />,
        color: "purple",
      },
      {
        label: "Assets",
        href: "/assets",
        icon: <FaBoxOpen size={18} />,
        color: "blue",
      },
      {
        label: "Asset Categories",
        href: "/assets-category",
        icon: <FaTags size={18} />,
        color: "purple",
      },
      {
        label: "Vendors",
        href: "/vendors",
        icon: <FaTruck size={18} />,
        color: "green",
      },
      {
        label: "Issue Reports",
        href: "/issue-reports",
        icon: <FaExclamationTriangle size={18} />,
        color: "red",
      },
    ],
    notifications: [
      {
        title: "New organization registered",
        message: "Acme Corp just signed up for a Pro plan",
        time: "5m ago",
        unread: true,
        color: "orange",
      },
      {
        title: "Subscription payment received",
        message: "Globex Inc paid $499 for Enterprise plan",
        time: "1h ago",
        unread: true,
        color: "green",
      },
      {
        title: "User role updated",
        message: "John Doe was promoted to Admin",
        time: "3h ago",
        unread: true,
        color: "purple",
      },
      {
        title: "System backup completed",
        message: "Daily backup finished successfully",
        time: "6h ago",
        unread: false,
        color: "blue",
      },
      {
        title: "New issue report",
        message: "Printer issue reported by Initech",
        time: "1d ago",
        unread: false,
        color: "red",
      },
    ],
  },

  admin: {
    title: "Admin Dashboard",
    subtitle: "Manage your organization's assets, vendors and team",
    badge: "🛠️ Admin",
    stats: [
      {
        label: "Total Assets",
        value: "342",
        trend: "+12 this month",
        icon: <FaBoxOpen size={20} />,
        color: "blue",
      },
      {
        label: "Asset Categories",
        value: "16",
        trend: "+1 this month",
        icon: <FaTags size={20} />,
        color: "purple",
      },
      {
        label: "Vendors",
        value: "15",
        trend: "+1 this month",
        icon: <FaTruck size={20} />,
        color: "green",
      },
      {
        label: "Users",
        value: "86",
        trend: "+4 this month",
        icon: <FaUsers size={20} />,
        color: "pink",
      },
      {
        label: "Return Requests",
        value: "4",
        trend: "Needs review",
        icon: <FaUndo size={20} />,
        color: "orange",
      },
      {
        label: "Issue Reports",
        value: "7",
        trend: "Needs attention",
        icon: <FaExclamationTriangle size={20} />,
        color: "red",
      },
    ],
    quickActionsStyle: "grid",
    quickActions: [
      {
        label: "Add Asset",
        href: "/assets/add",
        icon: <FaPlus size={18} />,
        color: "blue",
      },
      {
        label: "Assets",
        href: "/assets",
        icon: <FaBoxOpen size={18} />,
        color: "blue",
      },
      {
        label: "Asset Categories",
        href: "/assets-category",
        icon: <FaTags size={18} />,
        color: "purple",
      },
      {
        label: "Add Vendor",
        href: "/vendors/add",
        icon: <FaTruck size={18} />,
        color: "green",
      },
      {
        label: "Vendors",
        href: "/vendors",
        icon: <FaTruck size={18} />,
        color: "green",
      },
      {
        label: "Add User",
        href: "/users/add",
        icon: <FaUserPlus size={18} />,
        color: "pink",
      },
      {
        label: "Return Requests",
        href: "/return-requests",
        icon: <FaUndo size={18} />,
        color: "orange",
      },
      {
        label: "Issue Reports",
        href: "/issue-reports",
        icon: <FaExclamationTriangle size={18} />,
        color: "red",
      },
    ],
    notifications: [
      {
        title: "New asset added",
        message: 'MacBook Pro 16" added to inventory',
        time: "10m ago",
        unread: true,
        color: "blue",
      },
      {
        title: "Return request submitted",
        message: "Dell Monitor return requested by Sarah Khan",
        time: "1h ago",
        unread: true,
        color: "orange",
      },
      {
        title: "New issue reported",
        message: "Printer not working - reported by Ali",
        time: "3h ago",
        unread: true,
        color: "red",
      },
      {
        title: "Vendor added",
        message: "Tech Supplies Co. added as a new vendor",
        time: "6h ago",
        unread: false,
        color: "green",
      },
      {
        title: "Asset assigned",
        message: "Laptop - Dell XPS 13 assigned to John Doe",
        time: "1d ago",
        unread: false,
        color: "blue",
      },
    ],
  },

  user: {
    title: "My Dashboard",
    subtitle: "Overview of your assigned assets and requests",
    badge: "👋 Welcome",
    stats: [
      {
        label: "My Assets",
        value: "5",
        trend: "Currently assigned",
        icon: <FaBoxOpen size={20} />,
        color: "blue",
      },
      {
        label: "My Issues",
        value: "6",
        trend: "Total reported",
        icon: <FaClipboardList size={20} />,
        color: "purple",
      },
      {
        label: "Solved Issues",
        value: "4",
        trend: "Resolved",
        icon: <FaCheckCircle size={20} />,
        color: "green",
      },
      {
        label: "Rejected Issues",
        value: "1",
        trend: "Needs attention",
        icon: <FaTimesCircle size={20} />,
        color: "red",
      },
    ],
    quickActionsStyle: "grid",
    quickActions: [
      {
        label: "My Assets",
        href: "/own-assets",
        icon: <FaBoxOpen size={18} />,
        color: "blue",
      },
      {
        label: "My Issues",
        href: "/issue",
        icon: <FaClipboardList size={18} />,
        color: "purple",
      },
      {
        label: "Report an Issue",
        href: "/issue/create",
        icon: <FaPlus size={18} />,
        color: "red",
      },
      {
        label: "My Profile",
        href: "/profile",
        icon: <FaUser size={18} />,
        color: "indigo",
      },
    ],
    notifications: [
      {
        title: "Issue resolved",
        message: "Your issue 'Keyboard keys not working' has been resolved",
        time: "2h ago",
        unread: true,
        color: "green",
      },
      {
        title: "Issue rejected",
        message: "Your issue 'Monitor flickering' was rejected",
        time: "5h ago",
        unread: true,
        color: "red",
      },
      {
        title: "New asset assigned",
        message: "Laptop - Dell XPS 13 has been assigned to you",
        time: "1d ago",
        unread: false,
        color: "blue",
      },
      {
        title: "Issue in progress",
        message: "Your issue 'Office chair broken' is being reviewed",
        time: "2d ago",
        unread: false,
        color: "purple",
      },
    ],
  },
};

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="w-4.5 h-px bg-[#c6212f]" />
      <span className="text-xs text-[#c6212f] font-semibold tracking-widest uppercase">
        {children}
      </span>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }) {
  return (
    <div className="relative bg-white rounded-3xl border border-[#f0ebe3] p-5 flex flex-col gap-4 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      <div
        className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-linear-to-br ${GRADIENTS[color]} opacity-10 group-hover:opacity-20 transition-opacity`}
      />
      <div className="flex items-center justify-between relative">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-[#c12233]`}
        >
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <FaArrowUp size={9} />
            {trend}
          </span>
        )}
      </div>
      <div className="relative">
        <p className="text-2xl font-bold text-[#15100B] tracking-tight">
          {value}
        </p>
        <p className="text-xs text-[#8e8576] mt-1">{label}</p>
      </div>
    </div>
  );
}

function QuickActionTile({ icon, label, href, color }) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-start gap-3 p-4 rounded-2xl border border-[#f0ebe3] bg-[#fbf8f2]/40 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-[#c12233] group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <span className="text-sm font-semibold text-[#15100B]">{label}</span>
      <FaArrowRight className="absolute bottom-4 right-4 text-[#8e8576] text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function NotificationItem({ title, message, time, unread, color }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#fbf8f2]/60 transition-colors">
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 bg-linear-to-br ${GRADIENTS[color]} ${unread ? "" : "opacity-30"}`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm truncate ${unread ? "font-semibold text-[#15100B]" : "font-medium text-[#544b40]"}`}
        >
          {title}
        </p>
        <p className="text-xs text-[#8e8576] truncate mt-0.5">{message}</p>
      </div>
      <span className="text-[10px] text-[#8e8576] shrink-0">{time}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Dashboard Label */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-[2px] rounded bg-gray-200" />
        <div className="w-24 h-4 rounded bg-gray-200" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl border border-[#f0ebe3] p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gray-200" />
              <div className="w-20 h-7 rounded-full bg-gray-100" />
            </div>

            <div className="space-y-2">
              <div className="h-8 w-20 rounded bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border border-[#f0ebe3] p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-3 w-28 rounded bg-gray-100" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-[#f0ebe3] rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200 mb-4" />
              <div className="h-4 w-24 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-3xl border border-[#f0ebe3] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0ebe3]">
          <div className="h-5 w-32 rounded bg-gray-200" />
        </div>

        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="px-5 py-4 border-b border-[#f0ebe3] last:border-b-0"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-4 w-52 rounded bg-gray-200 mb-2" />
                <div className="h-3 w-72 rounded bg-gray-100" />
              </div>

              <div className="h-3 w-10 rounded bg-gray-100 ml-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
      const notificationRes = await API.getNotifications();

      if (notificationRes.success) {
        setNotifications(notificationRes.message.data || []);
      }
    };

    fetchNotifications();
  }, []);

  if (loading || !dashboard) {
    return <DashboardSkeleton />;
  }

  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.user;

  let dynamicStats = [];

  if (role === "super_admin") {
    dynamicStats = [
      {
        label: "Total Assets",
        value: dashboard?.metrics?.totalAssets || 0,
        trend: "",
        icon: <FaBoxOpen size={20} />,
        color: "blue",
      },
      {
        label: "Asset Categories",
        value: dashboard?.metrics?.totalCategories || 0,
        trend: "",
        icon: <FaTags size={20} />,
        color: "purple",
      },
      {
        label: "Vendors",
        value: dashboard?.metrics?.totalVendors || 0,
        trend: "",
        icon: <FaTruck size={20} />,
        color: "green",
      },
      {
        label: "Organizations",
        value: dashboard?.metrics?.totalOrganizations || 0,
        trend: "",
        icon: <FaBuilding size={20} />,
        color: "orange",
      },
      {
        label: "Total Users",
        value: dashboard?.metrics?.totalUsers || 0,
        trend: "",
        icon: <FaUsers size={20} />,
        color: "pink",
      },
      {
        label: "Issue Reports",
        value: dashboard?.metrics?.totalIssueReports || 0,
        trend: "",
        icon: <FaExclamationTriangle size={20} />,
        color: "red",
      },
    ];
  }

  if (role === "admin") {
    dynamicStats = [
      {
        label: "Total Assets",
        value: dashboard?.metrics?.totalAssets || 0,
        trend: "",
        icon: <FaBoxOpen size={20} />,
        color: "blue",
      },
      {
        label: "Asset Categories",
        value: dashboard?.metrics?.totalCategories || 0,
        trend: "",
        icon: <FaTags size={20} />,
        color: "purple",
      },
      {
        label: "Vendors",
        value: dashboard?.metrics?.totalVendors || 0,
        trend: "",
        icon: <FaTruck size={20} />,
        color: "green",
      },
      {
        label: "Users",
        value: dashboard?.metrics?.totalUsers || 0,
        trend: "",
        icon: <FaUsers size={20} />,
        color: "pink",
      },
      {
        label: "Return Requests",
        value: dashboard?.metrics?.totalReturnRequests || 0,
        trend: "",
        icon: <FaUndo size={20} />,
        color: "orange",
      },
      {
        label: "Issue Reports",
        value: dashboard?.metrics?.totalIssueReports || 0,
        trend: "",
        icon: <FaExclamationTriangle size={20} />,
        color: "red",
      },
    ];
  }

  if (role === "user") {
    dynamicStats = [
      {
        label: "My Assets",
        value: dashboard?.metrics?.myAssets || 0,
        trend: "",
        icon: <FaBoxOpen size={20} />,
        color: "blue",
      },
      {
        label: "My Issues",
        value: dashboard?.metrics?.myIssues || 0,
        trend: "",
        icon: <FaClipboardList size={20} />,
        color: "purple",
      },
      {
        label: "Solved Issues",
        value: dashboard?.metrics?.solvedIssues || 0,
        trend: "",
        icon: <FaCheckCircle size={20} />,
        color: "green",
      },
      {
        label: "Rejected Issues",
        value: dashboard?.metrics?.rejectedIssues || 0,
        trend: "",
        icon: <FaTimesCircle size={20} />,
        color: "red",
      },
    ];
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="mb-6">
        <SectionLabel>Dashboard</SectionLabel>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {dynamicStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border border-[#f0ebe3] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#15100B]">
            Quick Actions
          </h3>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8e8576]">
            Manage everything
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {config.quickActions.map((action) => (
            <QuickActionTile key={action.label} {...action} />
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-3xl border border-[#f0ebe3] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0ebe3] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#15100B] flex items-center gap-2">
            <FaBell className="text-[#C6212F]" size={13} />
            Notifications
          </h3>
          {config.notifications.some((n) => n.unread) && (
            <span className="w-2 h-2 rounded-full bg-[#C6212F] animate-pulse" />
          )}
        </div>
        <div className="divide-y divide-[#f0ebe3]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No notifications found
            </div>
          ) : (
            <div className="divide-y divide-[#f0ebe3]">
              {notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  title={n.title}
                  message={n.message}
                  time={new Date(n.createdAt).toLocaleDateString()}
                  unread={!n.isRead}
                  color="red"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
