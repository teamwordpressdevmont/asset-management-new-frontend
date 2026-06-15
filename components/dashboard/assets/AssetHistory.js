"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { API } from "@/utlis/api";

export default function AssetHistory() {
  const { id } = useParams();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);

    const res = await API.assetHistory(id);

    if (res.success) {
      const rows = res.message?.data || res.data || [];
      setHistory(rows);
    } else {
      toast.error(res.message || "Failed to load history");
    }

    setLoading(false);
  };
  useEffect(() => {
    if (id) {
      fetchHistory();
    }
  }, [id]);
  
  const getActionTitle = (action) => {
    const map = {
      created: "Asset Created",
      assigned: "Asset Assigned",
      updated: "Asset Updated",
      returned: "Asset Returned",
      return_requested: "Return Requested",
      issue_reported: "Issue Reported",
      issue_resolved: "Issue Resolved",
      retired: "Asset Retired",
    };

    return map[action] || action;
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="  overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <Link
          href="/assets"
          className="w-10 h-10 rounded-full bg-[#C6212F] flex items-center justify-center hover:bg-[#a81b27] transition-colors rotate-180"
          title="Back to Assets"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-4.5 h-px bg-[#c6212f]" />
            <span className="text-xs text-[#c6212f] font-semibold tracking-widest uppercase">
              Asset Management
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-[#15100B]">
            Asset History
          </h1>

          <p className="text-xs text-[#8e8576] mt-0.5">
            View complete asset activity timeline and audit logs
          </p>
        </div>
      </div>
      {/* Timeline */}
      <div className="px-4 py-8">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-[#e7dfd3]" />

          {history.map((item) => (
            <div key={item._id} className="relative flex gap-8 mb-10">
              {/* Timeline Dot */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-[#c6212f] flex items-center justify-center shadow-sm mt-4 ms-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Card */}
              <div className="flex-1 rounded-2xl border border-[#e7dfd3] bg-white px-5 py-4">
                <div className="flex justify-between items-start gap-10">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#111827]">
                      {getActionTitle(item.action)}
                    </h3>

                    <div className="mt-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#c6212f]/10 text-[#c6212f]">
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2 text-xs text-[#6b7280]">
                      {item.user && (
                        <p>
                          Assigned to:
                          <span className="font-medium text-[#374151] ml-2">
                            {item.user}
                          </span>
                        </p>
                      )}

                      <p>
                        Performed by:
                        <span className="font-medium text-[#374151] ml-2">
                          {item.performedBy}
                        </span>
                      </p>

                      {item.note && (
                        <p>
                          Note:
                          <span className="ml-2 text-[#374151]">
                            {item.note}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <p className="text-[15px] text-[#9ca3af] text-xs">
                      {item.createdAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
