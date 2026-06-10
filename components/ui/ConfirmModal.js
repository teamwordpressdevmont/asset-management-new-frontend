"use client";
import { useState, useEffect } from "react";

const ICONS = {
    warning: (
        <div className="w-14 h-14 rounded-full bg-[#c6212f]/10 flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C6212F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        </div>
    ),
    error: (
        <div className="w-14 h-14 rounded-full bg-[#c6212f]/10 flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C6212F" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
        </div>
    ),
    success: (
        <div className="w-14 h-14 rounded-full bg-[#0e8050]/10 flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0e8050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9 12l2 2 4-4"/>
            </svg>
        </div>
    ),
    info: (
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        </div>
    ),
};

export default function ConfirmModal({
    title,
    text,
    icon,
    showCancelButton = false,
    confirmButtonText = "OK",
    cancelButtonText = "Cancel",
    onConfirm,
    onCancel,
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const close = (confirmed) => {
        setVisible(false);
        setTimeout(() => (confirmed ? onConfirm() : onCancel()), 180);
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
                transition: "opacity 0.18s ease",
                opacity: visible ? 1 : 0,
            }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#15100B]/40 backdrop-blur-sm"
                onClick={() => showCancelButton && close(false)}
            />

            {/* Panel */}
            <div
                className="relative bg-white rounded-2xl border border-[#f0ebe3] shadow-2xl p-8 w-full max-w-sm mx-4 text-center"
                style={{
                    transition: "transform 0.18s ease, opacity 0.18s ease",
                    transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
                    opacity: visible ? 1 : 0,
                }}
            >
                {icon && ICONS[icon]}

                {title && (
                    <h2 className="text-[1.1rem] font-semibold text-[#15100B] mb-1.5 leading-snug">
                        {title}
                    </h2>
                )}
                {text && (
                    <p className="text-sm text-[#544b40] mb-6">{text}</p>
                )}

                <div className="flex items-center justify-center gap-3">
                    {showCancelButton && (
                        <button
                            onClick={() => close(false)}
                            className="cursor-pointer px-5 py-2.5 text-sm font-semibold text-[#544b40] bg-[#fbf8f2] border border-[#e5dfd3] rounded-[10px] hover:border-[#c6c0b5] hover:bg-[#f5f0e8] transition-all duration-200"
                        >
                            {cancelButtonText}
                        </button>
                    )}
                    <button
                        onClick={() => close(true)}
                        className="cursor-pointer px-5 py-2.5 text-sm font-semibold text-white bg-[#C6212F] rounded-[10px] hover:bg-[#a81b27] shadow-[0_4px_14px_rgba(198,33,47,0.3)] hover:shadow-[0_6px_20px_rgba(198,33,47,0.4)] transition-all duration-200"
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
}
