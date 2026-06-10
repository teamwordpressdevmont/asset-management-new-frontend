"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { API } from "@/utlis/api";
import CustomSelect from "@/components/ui/CustomSelect";
import { getUser } from "@/utlis/auth";
function FieldSkeleton() {
  return (
    <div className="h-[46px] rounded-[10px] bg-black/6 animate-pulse w-full" />
  );
}

const CONDITION_OPTIONS = [
  { value: "new", label: "New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "damaged", label: "Damaged" },
];

const initialFormData = {
  title: "",
  companyId: "",
  categoryId: "",
  model: "",
  sku: "",
  serialNumber: "",
  purchaseDate: "",
  warrantyExpiry: "",
  cost: "",
  location: "",
  condition: "good",
  status: "available",
  assignedTo: "",
  barcode: "",
  qrCode: "",
  vendorId: "",
  lastMaintenanceDate: "",
  active: true,
};
const initialErrors = {
  title: "",
  categoryId: "",
  companyId: "",
};

function validate(data, isAdmin) {
  const e = {
    title: "",
    categoryId: "",
    companyId: "",
  };

  if (!data.title.trim()) e.title = "Asset title is required.";
  if (!data.categoryId) e.categoryId = "Category is required.";

  if (!isAdmin && !data.companyId) {
    e.companyId = "Company is required.";
  }

  return e;
}

const inputBase =
  "w-full text-[#15100B] text-sm py-3 px-0 bg-transparent flex-[1_1_0%] border-none outline-none placeholder-[#8e8576] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(251,248,242)]";
const wrapperBase =
  "flex items-center gap-2.5 py-0 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200 shadow-sm hover:border-[#c6c0b5]";
const wrapperNormal = `${wrapperBase} border-[#e5dfd3] focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)]`;
const wrapperError = `${wrapperBase} border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)]`;

const BuildingIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export default function AddAssetForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [authUser, setAuthUser] = useState(null);

  const isAdmin = authUser?.role?.name === "admin";

  useEffect(() => {
    const user = getUser();
    setAuthUser(user);
    if (user?.role?.name === "admin" && user?.companyId?._id) {
      setFormData((prev) => ({
        ...prev,
        companyId: user.companyId._id,
      }));
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [companiesRes, categoriesRes, vendorsRes] =
          await Promise.all([
            API.getCompanies({ limit: 100, status: "active" }),
            API.getAssetCategories({ limit: 100, status: "active" }),
            API.getVendors({ limit: 100, status: "active" }),
          ]);

        if (companiesRes.success) {
          setCompanies(companiesRes.message?.data ?? []);
        }

        if (categoriesRes.success) {
          setCategories(categoriesRes.message?.data ?? []);
        }

        if (vendorsRes.success) {
          setVendors(vendorsRes?.message?.data?.vendors ?? []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const hasError = (e) => Object.values(e).some(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (hasError(errs)) {
      setErrors(errs);
      return;
    }

    const res = await API.createAsset(formData);
    if (res.success) {
      toast.success(res.message?.message || "Asset created successfully!");
      router.push("/assets");
    } else {
      toast.error(res.message || "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-6 justify-between h-full"
      >
        <div className="flex flex-col gap-8">
          {/* Top bar */}
          <div className="flex items-center gap-5">
            <Link
              href="/assets"
              className="w-10 h-10 rounded-full bg-[#C6212F] flex items-center justify-center hover:bg-[#a81b27] transition-colors rotate-180"
              title="Back to list"
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
                  New Asset
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-[#15100B]">
                Add Asset
              </h1>
              <p className="text-xs text-[#8e8576] mt-0.5">
                Register a new asset in the system
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Asset Title */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  Asset Title <span className="text-[#c6212f]">*</span>
                </label>
                <div className={errors.title ? wrapperError : wrapperNormal}>
                  <span className="text-[#8e8576] grid place-items-center shrink-0">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Dell XPS 15"
                    className={inputBase}
                  />
                </div>
                {errors.title && <ErrorMsg text={errors.title} />}
              </div>
            )}

            {/* Category */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  Category <span className="text-[#c6212f]">*</span>
                </label>
                <CustomSelect
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  options={categories.map((c) => ({
                    value: c._id,
                    label: c.name,
                  }))}
                  placeholder="— Select category —"
                  error={!!errors.categoryId}
                  icon={
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  }
                />
                {errors.categoryId && <ErrorMsg text={errors.categoryId} />}
              </div>
            )}
            {/* Model */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  Model
                </label>
                <div className={wrapperNormal}>
                  <span className="text-[#8e8576] grid place-items-center shrink-0">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. XPS 9500"
                    className={inputBase}
                  />
                </div>
              </div>
            )}
            {/* SKU */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  SKU
                </label>
                <div className={wrapperNormal}>
                  <span className="text-[#8e8576] grid place-items-center shrink-0">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="4" y1="9" x2="20" y2="9" />
                      <line x1="4" y1="15" x2="20" y2="15" />
                      <line x1="10" y1="3" x2="8" y2="21" />
                      <line x1="16" y1="3" x2="14" y2="21" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g. SKU-0012"
                    className={inputBase}
                  />
                </div>
              </div>
            )}
            {/* Serial Number */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  Serial Number
                </label>
                <div className={wrapperNormal}>
                  <span className="text-[#8e8576] grid place-items-center shrink-0">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <line x1="7" y1="9" x2="17" y2="9" />
                      <line x1="7" y1="13" x2="13" y2="13" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="e.g. SN-4829301"
                    className={inputBase}
                  />
                </div>
              </div>
            )}

            {/* Cost */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  Cost
                </label>
                <div className={wrapperNormal}>
                  <span className="text-[#8e8576] grid place-items-center shrink-0">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </span>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={inputBase}
                  />
                </div>
              </div>
            )}
            {/* Purchase Date */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  Purchase Date
                </label>
                <div className={wrapperNormal}>
                  <span className="text-[#8e8576] grid place-items-center shrink-0">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className={`${inputBase} [color-scheme:light]`}
                  />
                </div>
              </div>
            )}

            {/* Warranty Expire Date */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  Warranty Expire Date
                </label>
                <div className={wrapperNormal}>
                  <span className="text-[#8e8576] grid place-items-center shrink-0">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    name="warrantyExpiry"
                    value={formData.warrantyExpiry}
                    onChange={handleChange}
                    className={`${inputBase} [color-scheme:light]`}
                  />
                </div>
              </div>
            )}

            {/* Vendor */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  Vendor
                </label>
                <CustomSelect
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  options={vendors.map((v) => ({
                    value: v._id,
                    label: v.name,
                  }))}
                  placeholder="— Select vendor —"
                  icon={
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  }
                />
              </div>
            )}

            {/* Location */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  Location
                </label>
                <div className={wrapperNormal}>
                  <span className="text-[#8e8576] grid place-items-center shrink-0">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Office Floor 2, Desk 14"
                    className={inputBase}
                  />
                </div>
              </div>
            )}

            {/* Condition */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              <div>
                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                  Condition
                </label>
                <CustomSelect
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  options={CONDITION_OPTIONS}
                  placeholder="— Select condition —"
                  icon={
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  }
                />
              </div>
            )}

            {/* Company */}
            {loading ? (
              <FieldSkeleton />
            ) : (
              !isAdmin && (
                <div>
                  <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                    Company
                  </label>
                  <CustomSelect
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    options={companies.map((c) => ({
                      value: c._id,
                      label: c.name,
                    }))}
                    placeholder="— Select company —"
                    icon={<BuildingIcon />}
                  />
                </div>
              )
            )}
          </div>

          {/* Status */}
          {loading ? (
            <FieldSkeleton />
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, active: !prev.active }))
                }
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shadow-inner ${formData.active ? "bg-[#C6212F]" : "bg-[#e5dfd3]"}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${formData.active ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
              <span className="text-[13px] font-medium text-[#544b40]">
                Active Status
                <span
                  className={`ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${formData.active ? "text-[#0e6641] bg-[#0e8050]/15" : "text-[#8e8576] bg-[#e5dfd3]"}`}
                >
                  {formData.active ? "Active" : "Inactive"}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-8 pt-6">
          <Link
            href="/assets"
            className="px-5 py-2.5 text-sm font-medium text-[#544b40] bg-[#fbf8f2] border border-[#e5dfd3] rounded-[10px] hover:border-[#c6c0b5] transition-colors mr-3"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#C6212F] rounded-[10px] hover:bg-[#a81b27] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_14px_rgba(198,33,47,0.3)] hover:shadow-[0_6px_20px_rgba(198,33,47,0.45)] disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px] min-h-[42px] flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin mr-2"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                Save Asset
                <svg
                  className="ml-2"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12H19M13 6L19 12L13 18" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function ErrorMsg({ text }) {
  return (
    <p className="flex items-center gap-1 mt-1.5 text-[11px] text-[#c6212f]">
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {text}
    </p>
  );
}
