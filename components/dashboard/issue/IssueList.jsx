"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { API } from "@/utlis/api";
import toast from "react-hot-toast";
import { getUser } from "@/utlis/auth";
import CustomSelect from "@/components/ui/CustomSelect";

const PER_PAGE = 9;
const ROW_H = 53;

function StatusBadge({ status }) {
  const map = {
    open: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-[11px] font-semibold ${map[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function Sk({ w = "60%" }) {
  return (
    <div
      className="h-3.5 rounded-md bg-black/6 animate-pulse"
      style={{ width: w }}
    />
  );
}

// Pagination helper — returns array like [1, 2, "...", 8, 9]
function buildPageNums(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const pages = new Set([1, last, current, current - 1, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= last)
    .sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
    result.push(sorted[i]);
  }
  return result;
}

export default function IssueList() {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = authUser?.role?.name == "admin";
  useEffect(() => {
    const user = getUser();
    setAuthUser(user);
  }, []);

  const openUpdateModal = (issue) => {
    console.log("click");
    setSelectedIssue(issue);
    setStatus(issue.status);
    setRemarks("");
    setShowModal(true);
  };

  const fetchIssues = useCallback(async () => {
    if (!authUser) return;

    setLoading(true);

    const params =
      authUser.role?.name === "admin" || authUser.role?.name === "super_admin"
        ? {}
        : { myIssues: "true" };

    const res = await API.getIssues(params);

    if (res.success) {
      setIssues(res.message?.data || []);
    } else {
      toast.error(res.message || "Failed to load issues.");
    }

    setLoading(false);
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    fetchIssues();
  }, [authUser, fetchIssues]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim().toLowerCase());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Filter issues whenever source data or search term changes
  useEffect(() => {
    let rows = [...issues];
    if (search) {
      rows = rows.filter(
        (item) =>
          item.assetId?.title?.toLowerCase().includes(search) ||
          item.type?.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search) ||
          item.reportedBy?.name?.toLowerCase().includes(search),
      );
    }
    setFilteredIssues(rows);
    setPage(1);
  }, [issues, search]);

  const handleStatusUpdate = async (issue, status) => {
    if (!isAdmin) {
      toast.error("Only admin can update issue status");
      return;
    }
    const res = await API.updateIssueStatus(issue._id, { status, remarks: "" });
    if (res.success) {
      toast.success("Issue updated successfully");
      fetchIssues();
    } else {
      toast.error(res.message);
    }
  };

  const submitUpdate = async () => {
    if (!selectedIssue) return;

    setSubmitting(true);

    const res = await API.updateIssueStatus(selectedIssue._id, {
      status,
      remarks,
    });

    if (res.success) {
      toast.success("Issue updated successfully");
      setShowModal(false);
      setSelectedIssue(null);
      setRemarks("");
      fetchIssues();
    } else {
      toast.error(res.message);
    }

    setSubmitting(false);
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const total = filteredIssues.length;
  const lastPage = Math.ceil(total / PER_PAGE) || 1;
  const currentPage = page;
  const start = (currentPage - 1) * PER_PAGE;
  const paginatedIssues = filteredIssues.slice(start, start + PER_PAGE);
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + PER_PAGE, total);
  const bodyH = ROW_H * PER_PAGE;
  const pageNums = buildPageNums(currentPage, lastPage);
  const columnCount = isAdmin ? 7 : 6;
  return (
    <>
      <div className="space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4.5 h-px bg-[#c6212f]" />
              <span className="text-xs text-[#c6212f] font-semibold tracking-widest uppercase">
                Asset
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#15100B]">Issues</h1>
            <p className="text-xs text-[#8e8576] mt-0.5">
              {loading
                ? "Loading..."
                : `${total} issue${total !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <Link
            href="/issue/add"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#C6212F] rounded-[10px] hover:bg-[#a81b27] transition-all duration-200 shadow-[0_4px_14px_rgba(198,33,47,0.3)] hover:shadow-[0_6px_20px_rgba(198,33,47,0.45)]"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Issue
          </Link>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#f0ebe3]">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#f0ebe3]">
            <div className="flex items-center gap-2.5 bg-[#fbf8f2] border border-[#e5dfd3] rounded-[10px] px-3.5 py-0 shadow-sm w-72 focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)] transition-all">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8e8576"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search issues..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm text-[#15100B] placeholder-[#8e8576] border-none outline-none"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="text-[#8e8576] hover:text-[#c6212f] transition-colors"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <span className="text-xs text-[#8e8576] shrink-0 min-w-[120px] text-right">
              {!loading && total > 0 && (
                <>
                  Showing{" "}
                  <span className="font-semibold text-[#544b40]">
                    {from}–{to}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#544b40]">{total}</span>
                </>
              )}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm ">
              <colgroup>
                {isAdmin ? (
                  <>
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "23%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "7%" }} />
                  </>
                ) : (
                  <>
                    <col style={{ width: "6%" }} />
                    <col style={{ width: "28%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "8%" }} />
                  </>
                )}
              </colgroup>
              <thead>
                <tr className="border-b border-[#f0ebe3] bg-[#fbf8f2]/80">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody
                style={{ height: bodyH }}
                className="divide-y divide-[#f0ebe3]"
              >
                {loading ? (
                  // ── Skeleton rows ──
                  [...Array(PER_PAGE)].map((_, i) => (
                    <tr key={i} style={{ height: ROW_H }}>
                      <td className="px-4">
                        <Sk w="50%" />
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-black/6 animate-pulse shrink-0" />
                          <Sk w="65%" />
                        </div>
                      </td>
                      <td className="px-4">
                        <Sk w="75%" />
                      </td>
                      <td className="px-4">
                        <Sk w="70%" />
                      </td>
                      <td className="px-4">
                        <Sk w="80%" />
                      </td>
                      <td className="px-4">
                        <Sk w="60%" />
                      </td>
                      {isAdmin && (
                        <td className="px-4">
                          <Sk w="50%" />
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  // ── Data rows ──
                  <>
                    {paginatedIssues.map((issue, idx) => (
                      <tr
                        key={issue._id}
                        style={{ height: ROW_H }}
                        className="hover:bg-[#fbf8f2]/60 transition-colors"
                      >
                        <td className="px-4 text-[13px] text-[#544b40] truncate">
                          {from + idx}
                        </td>

                        <td className="px-4">
                          <span className="text-[13px] text-[#544b40] truncate">
                            {issue.assetId?.title}
                          </span>
                        </td>

                        <td className="px-4 text-[13px] text-[#544b40] truncate">{issue.type}</td>

                        <td className="px-4">
                          <div className="max-w-[250px] text-[13px] text-[#544b40] truncate">
                            {issue.description}
                          </div>
                        </td>

                        <td className="px-4 text-[13px] text-[#544b40] truncate">{issue.reportedBy?.name}</td>

                        <td className="px-4 text-center text-[13px] text-[#544b40] truncate">
                          <StatusBadge status={issue.status} />
                        </td>
                        {isAdmin && (
                          <td className="px-4">
                            <button
                              onClick={() => openUpdateModal(issue)}
                              disabled={["resolved", "rejected"].includes(
                                issue.status,
                              )}
                              className={`p-2 rounded-lg border border-[#e5dfd3]
                              ${
                                ["resolved", "rejected"].includes(issue.status)
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer hover:border-[#c6212f] hover:text-[#c6212f]"
                              }`}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                              </svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}

                    {/* Filler rows to maintain fixed table height */}
                    {paginatedIssues.length < PER_PAGE &&
                      [...Array(PER_PAGE - paginatedIssues.length)].map(
                        (_, i) => (
                          <tr key={`filler-${i}`} style={{ height: ROW_H }}>
                            <td colSpan={columnCount} />
                          </tr>
                        ),
                      )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#f0ebe3] min-h-[52px]">
            <p className="text-xs text-[#8e8576]">
              {!loading && lastPage > 0 && (
                <>
                  Page{" "}
                  <span className="font-semibold text-[#544b40]">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#544b40]">
                    {lastPage}
                  </span>
                </>
              )}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={loading || currentPage === 1}
                className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#e5dfd3] text-[#544b40] bg-[#fbf8f2] hover:border-[#c6212f] hover:text-[#c6212f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Prev
              </button>

              {pageNums.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`e-${i}`}
                    className="px-1.5 text-xs text-[#8e8576]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={`cursor-pointer w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                      p === currentPage
                        ? "bg-[#C6212F] text-white shadow-[0_2px_8px_rgba(198,33,47,0.25)]"
                        : "border border-[#e5dfd3] text-[#544b40] bg-[#fbf8f2] hover:border-[#c6212f] hover:text-[#c6212f]"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || currentPage === lastPage}
                className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#e5dfd3] text-[#544b40] bg-[#fbf8f2] hover:border-[#c6212f] hover:text-[#c6212f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Update Issue</h3>

            <div className="space-y-4">
              <CustomSelect
                value={status}
                name="status"
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: "open", label: "Open" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "resolved", label: "Resolved" },
                  { value: "rejected", label: "Rejected" },
                ]}
              />

              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter note..."
                rows={4}
                className="w-full border border-gray-200 shadow rounded-lg p-3 outline-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={submitUpdate}
                  disabled={submitting}
                  className="px-4 py-2 bg-[#C6212F] text-white rounded-lg"
                >
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
