"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { API } from "@/utlis/api";
import Cookies from "js-cookie";

const initialFormData = { email: "" };
const initialErrors = { email: "" };

function validate(formData) {
    const errors = { email: "" };

    if (!formData.email.trim()) {
        errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address.";
    }

    return errors;
}

export default function ForgotPasswordForm() {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleChange = (e) => {
        setFormData({ email: e.target.value });
        if (errors.email) setErrors({ email: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate(formData);
        if (validationErrors.email) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        const res = await API.forgotPassword({ email: formData.email });

        if (res.success) {
            Cookies.set('fp_email', formData.email, { expires: 1 / 72 });
            toast.success(res.message.message || "Reset link sent!");
            setSent(true);
        } else {
            toast.error(res.message || "Something went wrong. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div className="wrapper flex flex-col items-center justify-between min-h-screen max-w-7xl mx-auto">
            {/* Header */}
            <div className="header w-full mt-10 text-right flex items-center justify-end gap-4">
                <div className="tag bg-[#0e8050]/20 text-[#0e6641] py-1 px-3 rounded-3xl font-semibold text-xs flex items-center gap-1">
                    <div className="pulse w-1.5 h-1.5 rounded-full bg-[#0e6641]"></div>
                    All systems operational
                </div>
                <Link href="#" className="text-sm text-[#544b40] hover:text-gray-800 transition-colors duration-200">Need Help?</Link>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-6 items-center justify-center">
                <div className="logo">
                    <Image
                        src="/logo-new.png"
                        alt="Asset Management System Logo"
                        width={94}
                        height={94}
                    />
                </div>

                <div className="flex flex-col gap-4 min-w-110 bg-white shadow-lg p-8 rounded-2xl">
                    <div className="flex items-center gap-2">
                        <p className="w-4.5 h-px bg-[#c6212f]"></p>
                        <p className="text-xs text-[#c6212f] font-semibold">RESET PASSWORD</p>
                    </div>

                    {sent ? (
                        /* Success state */
                        <>
                            <div className="flex items-center gap-2">
                                <p className="text-black font-semibold text-3xl">Check your inbox</p>
                            </div>
                            <p className="text-xs text-black -mt-2">We sent a reset link to your email address.</p>

                            <div className="flex flex-col items-center gap-4 py-4">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#c6212f]/10 border border-[#c6212f]/20">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 7 L12 13 L21 7 M3 7 V17 a2 2 0 0 0 2 2 H19 a2 2 0 0 0 2 -2 V7 a2 2 0 0 0 -2 -2 H5 a2 2 0 0 0 -2 2 Z" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-[#15100B]">Email sent to</p>
                                    <p className="text-sm text-[#c6212f] font-medium mt-0.5">{formData.email}</p>
                                </div>
                                <p className="text-xs text-[#8e8576] leading-relaxed text-center max-w-xs">
                                    We&apos;ve sent a password reset link. It may take a few minutes to arrive. Check your spam folder if you don&apos;t see it.
                                </p>
                            </div>

                            <button
                                onClick={() => { setSent(false); setFormData({ email: "" }); }}
                                className="cursor-pointer w-full px-4 py-3.25 border border-[#e5dfd3] hover:border-[#c6212f] hover:text-[#c6212f] text-[#544b40] rounded-[10px] text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 bg-[#fbf8f2] hover:bg-[#fff5f5]"
                            >
                                Try a different email
                            </button>

                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#544b40] hover:text-[#c6212f] transition-colors duration-200 -mt-1"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Back to Sign In
                            </Link>
                        </>
                    ) : (
                        /* Form state */
                        <>
                            <div className="flex items-center gap-2">
                                <p className="text-black font-semibold text-3xl">Forgot Password?</p>
                            </div>
                            <p className="text-xs text-black -mt-2">Enter your email and we&apos;ll send you a reset link.</p>

                            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                                <div className="fieldGroup">
                                    <label className="font-semibold mb-2 text-[12px] text-[#544b40]">Work email</label>
                                    <div className={`field flex items-center mt-2 gap-2.5 py-0 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200 shadow-sm hover:border-[#c6c0b5] focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)] ${errors.email ? "border-[#c6212f]" : "border-[#e5dfd3]"}`}>
                                        <span className="text-[#8e8576] grid place-items-center flex-shrink-0">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 7 L12 13 L21 7 M3 7 V17 a2 2 0 0 0 2 2 H19 a2 2 0 0 0 2 -2 H5 a2 2 0 0 0 -2 2 Z" />
                                            </svg>
                                        </span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@company.com"
                                            autoComplete="email"
                                            className="w-full text-[#8e8576] text-[16px] py-3 px-0 bg-transparent flex-[1_1_0%] border-none outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(251,248,242)]"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-[#c6212f] text-[11px] mt-1.5 flex items-center gap-1">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                                            </svg>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="cursor-pointer w-full mt-1.5 px-4 py-3.25 bg-[#C6212F] hover:bg-[#a81b27] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-[10px] text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(198,33,47,0.3)] hover:shadow-[0_6px_20px_rgba(198,33,47,0.45)] transition-all duration-200"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                            </svg>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12H19M13 6L19 12L13 18" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#544b40] hover:text-[#c6212f] transition-colors duration-200 mt-1"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                    </svg>
                                    Back to Sign In
                                </Link>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="footer mb-10 w-full">
                <div className="wrapper flex items-center justify-between">
                    <p className="text-sm text-[#8e8576]">
                        &copy; {new Date().getFullYear()} Asset. All rights reserved.
                    </p>
                    <div className="terms flex items-center gap-4">
                        <Link href="#" className="text-sm text-[#8e8576] hover:text-gray-800 transition-colors duration-200">Terms of Service</Link>
                        <Link href="#" className="text-sm text-[#8e8576] hover:text-gray-800 transition-colors duration-200">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
