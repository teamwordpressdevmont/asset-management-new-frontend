"use client";
import { API } from "@/utlis/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { setAuthData } from "@/utlis/auth";
import Link from "next/link";
import Image from "next/image";

const initialFormData = {
  email: "",
  password: "",
  remember: false,
};

const initialErrors = {
  email: "",
  password: "",
};

function validate(formData) {
  const errors = { email: "", password: "" };

  if (!formData.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!formData.password) {
    errors.password = "Password is required.";
  } else if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    if (validationErrors.email || validationErrors.password) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const res = await API.login({
      email: formData.email,
      password: formData.password,
    });

    if (res.success) {
      setAuthData({
        token: res.message.data.token,
        user: res.message.data.user,
        rememberMe: formData.remember,
      });
      toast.success(res.message.message || "Logged in successfully!");
      router.push("/dashboard");
    } else {
      toast.error(res.message || "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="wrapper flex flex-col items-center justify-between min-h-screen max-w-7xl mx-auto">
        <div className="header w-full mt-10 text-right flex items-center justify-end gap-4">
          <div className="tag bg-[#0e8050]/20 text-[#0e6641] py-1 px-3 rounded-3xl font-semibold text-xs flex items-center gap-1">
            <div className="pulse w-1.5 h-1.5 rounded-full bg-[#0e6641]"></div>
            All systems operational
          </div>
          <Link
            href="#"
            className="text-sm text-[#544b40] hover:text-gray-800 transition-colors duration-200"
          >
            Need Help?
          </Link>
        </div>

        <div className="loginForm flex flex-col gap-6 items-center justify-center">
          <div className="logo">
            <Image
              src="/logo.png"
              alt="Asset Management System Logo"
              width={1000}
              height={1000}
              className="w-34 h-24"
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 min-w-110 bg-white shadow-lg p-8 rounded-2xl"
          >
            <div className="headings flex items-center gap-2">
              <p className="w-4.5 h-px bg-[#c6212f]"></p>
              <p className="text-xs text-[#c6212f] font-semibold">SIGN IN</p>
            </div>
            <div className="headings flex items-center gap-2">
              <p className="text-black font-semibold text-3xl">Welcome Back</p>
            </div>
            <p className="text-xs text-black -mt-2">
              Sign in to your Asset workspace.
            </p>

            <div className="formData">
              {/* Email field */}
              <div className="fieldGroup">
                <label className="font-semibold mb-2 text-[12px] text-[#544b40]">
                  Work email
                </label>
                <div
                  className={`field flex items-center mt-2 gap-2.5 py-0 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200 shadow-sm hover:border-[#c6c0b5] focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)] ${errors.email ? "border-[#c6212f]" : "border-[#e5dfd3]"}`}
                >
                  <span className="text-[#8e8576] grid place-items-center flex-shrink-0">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 7 L12 13 L21 7 M3 7 V17 a2 2 0 0 0 2 2 H19 a2 2 0 0 0 2 -2 V7 a2 2 0 0 0 -2 -2 H5 a2 2 0 0 0 -2 2 Z" />
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
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="fieldGroup mt-6">
                <div className="flex items-end justify-between mt-4">
                  <label className="font-semibold text-[12px] text-[#544b40]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#c6212f] font-semibold no-underline hover:text-[#a81b27] transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div
                  className={`field flex items-center mt-2 gap-2.5 py-0 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200 shadow-sm hover:border-[#c6c0b5] focus-within:border-[#c6212f] focus-within:shadow-[0_0_0_3px_rgba(198,33,47,0.08)] ${errors.password ? "border-[#c6212f]" : "border-[#e5dfd3]"}`}
                >
                  <span className="text-[#8e8576] grid place-items-center flex-shrink-0">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 11V7a5 5 0 0 1 10 0v4M5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9z" />
                    </svg>
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full text-[#8e8576] text-[16px] py-3 px-0 bg-transparent flex-[1_1_0%] border-none outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(251,248,242)]"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    className="bg-transparent p-1 text-[#8e8576] hover:text-[#c6212f] cursor-pointer grid place-items-center transition-colors duration-200 flex-shrink-0"
                  >
                    {showPassword ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[#c6212f] text-[11px] mt-1.5 flex items-center gap-1">
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
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="fieldGroup mt-6">
                <label className="flex items-center gap-2.5 mt-4 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span
                    className={`w-4.5 h-4.5 rounded-[5px] border grid place-items-center flex-shrink-0 transition-all duration-200 ${formData.remember ? "bg-[#C6212F] border-[#C6212F]" : "bg-white border-[#e5dfd3] group-hover:border-[#C6212F]"}`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-opacity duration-150 ${formData.remember ? "opacity-100" : "opacity-0"}`}
                    >
                      <path d="M5 12 L10 17 L20 7" />
                    </svg>
                  </span>
                  <span className="text-[13px] text-[#15100B] group-hover:text-[#544b40] transition-colors duration-200">
                    Keep me signed in for 30 days
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full mt-5.5 px-4 py-3.25 bg-[#C6212F] hover:bg-[#a81b27] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-[10px] text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(198,33,47,0.3)] hover:shadow-[0_6px_20px_rgba(198,33,47,0.45)] transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <path d="M5 12H19M13 6L19 12L13 18" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="footer mb-10 w-full">
          <div className="wrapper flex items-center justify-between">
            <p className="text-sm text-[#8e8576]">
              &copy; {new Date().getFullYear()} Asset. All rights reserved.
            </p>
            <div className="terms flex items-center gap-4">
              <Link
                href="#"
                className="text-sm text-[#8e8576] hover:text-gray-800 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-sm text-[#8e8576] hover:text-gray-800 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
