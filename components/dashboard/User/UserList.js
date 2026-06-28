"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { API } from "@/utlis/api";
import { getUser } from "@/utlis/auth";
import toast from "react-hot-toast";
import MySwal from "@/utlis/swal";
import CustomSelect from "@/components/ui/CustomSelect";

const PER_PAGE = 9;
const ROW_H = 53;
const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL ?? "";

const ROLE_BADGE = {
  super_admin: { label: "Super Admin", cls: "text-[#7c3aed] bg-[#7c3aed]/10" },
  admin: { label: "Admin", cls: "text-[#c6212f] bg-[#c6212f]/10" },
  user: { label: "User", cls: "text-[#544b40] bg-[#e5dfd3]" },
};

function Avatar({ name, photo }) {
  return (
    <div className="relative w-8 h-8 shrink-0">
      {photo && (
        <img
          src={`${ASSET_URL}${photo}`}
          alt={name}
          className="absolute inset-0 w-full h-full rounded-full object-cover"
          onError={(e) => e.target.remove()}
        />
      )}
      <div className="w-8 h-8 rounded-full bg-[#c6212f]/10 border border-[#c6212f]/20 flex items-center justify-center text-xs font-bold text-[#c6212f] uppercase">
        {name?.[0] ?? "?"}
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const b = ROLE_BADGE[role] ?? ROLE_BADGE.user;
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${b.cls}`}
    >
      {b.label}
    </span>
  );
}

function StatusToggle({ active, loading, onToggle, disabled }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading || disabled}
      title={
        disabled
          ? "Cannot change own status"
          : active
            ? "Click to deactivate"
            : "Click to activate"
      }
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${active ? "bg-[#C6212F]" : "bg-[#e5dfd3]"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${active ? "translate-x-[18px]" : "translate-x-0.5"}`}
      />
    </button>
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

export default function UserList() {
  const currentUserId = getUser()?.id;
  const isSuperAdmin = getUser()?.role?.name === "super_admin";
  const colCount = isSuperAdmin ? 8 : 7;
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");


  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: PER_PAGE };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    const res = await API.getUsers(params);
    if (res.success) {
      const body = res.message;
      const rows = body?.data ?? [];
      const pg = body?.pagination ?? {};
      const total = pg.total ?? rows.length;
      const lastPage = Math.ceil(total / (pg.limit ?? PER_PAGE)) || 1;
      setUsers(rows);
      setPagination({ currentPage: page, lastPage, total });
    } else {
      toast.error(res.message || "Failed to load users.");
    }
    setLoading(false);
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Delete User?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    setDeleting(id);
    const res = await API.deleteUser(id);
    if (res.success) {
      toast.success("User deleted successfully.");
      fetchUsers();
    } else toast.error(res.message || "Delete failed.");
    setDeleting(null);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    setToggling(user._id);
    setUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u)),
    );
    const res = await API.updateUser(user._id, { status: newStatus });
    if (res.success) {
      toast.success(`User marked as ${newStatus}.`);
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, status: user.status } : u,
        ),
      );
      toast.error(res.message || "Status update failed.");
    }
    setToggling(null);
  };

  const { currentPage, lastPage, total } = pagination;
  const from = total === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const to = Math.min(currentPage * PER_PAGE, total);
  const bodyH = ROW_H * PER_PAGE;

  const pageNums = Array.from({ length: lastPage }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

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
          <h1 className="text-2xl font-semibold text-[#15100B]">Users</h1>
          <p className="text-xs text-[#8e8576] mt-0.5">
            {loading
              ? "Loading..."
              : `${total} user${total !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <Link
          href="/users/add"
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
          Add User
        </Link>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-[#f0ebe3]">
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
              placeholder="Search users..."
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
          <div className="flex items-center gap-3 ml-auto">
            <CustomSelect
              name="roleFilter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              placeholder="All Roles"
              options={[
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
              ]}
            />

            <CustomSelect
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              placeholder="All Status"
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />

            {(roleFilter || statusFilter) && (
              <button
                onClick={() => {
                  setRoleFilter("");
                  setStatusFilter("");
                  setPage(1);
                }}
                className="h-11 px-5 rounded-xl border border-[#f3c7cb] bg-white text-[#c6212f] text-sm font-medium hover:bg-[#fff5f6]"
              >
                Clear
              </button>
            )}
          </div>
          {/* <span className="text-xs text-[#8e8576] shrink-0 min-w-[120px] text-right">
            {!loading && total > 0 && (
              <>
                Showing{" "}
                <span className="font-semibold text-[#544b40]">
                  {from}–{to}
                </span>{" "}
                of <span className="font-semibold text-[#544b40]">{total}</span>
              </>
            )}
          </span> */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: isSuperAdmin ? "17%" : "21%" }} />
              <col style={{ width: isSuperAdmin ? "17%" : "21%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "10%" }} />
              {isSuperAdmin && <col style={{ width: "16%" }} />}
              <col style={{ width: "9%" }} />
              <col style={{ width: "7%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-[#f0ebe3] bg-[#fbf8f2]/80">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                  #
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                  Role
                </th>
                {isSuperAdmin && (
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                    Company
                  </th>
                )}
                <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-[#8e8576] uppercase tracking-wider">
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
                      <Sk w="60%" />
                    </td>
                    <td className="px-4">
                      <Sk w="55%" />
                    </td>
                    {isSuperAdmin && (
                      <td className="px-4">
                        <Sk w="65%" />
                      </td>
                    )}
                    <td className="px-4 text-center">
                      <Sk w="60%" />
                    </td>
                    <td className="px-4">
                      <Sk w="50%" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr style={{ height: bodyH }}>
                  <td colSpan={colCount} className="text-center align-middle">
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
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <p className="text-sm text-[#8e8576]">
                        {search
                          ? `No results for "${search}"`
                          : "No users found"}
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
                  {users.map((user, idx) => (
                    <tr
                      key={user._id}
                      style={{ height: ROW_H }}
                      className="hover:bg-[#fbf8f2]/60 transition-colors"
                    >
                      <td className="px-4 text-[12px] font-medium text-[#8e8576]">
                        {from + idx}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={user.name} photo={user.profileImage} />
                          <span className="font-medium text-[#15100B] truncate text-[13px]">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 text-[13px] text-[#544b40] truncate">
                        {user.email || (
                          <span className="text-[#c6c0b5]">—</span>
                        )}
                      </td>
                      <td className="px-4 text-[13px] text-[#544b40] truncate">
                        {user.phone || (
                          <span className="text-[#c6c0b5]">—</span>
                        )}
                      </td>
                      <td className="px-4">
                        <RoleBadge role={user.role?.name} />
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 text-[13px] text-[#544b40] truncate">
                          {user.companyId?.name || (
                            <span className="text-[#c6c0b5]">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 text-center">
                        <StatusToggle
                          active={user.status === "active"}
                          loading={toggling === user._id}
                          onToggle={() => handleToggleStatus(user)}
                          disabled={user._id === currentUserId}
                        />
                      </td>
                      <td className="px-4">
                        {user._id !== currentUserId && (
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/users/${user._id}/edit`}
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
                            <button
                              onClick={() => handleDelete(user._id)}
                              disabled={deleting === user._id}
                              className="p-1.5 rounded-lg text-[#8e8576] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                              title="Delete"
                            >
                              {deleting === user._id ? (
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
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length < PER_PAGE &&
                    [...Array(PER_PAGE - users.length)].map((_, i) => (
                      <tr key={`filler-${i}`} style={{ height: ROW_H }}>
                        <td colSpan={colCount} />
                      </tr>
                    ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#f0ebe3] min-h-[52px]">
          <p className="text-xs text-[#8e8576]">
            {!loading && lastPage > 0 && (
              <>
                Page{" "}
                <span className="font-semibold text-[#544b40]">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#544b40]">{lastPage}</span>
              </>
            )}
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
    </div>
  );
}
