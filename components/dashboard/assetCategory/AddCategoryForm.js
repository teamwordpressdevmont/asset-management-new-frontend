"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { API } from "@/utlis/api";
import { getUser } from "@/utlis/auth";
import CustomSelect from "@/components/ui/CustomSelect";
import CancelButton from "@/components/ui/CancelButton";

const initialFormData = { name: "", company_id: "", active: true };
const initialErrors = { name: "", company_id: "" };

function validate(data, isAdmin) {
    const e = { name: "", company_id: "" };
    if (!data.name.trim()) e.name = "Category name is required.";
    if (!isAdmin && !data.company_id) e.company_id = "Company is required.";
    return e;
}

const inputBase = "w-full text-[#15100B] text-sm py-3 px-0 bg-transparent flex-[1_1_0%] border-none outline-none placeholder-[#8e8576] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(251,248,242)]";
const wrapperBase = "flex items-center gap-2.5 py-0 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200 shadow-sm hover:border-[#c6c0b5]";
const wrapperNormal = `${wrapperBase} border-[#e5dfd3] focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)]`;
const wrapperError = `${wrapperBase} border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)]`;

const BuildingIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

export default function AddCategoryForm() {
    const router = useRouter();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [authUser, setAuthUser] = useState(null);

    const isAdmin = authUser?.role?.name === "admin";

    useEffect(() => {
        const user = getUser();
        setAuthUser(user);
        if (user?.role?.name === "admin" && user?.companyId?._id) {
            setFormData(prev => ({ ...prev, company_id: user.companyId._id }));
        }
        API.getCompanies({ limit: 100, status: "active" }).then(res => {
            if (res.success) setCompanies(res.message?.data ?? []);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const hasError = (e) => Object.values(e).some(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(formData, isAdmin);
        if (hasError(errs)) { setErrors(errs); return; }
        setLoading(true);

        const payload = {
            name: formData.name,
            companyId: formData.company_id,
            status: formData.active ? "active" : "inactive",
        };

        const res = await API.createAssetCategory(payload);
        if (res.success) {
            toast.success(res.message?.message || "Category created successfully!");
            router.push("/assets-category");
        } else {
            toast.error(res.message || "Something went wrong.");
        }
        setLoading(false);
    };

    return (
        <div className="w-full h-full flex flex-col relative">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 justify-between h-full">

                <div className="flex flex-col gap-8">
                    {/* Top bar */}
                    <div className="flex items-center gap-5 mb-8">
                        <Link href="/assets-category" className="w-10 h-10 rounded-full bg-[#C6212F] flex items-center justify-center hover:bg-[#a81b27] transition-colors rotate-180" title="Back to list">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-4.5 h-px bg-[#c6212f]" />
                                <span className="text-xs text-[#c6212f] font-semibold tracking-widest uppercase">New Category</span>
                            </div>
                            <h1 className="text-2xl font-semibold text-[#15100B]">Add Asset Category</h1>
                            <p className="text-xs text-[#8e8576] mt-0.5">Create a new category for organizing assets</p>
                        </div>
                    </div>

                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                            {/* Category Name */}
                            <div>
                                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Category Name <span className="text-[#c6212f]">*</span></label>
                                <div className={errors.name ? wrapperError : wrapperNormal}>
                                    <span className="text-[#8e8576] grid place-items-center shrink-0">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                                            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                                        </svg>
                                    </span>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Laptops & Computers" className={inputBase} />
                                </div>
                                {errors.name && <ErrorMsg text={errors.name} />}
                            </div>

                            {/* Company — hidden for admin */}
                            {!isAdmin && (
                                <div>
                                    <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Company <span className="text-[#c6212f]">*</span></label>
                                    <CustomSelect
                                        name="company_id"
                                        value={formData.company_id}
                                        onChange={handleChange}
                                        options={companies.map(c => ({ value: c._id, label: c.name }))}
                                        placeholder="— Select company —"
                                        error={!!errors.company_id}
                                        icon={<BuildingIcon />}
                                    />
                                    {errors.company_id && <ErrorMsg text={errors.company_id} />}
                                </div>
                            )}
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center gap-3 mt-6">
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shadow-inner ${formData.active ? "bg-[#C6212F]" : "bg-[#e5dfd3]"}`}>
                                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${formData.active ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                            <span className="text-[13px] font-medium text-[#544b40]">
                                Active Status
                                <span className={`ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${formData.active ? "text-[#0e6641] bg-[#0e8050]/15" : "text-[#8e8576] bg-[#e5dfd3]"}`}>
                                    {formData.active ? "Active" : "Inactive"}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end mt-8 pt-6">
                    <CancelButton />
                    <button type="submit" disabled={loading}
                        className="cursor-pointer gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#C6212F] rounded-[10px] hover:bg-[#a81b27] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_14px_rgba(198,33,47,0.3)] hover:shadow-[0_6px_20px_rgba(198,33,47,0.45)] disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px] min-h-[42px] flex items-center justify-center">
                        {loading ? (
                            <><svg className="animate-spin mr-2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
                        ) : (
                            <>Save Category</>
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
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {text}
        </p>
    );
}
