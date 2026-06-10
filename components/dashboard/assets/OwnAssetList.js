"use client";
import Link from "next/link";
import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import MySwal from "@/utlis/swal";
import { API } from "@/utlis/api";

const PER_PAGE = 9;
const ROW_H = 53;
const Sk = ({ w = "100%" }) => (
  <div className="h-3 rounded bg-black/6 animate-pulse" style={{ width: w }} />
);
export default function OwnAssetList() {
  const [searchInput, setSearchInput] = useState("");
  const [deleting, setDeleting] = useState(null);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [returnNote, setReturnNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(
    () =>
      searchInput.trim()
        ? assets.filter(
            (a) =>
              a.title.toLowerCase().includes(searchInput.toLowerCase()) ||
              a.categoryId?.name
                .toLowerCase()
                .includes(searchInput.toLowerCase()),
          )
        : assets,
    [assets, searchInput],
  );

  const { currentPage, lastPage, total } = pagination;
  const from = total === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const to = Math.min(currentPage * PER_PAGE, total);

  const pageNums = Array.from({ length: lastPage }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) {
        acc.push("...");
      }
      acc.push(p);
      return acc;
    }, []);

  const fetchAssets = useCallback(async () => {
    setLoading(true);

    const params = {
      page,
      limit: PER_PAGE,
      myAssets: true,
    };

    if (search) {
      params.search = search;
    }

    const res = await API.getAssets(params);

    if (res.success) {
      const data = res.message?.data ?? {};
      const body = res.message ?? {};
      const rows = Array.isArray(body.data) ? body.data : [];
      const pg = body.pagination ?? {};
      const total = pg.total ?? rows.length;
      const lastPage = Math.ceil(total / (pg.limit ?? PER_PAGE)) || 1;
      setAssets(rows);
      setPagination({
        currentPage: page,
        lastPage,
        total,
      });
    } else {
      toast.error(res.message || "Failed to load assets.");
    }

    setLoading(false);
  }, [page, search]);

  const filteredTotal = filtered.length;
  const bodyH = ROW_H * PER_PAGE;

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Delete Asset?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setDeleting(true);

    const res = await API.deleteAsset(id);

    if (res.success) {
      toast.success("Asset deleted successfully.");
      fetchAssets();
    } else {
      toast.error(res.message || "Delete failed.");
    }

    setDeleting(false);
  };

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 400);

    return () => clearTimeout(t);
  }, [searchInput]);

  const submitReturnRequest = async () => {
    if (!returnNote.trim()) {
      toast.error("Please enter notes");
      return;
    }

    setSubmitting(true);
    const res = await API.returnRequest({
      assetId: selectedAsset._id,
      note: returnNote,
    });
    if (res.success) {
      toast.success("Return request submitted");
      setShowReturnModal(false);
      setSelectedAsset(null);
      setReturnNote("");

      fetchAssets();
    } else {
      toast.error(res.message);
    }

    setSubmitting(false);
  };
  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4.5 h-px bg-[#c6212f]" />
              <span className="text-xs text-[#c6212f] font-semibold tracking-widest uppercase">
                Own
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#15100B]">Assets</h1>
            <p className="text-xs text-[#8e8576] mt-0.5">
              {total} asset{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <Link
            href="/assets/add"
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
            Add Asset
          </Link>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-[#f0ebe3]">
          {/* Toolbar */}
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
                placeholder="Search assets..."
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
            <span className="text-xs text-[#8e8576] shrink-0">
              {total > 0 && (
                <>
                  <span className="font-semibold text-[#544b40]">{total}</span>{" "}
                  result{total !== 1 ? "s" : ""}
                </>
              )}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
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
                    Category
                  </th>

                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    Company
                  </th>

                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    Condition
                  </th>

                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    Status
                  </th>

                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                style={{ height: bodyH }}
                className="divide-y divide-[#f0ebe3]"
              >
                {loading ? (
                  [...Array(PER_PAGE)].map((_, i) => (
                    <tr key={i} style={{ height: ROW_H }}>
                      <td className="px-4">
                        <Sk w="40%" />
                      </td>

                      <td className="px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-black/6 animate-pulse shrink-0" />
                          <div className="flex-1">
                            <Sk w="70%" />
                            <div className="mt-1">
                              <Sk w="45%" />
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4">
                        <Sk w="70%" />
                      </td>

                      <td className="px-4">
                        <Sk w="70%" />
                      </td>

                      <td className="px-4">
                        <div className="mx-auto w-16">
                          <Sk />
                        </div>
                      </td>

                      <td className="px-4">
                        <div className="mx-auto w-16">
                          <Sk />
                        </div>
                      </td>

                      <td className="px-4">
                        <div className="flex justify-center gap-2">
                          <div className="w-4 h-4 rounded bg-black/6 animate-pulse" />
                          <div className="w-4 h-4 rounded bg-black/6 animate-pulse" />
                          <div className="w-4 h-4 rounded bg-black/6 animate-pulse" />
                          <div className="w-4 h-4 rounded bg-black/6 animate-pulse" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr style={{ height: bodyH }}>
                    <td colSpan={7} className="text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg
                          width="36"
                          height="36"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#c6c0b5"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <p className="text-sm text-[#8e8576]">
                          {searchInput
                            ? `No results for "${searchInput}"`
                            : "No assets found"}
                        </p>
                        {searchInput && (
                          <button
                            onClick={() => setSearchInput("")}
                            className="text-xs text-[#c6212f] hover:underline"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {filtered.map((asset, idx) => (
                      <tr
                        key={asset._id}
                        style={{ height: ROW_H }}
                        className="hover:bg-[#fbf8f2]/60 transition-colors"
                      >
                        <td className="px-4 text-[12px] font-medium text-[#8e8576]">
                          {idx + 1}
                        </td>
                        <td className="px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#c6212f]/8 border border-[#c6212f]/15 flex items-center justify-center shrink-0">
                              ⚙️
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium text-[#15100B] truncate text-[13px]">
                                {asset.title}
                              </p>

                              <p className="text-[11px] text-[#8e8576] truncate">
                                {asset.model || asset.serialNumber || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 text-[13px] text-[#544b40] truncate">
                          {asset.categoryId?.name || "—"}
                        </td>

                        <td className="px-4 text-[13px] text-[#544b40] truncate">
                          {asset.companyId?.name || "—"}
                        </td>

                        <td className="px-4 text-center">
                          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {asset.condition || "—"}
                          </span>
                        </td>

                        <td className="px-4 text-center">
                          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                            {asset.status || "—"}
                          </span>
                        </td>

                        <td className="px-4">
                          <div className="flex items-center justify-end ">
                            <Link
                              href={`/assets/${asset._id}/edit`}
                              className="p-1 rounded-lg text-[#8e8576] hover:text-[#c6212f] hover:bg-[#c6212f]/8 transition-colors"
                              title="Edit"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setReturnNote("");
                                setShowReturnModal(true);
                              }}
                              className="cursor-pointer p-2 rounded-lg hover:border-[#c6212f] hover:text-[#c6212f]"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M9 14L4 9l5-5" />
                                <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                              </svg>
                            </button>
                            <Link
                              href={`/assets/${asset._id}/history`}
                              className="p-1 rounded-lg text-[#8e8576] hover:text-[#c6212f] hover:bg-[#c6212f]/8 transition-colors"
                              title="View"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(asset._id)}
                              disabled={deleting === asset._id}
                              className="p-1 rounded-lg text-[#8e8576] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                              title="Delete"
                            >
                              {deleting === asset._id ? (
                                <svg
                                  className="animate-spin"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                >
                                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                              ) : (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length < PER_PAGE &&
                      [...Array(PER_PAGE - filtered.length)].map((_, i) => (
                        <tr key={`filler-${i}`} style={{ height: ROW_H }}>
                          <td colSpan={7} />
                        </tr>
                      ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#f0ebe3] min-h-[52px]">
            <p className="text-xs text-[#8e8576]">
              Showing{" "}
              <span className="font-semibold text-[#544b40]">
                {filteredTotal}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#544b40]">
                {assets.length}
              </span>{" "}
              assets
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={loading || currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#e5dfd3] text-[#544b40] bg-[#fbf8f2] hover:border-[#c6212f] hover:text-[#c6212f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${p === currentPage ? "bg-[#C6212F] text-white shadow-[0_2px_8px_rgba(198,33,47,0.25)]" : "border border-[#e5dfd3] text-[#544b40] bg-[#fbf8f2] hover:border-[#c6212f] hover:text-[#c6212f]"}`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || currentPage === lastPage}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#e5dfd3] text-[#544b40] bg-[#fbf8f2] hover:border-[#c6212f] hover:text-[#c6212f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-5">Return Request</h3>

            <div className="space-y-4">
              <textarea
                rows={5}
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder="Enter notes..."
                className="w-full resize-none rounded-xl border border-[#d9d2c5] bg-[#fbf8f2] px-4 py-3 outline-none focus:border-[#C6212F]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={submitReturnRequest}
                  className="px-4 py-2 bg-[#C6212F] text-white rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
