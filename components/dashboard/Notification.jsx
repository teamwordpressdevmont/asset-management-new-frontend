"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API } from "@/utlis/api";

export default function Notification() {
  const [tab, setTab] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);

    const res =
      tab === "notifications"
        ? await API.getNotifications()
        : await API.getWarrantyAlerts();

    if (res.success) {
      setNotifications(res.message.data || []);
    } else {
      toast.error(res.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [tab]);
  const markRead = async (id) => {
    const res = await API.markNotificationAsRead(id);

    if (res.success) {
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );
    }
  };
  const markAllRead = async () => {
    const res = await API.markAllNotificationsAsRead();

    if (res.success) {
      toast.success("All notifications marked as read");

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        })),
      );
    }
  };
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#15100B]">Notifications</h1>

          {unreadCount > 0 && (
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#C6212F] text-white text-sm font-semibold">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 rounded-xl bg-[#C6212F] text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15.55-6.36L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15.55 6.36L3 16" />
            </svg>
          </button>

          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl bg-green-600 text-white"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setTab("notifications")}
          className={`px-5 py-2 rounded-xl border ${
            tab === "notifications"
              ? "bg-[#C6212F] text-white border-[#C6212F]"
              : "bg-white"
          }`}
        >
          Notifications
        </button>

        <button
          onClick={() => setTab("warranty")}
          className={`px-5 py-2 rounded-xl border ${
            tab === "warranty"
              ? "bg-[#C6212F] text-white border-[#C6212F]"
              : "bg-white"
          }`}
        >
          Warranty Alerts
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border-l-4 border-[#C6212F]/30 bg-white p-5 shadow-sm"
            >
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />

                  <div className="mt-3 h-4 w-3/4 bg-gray-100 rounded animate-pulse" />

                  <div className="mt-2 h-4 w-1/2 bg-gray-100 rounded animate-pulse" />

                  <div className="mt-3 h-3 w-32 bg-gray-100 rounded animate-pulse" />
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
                  <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
                  <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          No notifications found
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`rounded-2xl border-l-4 p-5 shadow-sm transition-all
            ${
              item.isRead
                ? "border-gray-300 bg-white"
                : "border-[#C6212F] bg-red-50"
            }`}
            >
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>

                  <p className="mt-1 text-gray-600">{item.message}</p>

                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!item.isRead && (
                    <button
                      onClick={() => markRead(item._id)}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17L4 12" />
                      </svg>
                    </button>
                  )}

                  <a
                    href={item.referenceUrl}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </a>

                  <button
                    onClick={() => deleteNotification(item._id)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
