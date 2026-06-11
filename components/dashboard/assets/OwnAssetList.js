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

const formatCondition = (value) => {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

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

  const handleRequestStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const res = await API.updateReturnRequestStatus(id, {
        status,
      });

      if (res.success) {
        toast.success(`Request ${status} successfully`);
        fetchRequests();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr style={{ height: bodyH }}>
                    <td colSpan={7} className="text-center align-middle">
                      <div className="flex flex-col items-center gap-2">
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
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>

                        <p className="text-sm text-[#8e8576]">
                          {search
                            ? `No results for "${search}"`
                            : "No assets found"}
                        </p>

                        {search && (
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
                            {formatCondition(asset.condition)}
                          </span>
                        </td>

                        <td className="px-4 text-center">
                          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                            {formatCondition(asset.status)}
                          </span>
                        </td>

                        <td className="px-4">
                          <div className="flex items-start justify-center">
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setReturnNote("");
                                setShowReturnModal(true);
                              }}
                              className="cursor-pointer p-2 rounded-lg hover:border-[#c6212f] hover:text-[#c6212f]"
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
                                <path d="M9 14L4 9l5-5" />
                                <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                              </svg>
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
