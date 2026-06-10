"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { API } from "@/utlis/api";

const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL ?? "";

const initialErrors = { name: "", email: "", website: "", address: "" };

function validate(data) {
    const errors = { name: "", email: "", website: "", address: "" };
    if (!data.name.trim()) errors.name = "Company name is required.";
    if (!data.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Please enter a valid email address.";
    if (data.website && !/^https?:\/\/.+/.test(data.website)) errors.website = "Website must start with http:// or https://";
    return errors;
}

const inputBase = "w-full text-[#15100B] text-sm py-3 px-0 bg-transparent flex-[1_1_0%] border-none outline-none placeholder-[#8e8576] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(251,248,242)]";
const wrapperBase = "flex items-center gap-2.5 py-0 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200 shadow-sm hover:border-[#c6c0b5]";
const wrapperNormal = `${wrapperBase} border-[#e5dfd3] focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)]`;
const wrapperError = `${wrapperBase} border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)]`;

function FieldSkeleton() {
    return <div className="h-[46px] rounded-[10px] bg-black/6 animate-pulse w-full" />;
}

export default function EditCompanyForm({ id }) {
    const router = useRouter();
    const fileRef = useRef(null);

    const [formData, setFormData] = useState({ name: "", email: "", website: "", address: "", active: true });
    const [errors, setErrors] = useState(initialErrors);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [newLogo, setNewLogo] = useState(null);
    const [logoRemoved, setLogoRemoved] = useState(false);
    const [existingLogo, setExistingLogo] = useState(null);

    useEffect(() => {
        if (!id) return;
        (async () => {
            const res = await API.getSingleCompany(id);
            if (res.success) {
                const c = res.message?.data ?? res.message;
                setFormData({ name: c.name ?? "", email: c.email ?? "", website: c.website ?? "", address: c.address ?? "", active: c.status === "active" });
                if (c.logo) { setExistingLogo(c.logo); setPreview(`${ASSET_URL}${c.logo}`); }
            } else {
                toast.error(res.message || "Failed to load company.");
                router.push("/company");
            }
            setFetching(false);
        })();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewLogo(file); setPreview(URL.createObjectURL(file)); setLogoRemoved(false); e.target.value = "";
    };

    const clearLogo = () => { setNewLogo(null); setPreview(null); setLogoRemoved(!!existingLogo); };

    const hasError = (e) => Object.values(e).some(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(formData);
        if (hasError(errs)) { setErrors(errs); return; }
        setLoading(true);
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("email", formData.email);
        payload.append("website", formData.website);
        payload.append("address", formData.address);
        payload.append("status", formData.active ? "active" : "inactive");
        if (newLogo) payload.append("logo", newLogo);
        if (logoRemoved) payload.append("remove_logo", "1");
        const res = await API.updateCompany(id, payload);
        if (res.success) { toast.success(res.message?.message || "Company updated successfully!"); router.push("/company"); }
        else toast.error(res.message || "Something went wrong.");
        setLoading(false);
    };

    return (
        <div className="w-full h-full flex flex-col relative">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 justify-between h-full">

                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-5 mb-8">
                        <Link href="/company" className="w-10 h-10 rounded-full bg-[#C6212F] flex items-center justify-center hover:bg-[#a81b27] transition-colors rotate-180" title="Back to list">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-4.5 h-px bg-[#c6212f]" />
                                <span className="text-xs text-[#c6212f] font-semibold tracking-widest uppercase">Edit Company</span>
                            </div>
                            <h1 className="text-2xl font-semibold text-[#15100B]">Edit Company</h1>
                            <p className="text-xs text-[#8e8576] mt-0.5">Update the details for this company profile</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative">
                                <button type="button" onClick={() => !preview && fileRef.current?.click()}
                                    className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${preview ? "border-[#c6212f] bg-white cursor-default" : "border-[#e5dfd3] bg-[#fbf8f2] hover:border-[#c6212f] cursor-pointer"}`}>
                                    {fetching ? <div className="w-full h-full rounded-full bg-black/6 animate-pulse" /> : preview ? <img src={preview} alt="logo" className="w-full h-full object-cover" /> : (
                                        <div className="flex flex-col items-center gap-1">
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8e8576" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                            <span className="text-[10px] text-[#8e8576] font-medium">Upload</span>
                                        </div>
                                    )}
                                </button>
                                <button type="button" onClick={preview ? clearLogo : () => fileRef.current?.click()}
                                    className={`absolute bottom-0 right-0 w-7 h-7 rounded-full border shadow-sm cursor-pointer flex items-center justify-center transition-colors ${preview ? "bg-[#c6212f] border-[#c6212f] hover:bg-[#a81b27]" : "bg-white border-[#e5dfd3] hover:border-[#c6212f]"}`}>
                                    {preview ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8e8576" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                            </div>
                            <p className="text-[11px] text-[#8e8576] mt-2">{preview ? "Click × to remove logo" : "Click to upload company logo"}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Company Name <span className="text-[#c6212f]">*</span></label>
                                {fetching ? <FieldSkeleton /> : (<><div className={errors.name ? wrapperError : wrapperNormal}><span className="text-[#8e8576] grid place-items-center shrink-0"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg></span><input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter company name" className={inputBase} /></div>{errors.name && <ErrorMsg text={errors.name} />}</>)}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Email <span className="text-[#c6212f]">*</span></label>
                                {fetching ? <FieldSkeleton /> : (<><div className={errors.email ? wrapperError : wrapperNormal}><span className="text-[#8e8576] grid place-items-center shrink-0"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7 L12 13 L21 7 M3 7 V17 a2 2 0 0 0 2 2 H19 a2 2 0 0 0 2 -2 V7 a2 2 0 0 0 -2 -2 H5 a2 2 0 0 0 -2 2 Z" /></svg></span><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="company@example.com" className={inputBase} /></div>{errors.email && <ErrorMsg text={errors.email} />}</>)}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Website</label>
                                {fetching ? <FieldSkeleton /> : (<><div className={errors.website ? wrapperError : wrapperNormal}><span className="text-[#8e8576] grid place-items-center shrink-0"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg></span><input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" className={inputBase} /></div>{errors.website && <ErrorMsg text={errors.website} />}</>)}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1.5 text-[12px] text-[#544b40]">Address</label>
                                {fetching ? <FieldSkeleton /> : (<div className={wrapperNormal}><span className="text-[#8e8576] grid place-items-center shrink-0"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></span><input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter company address" className={inputBase} /></div>)}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                            {fetching ? <div className="h-6 w-11 rounded-full bg-black/6 animate-pulse" /> : (
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                                    className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shadow-inner ${formData.active ? "bg-[#C6212F]" : "bg-[#e5dfd3]"}`}>
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${formData.active ? "translate-x-6" : "translate-x-1"}`} />
                                </button>
                            )}
                            <span className="text-[13px] font-medium text-[#544b40]">Active Status
                                <span className={`ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${formData.active ? "text-[#0e6641] bg-[#0e8050]/15" : "text-[#8e8576] bg-[#e5dfd3]"}`}>{formData.active ? "Active" : "Inactive"}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-8 pt-6">
                    <Link href="/company" className="px-5 py-2.5 text-sm font-medium text-[#544b40] bg-[#fbf8f2] border border-[#e5dfd3] rounded-[10px] hover:border-[#c6c0b5] transition-colors mr-3">Cancel</Link>
                    <button type="submit" disabled={loading || fetching}
                        className="cursor-pointer gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#C6212F] rounded-[10px] hover:bg-[#a81b27] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_14px_rgba(198,33,47,0.3)] hover:shadow-[0_6px_20px_rgba(198,33,47,0.45)] disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px] min-h-[42px] flex items-center justify-center">
                        {loading ? <><svg className="animate-spin mr-2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Updating...</> : <>Update Company<svg className="ml-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12H19M13 6L19 12L13 18" /></svg></>}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ErrorMsg({ text }) {
    return (
        <p className="flex items-center gap-1 mt-1.5 text-[11px] text-[#c6212f]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
            {text}
        </p>
    );
}
