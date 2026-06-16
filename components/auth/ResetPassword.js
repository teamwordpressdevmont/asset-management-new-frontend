"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { API } from "@/utlis/api";
import Cookies from "js-cookie";

const initialFormData = { password: "", confirmPassword: "" };
const initialErrors = { password: "", confirmPassword: "" };

function validate(formData) {
    const errors = { password: "", confirmPassword: "" };

    if (!formData.password) {
        errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
}

export default function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState(initialErrors);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate(formData);
        if (validationErrors.password || validationErrors.confirmPassword) {
            setErrors(validationErrors);
            return;
        }

        if (!token) {
            toast.error("Invalid or missing reset token. Please request a new reset link.");
            return;
        }

        setLoading(true);

        const res = await API.resetPassword({
            token,
            password: formData.password,
            password_confirmation: formData.confirmPassword,
        });

        if (res.success) {
            Cookies.remove("fp_email");
            toast.success(res.message?.message || "Password reset successfully!");
            setDone(true);
            setTimeout(() => router.push("/login"), 2500);
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
                        <p className="text-xs text-[#c6212f] font-semibold">NEW PASSWORD</p>
                    </div>

                    {done ? (
                        /* Success state */
                        <>
                            <div className="flex items-center gap-2">
                                <p className="text-black font-semibold text-3xl">All done!</p>
                            </div>
                            <p className="text-xs text-black -mt-2">Your password has been reset successfully.</p>

                            <div className="flex flex-col items-center gap-4 py-4">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#c6212f]/10 border border-[#c6212f]/20">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c6212f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <path d="M22 4L12 14.01l-3-3" />
                                    </svg>
                                </div>
                                <p className="text-xs text-[#8e8576] leading-relaxed text-center max-w-xs">
                                    You&apos;re being redirected to the sign in page. If it doesn&apos;t happen automatically, click below.
                                </p>
                            </div>

                            <Link
                                href="/login"
                                className="cursor-pointer w-full px-4 py-3.25 bg-[#C6212F] hover:bg-[#a81b27] active:scale-[0.98] text-white rounded-[10px] text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(198,33,47,0.3)] hover:shadow-[0_6px_20px_rgba(198,33,47,0.45)] transition-all duration-200"
                            >
                                <span>Go to Sign In</span>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12H19M13 6L19 12L13 18" />
                                </svg>
                            </Link>
                        </>
                    ) : (
                        /* Form state */
                        <>
                            <div className="flex items-center gap-2">
                                <p className="text-black font-semibold text-3xl">Set New Password</p>
                            </div>
                            <p className="text-xs text-black -mt-2">Choose a strong password for your account.</p>

                            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                                {/* New password */}
                                <div className="fieldGroup">
                                    <label className="font-semibold mb-2 text-[12px] text-[#544b40]">New password</label>
                                    <div className={`field flex items-center mt-2 gap-2.5 py-0 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200 shadow-sm hover:border-[#c6c0b5] focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)] ${errors.password ? "border-[#c6212f]" : "border-[#e5dfd3]"}`}>
                                        <span className="text-[#8e8576] grid place-items-center flex-shrink-0">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4M5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9z" />
                                            </svg>
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            className="w-full text-[#8e8576] text-[16px] py-3 px-0 bg-transparent flex-[1_1_0%] border-none outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(251,248,242)]"
                                        />
                                        <button
                                            type="button"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="bg-transparent p-1 text-[#8e8576] hover:text-[#c6212f] cursor-pointer grid place-items-center transition-colors duration-200 flex-shrink-0"
                                        >
                                            {showPassword ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-[#c6212f] text-[11px] mt-1.5 flex items-center gap-1">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                                            </svg>
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div className="fieldGroup">
                                    <label className="font-semibold mb-2 text-[12px] text-[#544b40]">Confirm password</label>
                                    <div className={`field flex items-center mt-2 gap-2.5 py-0 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200 shadow-sm hover:border-[#c6c0b5] focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)] ${errors.confirmPassword ? "border-[#c6212f]" : "border-[#e5dfd3]"}`}>
                                        <span className="text-[#8e8576] grid place-items-center flex-shrink-0">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4M5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9z" />
                                            </svg>
                                        </span>
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            className="w-full text-[#8e8576] text-[16px] py-3 px-0 bg-transparent flex-[1_1_0%] border-none outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(251,248,242)]"
                                        />
                                        <button
                                            type="button"
                                            aria-label={showConfirm ? "Hide password" : "Show password"}
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="bg-transparent p-1 text-[#8e8576] hover:text-[#c6212f] cursor-pointer grid place-items-center transition-colors duration-200 flex-shrink-0"
                                        >
                                            {showConfirm ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-[#c6212f] text-[11px] mt-1.5 flex items-center gap-1">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                                            </svg>
                                            {errors.confirmPassword}
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
                                            <span>Resetting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Reset Password</span>
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
