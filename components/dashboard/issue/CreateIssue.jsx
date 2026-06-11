"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { API } from "@/utlis/api";
import CustomSelect from "@/components/ui/CustomSelect";

const ISSUE_TYPE_OPTIONS = [
  { value: "damage", label: "Damage" },
  { value: "lost", label: "Lost" },
  { value: "malfunction", label: "Malfunction" },
  { value: "faulty", label: "Faulty" },
  { value: "inefficient", label: "Inefficient" },
  { value: "inferior", label: "Inferior" },
  { value: "performance", label: "Performance" },
  { value: "other", label: "Other" },
];

const inputBase =
  "w-full text-[#15100B] text-sm py-3 px-0 bg-transparent border-none outline-none placeholder-[#8e8576]";

const wrapperBase =
  "flex items-center gap-2.5 py-0 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200";

const wrapperNormal = `${wrapperBase} border-[#e5dfd3] focus-within:border-[#c6212f]`;
const wrapperError = `${wrapperBase} border-[#c6212f]`;

function validate(data) {
  const errors = {};

  if (!data.assetId) {
    errors.assetId = "Asset is required";
  }

  if (!data.type) {
    errors.type = "Issue type is required";
  }

  if (!data.description.trim()) {
    errors.description = "Description is required";
  }

  return errors;
}

function FieldSkeleton() {
  return (
    <div className="h-[46px] rounded-[10px] bg-black/5 animate-pulse w-full" />
  );
}

export default function CreateIssue() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [assets, setAssets] = useState([]);

  const [formData, setFormData] = useState({
    assetId: "",
    type: "",
    issueStartAt: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    assetId: "",
    type: "",
    issueStartAt: "",
    description: "",
  });

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await API.getAssets({ limit: 100, myAssets: true });
        if (res?.success) {
          console.log(res);
          setAssets(res?.message?.data || []);
        } else {
          toast.error(res?.message || "Failed to load assets");
        }
      } catch (error) {
        toast.error("Failed to load assets");
      } finally {
        setFetching(false);
      }
    };

    fetchAssets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(formData);

    function validate(data) {
      const errors = {};
      if (!data.assetId) errors.assetId = "Asset is required";
      if (!data.type) errors.type = "Issue type is required";
      if (!data.issueStartAt)
        errors.issueStartAt = "Issue start date is required";
      if (!data.description.trim())
        errors.description = "Description is required";
      return errors;
    }

    try {
      setLoading(true);

      const payload = {
        assetId: formData.assetId,
        type: formData.type,
        description: formData.description,
        issueStartAt: formData.issueStartAt,
      };

      // Replace with your actual API
      const res = await API.createIssue(payload);
      if (res?.success) {
        toast.success("Issue reported successfully");
        router.push("/issue");
      } else {
        toast.error(res?.message || "Failed to submit issue");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      {" "}
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Header */}{" "}
        <div className="flex items-center gap-5">
          {" "}
          <Link
            href="/issue"
            className="w-10 h-10 rounded-full bg-[#C6212F] flex items-center justify-center rotate-180"
          >
            {" "}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              {" "}
              <path d="M5 12h14M12 5l7 7-7 7" />{" "}
            </svg>{" "}
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-px bg-[#c6212f]" />
              <span className="text-xs text-[#c6212f] font-semibold uppercase">
                Asset Issue
              </span>
            </div>

            <h1 className="text-2xl font-semibold text-[#15100B]">
              Report Asset Issue
            </h1>

            <p className="text-xs text-[#8e8576]">
              Create a new asset issue report
            </p>
          </div>
        </div>
        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Asset */}
          <div>
            <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
              Asset <span className="text-[#c6212f]">*</span>
            </label>

            {fetching ? (
              <FieldSkeleton />
            ) : (
              <>
                <CustomSelect
                  name="assetId"
                  value={formData.assetId}
                  onChange={handleChange}
                  options={assets.map((asset) => ({
                    value: asset._id,
                    label: asset.title,
                  }))}
                  placeholder="— Select Asset —"
                  error={!!errors.assetId}
                />

                {errors.assetId && <ErrorMsg text={errors.assetId} />}
              </>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
              Issue Type <span className="text-[#c6212f]">*</span>
            </label>

            {fetching ? (
              <FieldSkeleton />
            ) : (
              <>
                <CustomSelect
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={ISSUE_TYPE_OPTIONS}
                  placeholder="— Select Issue Type —"
                  error={!!errors.type}
                />

                {errors.type && <ErrorMsg text={errors.type} />}
              </>
            )}
          </div>
          {fetching ? (
            <FieldSkeleton />
          ) : (
            <div>
              <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
                Issue Start Date <span className="text-[#c6212f]">*</span>
              </label>

              <div
                className={errors.issueStartAt ? wrapperError : wrapperNormal}
              >
                <input
                  type="date"
                  name="issueStartAt"
                  value={formData.issueStartAt}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              {errors.issueStartAt && <ErrorMsg text={errors.issueStartAt} />}
            </div>
          )}
        </div>
        {/* Description */}
        <div>
          <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">
            Description <span className="text-[#c6212f]">*</span>
          </label>
          {fetching ? (
            <FieldSkeleton />
          ) : (
            <div className={errors.description ? wrapperError : wrapperNormal}>
              <textarea
                rows={6}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue..."
                className={`${inputBase} resize-none`}
              />
            </div>
          )}

          {errors.description && <ErrorMsg text={errors.description} />}
        </div>
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/asset-issues"
            className="px-5 py-2.5 text-sm font-medium text-[#544b40] bg-[#fbf8f2] border border-[#e5dfd3] rounded-[10px]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#C6212F] rounded-[10px] disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Issue"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ErrorMsg({ text }) {
  return (
    <p className="flex items-center gap-1 mt-1.5 text-[11px] text-[#c6212f]">
      {" "}
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        {" "}
        <circle cx="12" cy="12" r="10" /> <path d="M12 8v4M12 16h.01" />{" "}
      </svg>
      {text}{" "}
    </p>
  );
}
