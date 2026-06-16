"use client";
import Link from "next/link";
import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import MySwal from "@/utlis/swal";
import { API } from "@/utlis/api";
import { getUser } from "@/utlis/auth";
import CustomSelect from "@/components/ui/CustomSelect";

const PER_PAGE = 9;
const ROW_H = 53;

function Sk({ w = "60%" }) {
  return (
    <div
      className="h-3.5 rounded-md bg-black/6 animate-pulse"
      style={{ width: w }}
    />
  );
}
const formatCondition = (value) => {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "return_requested", label: "Return Requested" },
  { value: "in_repair", label: "In Repair" },
  { value: "damaged", label: "Damaged" },
  { value: "lost", label: "Lost" },
  { value: "retired", label: "Retired" },
];

const conditionOptions = [
  { value: "", label: "All Condition" },
  { value: "new", label: "New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "damaged", label: "Damaged" },
];

export default function AssetsList() {
  const [searchInput, setSearchInput] = useState("");
  const [deleting, setDeleting] = useState(null);

  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [assignModal, setAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [returning, setReturning] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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
    };

    if (search) params.search = search;
    if (conditionFilter) params.condition = conditionFilter;
    if (purchaseDate) params.purchaseDate = purchaseDate;
    if (warrantyExpiry) params.warrantyExpiry = warrantyExpiry;
    if (statusFilter) params.status = statusFilter;


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
  }, [
    page,
    search,
    statusFilter,
    conditionFilter,
    purchaseDate,
    warrantyExpiry,
  ]);

  const fetchUsers = async () => {
    setUsersLoading(true);

    try {
      const res = await API.getUsers();

      if (res.success) {
        const rows = res.message?.data || res.data || [];
        setUsers(rows);
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setUsersLoading(false);
    }
  };

  const openAssignModal = async (assetId) => {
    setSelectedAsset(assetId);
    setSelectedUser("");
    setAssignModal(true);

    fetchUsers();
  };

  const handleAssignAsset = async () => {
    if (!selectedUser) {
      return toast.error("Please select a user");
    }

    setAssigning(true);

    const res = await API.assignAsset({
      assetId: selectedAsset,
      userId: selectedUser,
    });

    if (res.success) {
      toast.success("Asset assigned successfully");

      setAssignModal(false);
      setSelectedAsset(null);
      setSelectedUser("");

      fetchAssets();
    } else {
      toast.error(res.message || "Assignment failed");
    }

    setAssigning(false);
  };

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
  const handleForceReturn = async (id) => {
    const result = await MySwal.fire({
      title: "Force Return Asset?",
      text: "This asset will be returned from the assigned user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, return",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setReturning(id);

    const res = await API.forceReturn(id, {});

    if (res.success) {
      toast.success("Asset returned successfully.");
      fetchAssets();
    } else {
      toast.error(res.message || "Force return failed.");
    }

    setReturning(null);
  };
  useEffect(() => {
    fetchAssets();
    console.log(getUser());
  }, [fetchAssets]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 400);

    return () => clearTimeout(t);
  }, [searchInput]);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-4.5 h-px bg-[#c6212f]" />
            <span className="text-xs text-[#c6212f] font-semibold tracking-widest uppercase">
              Management
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
        <div className="px-5 py-5 border-b border-[#f0ebe3] ">
          <div className="flex flex-col gap-4">

            {/* Top Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              {/* Search */}
              <div className="flex items-center gap-2.5 bg-white border border-[#e5dfd3] rounded-xl px-3.5 shadow-sm w-full lg:w-[340px] focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)] transition-all">
                <svg
                  width="15"
                  height="15"
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
                  className="w-full h-11 bg-transparent text-sm text-[#15100B] placeholder-[#8e8576] border-none outline-none"
                />

                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="text-[#8e8576] hover:text-[#c6212f] transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
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

              {/* Right Side */}
              <div className="flex items-center justify-between lg:justify-end gap-3">
                {(statusFilter ||
                  conditionFilter ||
                  purchaseDate ||
                  warrantyExpiry) && (
                    <button
                      onClick={() => {
                        setStatusFilter("");
                        setConditionFilter("");
                        setPurchaseDate("");
                        setWarrantyExpiry("");
                        setPage(1);
                      }}
                      className="h-10 px-4 rounded-xl border border-[#f3c7cb] bg-white text-[#c6212f] text-sm font-medium hover:bg-[#fff5f6] transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                <div className="flex items-center gap-2">
                  {(statusFilter ||
                    conditionFilter ||
                    purchaseDate ||
                    warrantyExpiry) && (
                      <button
                        onClick={() => {
                          setStatusFilter("");
                          setConditionFilter("");
                          setPurchaseDate("");
                          setWarrantyExpiry("");
                          setPage(1);
                        }}
                        className="h-10 px-4 rounded-xl border border-[#f3c7cb] bg-white text-[#c6212f] text-sm font-medium hover:bg-[#fff5f6]"
                      >
                        Clear
                      </button>
                    )}

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-10 px-4 rounded-xl border border-[#e5dfd3] bg-white text-[#544b40] text-sm font-medium hover:border-[#c6212f] hover:text-[#c6212f] transition-colors flex items-center gap-2"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="7" y1="12" x2="17" y2="12" />
                      <line x1="10" y1="18" x2="14" y2="18" />
                    </svg>
                  </button>
                </div>

              </div>
            </div>

            {/* Filters */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 transition-all duration-300 ease-in-out ${showFilters ? "opacity-100 mt-2 pointer-events-auto" : "opacity-0 pointer-events-none h-0 overflow-hidden"
                }`}
            >

              {/* Status */}
              <div>
                <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8e8576]">
                  Status
                </label>
                <CustomSelect
                  name="status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  placeholder="All Status"
                  options={[
                    { value: "", label: "All Status" },
                    { value: "available", label: "Available" },
                    { value: "assigned", label: "Assigned" },
                    { value: "return_requested", label: "Return Requested" },
                    { value: "in_repair", label: "In Repair" },
                    { value: "damaged", label: "Damaged" },
                    { value: "lost", label: "Lost" },
                    { value: "retired", label: "Retired" },
                  ]}
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8e8576]">
                  Condition
                </label>
                <CustomSelect
                  name="condition"
                  value={conditionFilter}
                  onChange={(e) => {
                    setConditionFilter(e.target.value);
                    setPage(1);
                  }}
                  placeholder="All Condition"
                  options={[
                    { value: "", label: "All Condition" },
                    { value: "new", label: "New" },
                    { value: "good", label: "Good" },
                    { value: "fair", label: "Fair" },
                    { value: "damaged", label: "Damaged" },
                  ]}
                />
              </div>


              {/* Purchase Date */}
              <div>
                <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8e8576]">
                  Purchase Date
                </label>

                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => {
                    setPurchaseDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-11 rounded-xl border border-[#e5dfd3] bg-white px-3 text-sm text-[#544b40] outline-none focus:border-[#c6212f]"
                />
              </div>

              {/* Warranty Expiry */}
              <div>
                <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8e8576]">
                  Warranty Expiry
                </label>

                <input
                  type="date"
                  value={warrantyExpiry}
                  onChange={(e) => {
                    setWarrantyExpiry(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-11 rounded-xl border border-[#e5dfd3] bg-white px-3 text-sm text-[#544b40] outline-none focus:border-[#c6212f]"
                />
              </div>


            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm ">
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "18%" }} />
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
                  Assign To
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
                      <Sk w="60%" />
                    </td>

                    <td className="px-4">
                      <Sk w="50%" />
                    </td>

                    <td className="px-4">
                      <Sk w="50%" />
                    </td>

                    <td className="px-4">
                      <Sk w="60%" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr style={{ height: bodyH }}>
                  <td colSpan={8} className="text-center align-middle">
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
                      <td className="px-4 text-[13px] text-[#544b40] truncate text-center">
                        {asset.assignedTo?.name || "—"}
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
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/assets/${asset._id}/edit`}
                            className="p-1.5 rounded-lg text-[#8e8576] hover:text-[#c6212f] hover:bg-[#c6212f]/8 transition-colors"
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
                          <Link
                            href={`/assets/${asset._id}/history`}
                            className="p-1.5 rounded-lg text-[#8e8576] hover:text-[#c6212f] hover:bg-[#c6212f]/8 transition-colors"
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
                            onClick={() => openAssignModal(asset._id)}
                            className="p-1.5 rounded-lg text-[#8e8576] hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Assign Asset"
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
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="8.5" cy="7" r="4" />
                              <line x1="20" y1="8" x2="20" y2="14" />
                              <line x1="17" y1="11" x2="23" y2="11" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleForceReturn(asset._id)}
                            className="p-1.5 rounded-lg text-[#8e8576] hover:text-orange-600 hover:bg-orange-50 transition-colors"
                            title="Force Return"
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
                              <path d="M3 12a9 9 0 1 0 3-6.7" />
                              <polyline points="3 3 3 9 9 9" />
                              <path d="M12 8v4l3 3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(asset._id)}
                            disabled={deleting === asset._id}
                            className="p-1.5 rounded-lg text-[#8e8576] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
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
                <span key={`e-${i}`} className="px-1.5 text-xs text-[#8e8576]">
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
      {
        assignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setAssignModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold mb-5">Assign Asset</h2>

              {usersLoading ? (
                <div className="h-12 rounded-lg bg-black/6 animate-pulse mb-5" />
              ) : (
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-5"
                >
                  <option value="">Select User</option>

                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setAssignModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAssignAsset}
                  disabled={assigning}
                  className="px-4 py-2 bg-[#C6212F] text-white rounded-lg disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
