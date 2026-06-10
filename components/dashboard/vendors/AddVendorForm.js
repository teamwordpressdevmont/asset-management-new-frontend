"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { API } from "@/utlis/api";
import { getUser } from "@/utlis/auth";
import CustomSelect from "@/components/ui/CustomSelect";

const initialFormData = { name: "", email: "", phone: "", website: "", address: "", company_id: "" };
const initialErrors   = { name: "", email: "", company_id: "" };

function validate(data, isAdmin) {
    const e = { name: "", email: "", company_id: "" };
    if (!data.name.trim())  e.name  = "Vendor name is required.";
    if (!data.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Please enter a valid email address.";
    if (!isAdmin && !data.company_id) e.company_id = "Company is required.";
    return e;
}

const inputBase     = "w-full text-[#15100B] text-sm py-3 px-0 bg-transparent flex-[1_1_0%] border-none outline-none placeholder-[#8e8576] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(251,248,242)]";
const wrapperBase   = "flex items-center gap-2.5 py-0 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200 shadow-sm hover:border-[#c6c0b5]";
const wrapperNormal = `${wrapperBase} border-[#e5dfd3] focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)]`;
const wrapperError  = `${wrapperBase} border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)]`;

export default function AddVendorForm() {
    const router  = useRouter();
    const fileRef = useRef(null);

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors]     = useState(initialErrors);
    const [loading, setLoading]   = useState(false);
    const [preview, setPreview]   = useState(null);
    const [photo, setPhoto]       = useState(null);
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

    const handlePhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const clearPhoto = () => { setPhoto(null); setPreview(null); };

    const hasError = (e) => Object.values(e).some(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(formData, isAdmin);
        if (hasError(errs)) { setErrors(errs); return; }
        setLoading(true);

        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("email", formData.email);
        if (formData.phone)   payload.append("phone", formData.phone);
        if (formData.website) payload.append("website", formData.website);
        if (formData.address) payload.append("address", formData.address);
        if (formData.company_id) payload.append("companyId", formData.company_id);
        if (photo) payload.append("logo", photo);

        const res = await API.createVendor(payload);
        if (res.success) {
            toast.success(res.message?.message || "Vendor created successfully!");
            router.push("/vendors");
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
                    <div className="flex items-center gap-5">
                        <Link href="/vendors" className="w-10 h-10 rounded-full bg-[#C6212F] flex items-center justify-center hover:bg-[#a81b27] transition-colors rotate-180" title="Back to list">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-4.5 h-px bg-[#c6212f]" />
                                <span className="text-xs text-[#c6212f] font-semibold tracking-widest uppercase">New Vendor</span>
                            </div>
                            <h1 className="text-2xl font-semibold text-[#15100B]">Add Vendor</h1>
                            <p className="text-xs text-[#8e8576] mt-0.5">Register a new vendor in the system</p>
                        </div>
                    </div>

                    {/* Avatar upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <button type="button" onClick={() => !preview && fileRef.current?.click()}
                                className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors
                                    ${preview ? "border-[#c6212f] bg-white cursor-default" : "border-[#e5dfd3] bg-[#fbf8f2] hover:border-[#c6212f] cursor-pointer"}`}>
                                {preview ? (
                                    <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8e8576" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                        </svg>
                                        <span className="text-[10px] text-[#8e8576] font-medium">Upload</span>
                                    </div>
                                )}
                            </button>
                            <button type="button" onClick={preview ? clearPhoto : () => fileRef.current?.click()}
                                className={`absolute bottom-0 right-0 w-7 h-7 rounded-full border shadow-sm cursor-pointer flex items-center justify-center transition-colors
                                    ${preview ? "bg-[#c6212f] border-[#c6212f] hover:bg-[#a81b27]" : "bg-white border-[#e5dfd3] hover:border-[#c6212f]"}`}>
                                {preview ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8e8576" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                )}
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                        </div>
                        <p className="text-[11px] text-[#8e8576] mt-2">{preview ? "Click × to remove photo" : "Click to upload vendor logo"}</p>
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                        {/* Name */}
                        <div>
                            <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Vendor Name <span className="text-[#c6212f]">*</span></label>
                            <div className={errors.name ? wrapperError : wrapperNormal}>
                                <span className="text-[#8e8576] grid place-items-center shrink-0">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                </span>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. TechSupply Co." className={inputBase} />
                            </div>
                            {errors.name && <ErrorMsg text={errors.name} />}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Email <span className="text-[#c6212f]">*</span></label>
                            <div className={errors.email ? wrapperError : wrapperNormal}>
                                <span className="text-[#8e8576] grid place-items-center shrink-0">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 7 L12 13 L21 7 M3 7 V17 a2 2 0 0 0 2 2 H19 a2 2 0 0 0 2 -2 V7 a2 2 0 0 0 -2 -2 H5 a2 2 0 0 0 -2 2 Z" />
                                    </svg>
                                </span>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="vendor@example.com" className={inputBase} />
                            </div>
                            {errors.email && <ErrorMsg text={errors.email} />}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Phone</label>
                            <div className={wrapperNormal}>
                                <span className="text-[#8e8576] grid place-items-center shrink-0">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.34 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </span>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" className={inputBase} />
                            </div>
                        </div>

                        {/* Website */}
                        <div>
                            <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Website</label>
                            <div className={wrapperNormal}>
                                <span className="text-[#8e8576] grid place-items-center shrink-0">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                </span>
                                <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" className={inputBase} />
                            </div>
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
                                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>}
                                />
                                {errors.company_id && <ErrorMsg text={errors.company_id} />}
                            </div>
                        )}

                        {/* Address — full width */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Address</label>
                            <div className={wrapperNormal}>
                                <span className="text-[#8e8576] grid place-items-center shrink-0">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                    </svg>
                                </span>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter vendor address" className={inputBase} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end mt-8 pt-6">
                    <Link href="/vendors" className="px-5 py-2.5 text-sm font-medium text-[#544b40] bg-[#fbf8f2] border border-[#e5dfd3] rounded-[10px] hover:border-[#c6c0b5] transition-colors mr-3">
                        Cancel
                    </Link>
                    <button type="submit" disabled={loading}
                        className="cursor-pointer gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#C6212F] rounded-[10px] hover:bg-[#a81b27] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_14px_rgba(198,33,47,0.3)] hover:shadow-[0_6px_20px_rgba(198,33,47,0.45)] disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px] min-h-[42px] flex items-center justify-center">
                        {loading ? (
                            <><svg className="animate-spin mr-2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
                        ) : (
                            <>Save Vendor<svg className="ml-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12H19M13 6L19 12L13 18" /></svg></>
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
