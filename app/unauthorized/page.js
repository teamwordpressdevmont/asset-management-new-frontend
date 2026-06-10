import Link from "next/link";

export const metadata = { title: "Unauthorized — Asset." };

export default function UnauthorizedPage() {
    return (
        <div className="flex items-center justify-center min-h-[88vh]">
            <div className="w-full max-w-[420px]">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8 fade-up fade-up-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-linear-to-br from-[#E87030] to-[#C04E18] shadow-[0_8px_24px_rgba(192,78,24,0.35)]">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M3 7h18M3 12h12M3 17h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                            <rect x="15" y="14" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.85" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Asset.</h1>
                    <p className="text-sm text-gray-500 mt-1">Access Denied</p>
                </div>

                {/* Card */}
                <div className="glass-panel px-8 py-10 fade-up fade-up-2">
                    <div className="flex flex-col items-center text-center gap-5">

                        {/* Icon */}
                        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#E87030]/10 border border-[#E87030]/25">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="stroke-[#E87030]">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>

                        {/* Text */}
                        <div className="space-y-1.5">
                            <h2 className="text-lg font-bold text-gray-800">403 — Unauthorized</h2>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                You don&apos;t have permission to access this page. Contact your administrator if you believe this is a mistake.
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-black/5" />

                        {/* Actions */}
                        <div className="flex flex-col w-full gap-2.5">
                            <Link href="/dashboard" className="btn-primary text-center">
                                Go to Dashboard
                            </Link>
                            <Link
                                href="/login"
                                className="w-full py-3 rounded-xl text-sm font-medium text-[#E87030] hover:text-[#C04E18] hover:bg-[#E87030]/5 transition-all text-center"
                            >
                                Sign in with a different account
                            </Link>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-gray-400 mt-6 fade-up fade-up-3">
                    © {new Date().getFullYear()} AssetVault ·{" "}
                    <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a> ·{" "}
                    <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
                </p>

            </div>
        </div>
    );
}
