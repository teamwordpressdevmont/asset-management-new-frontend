"use client";
import { useState, useRef, useEffect } from "react";

const ChevronIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function CustomSelect({
    name,
    value,
    onChange,
    options = [],
    placeholder = "Select…",
    icon = null,
    error = false,
    disabled = false,
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));

    useEffect(() => {
        const close = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const handleSelect = (optValue) => {
        onChange({ target: { name, value: optValue } });
        setOpen(false);
    };

    const triggerClass = [
        "w-full flex items-center gap-2.5 px-3.5 bg-[#fbf8f2] border rounded-[10px] transition-all duration-200 shadow-sm h-[46px]",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-[#c6c0b5]",
        error
            ? "border-[#c6212f] shadow-[0_0_0_3px_rgba(198,33,47,0.08)]"
            : open
                ? "border-[#c6212f] shadow-[0_0_0_3px_rgba(198,33,47,0.08)]"
                : "border-[#e5dfd3]",
    ].join(" ");

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button type="button" disabled={disabled} onClick={() => !disabled && setOpen(p => !p)} className={triggerClass}>
                {icon && (
                    <span className="text-[#8e8576] grid place-items-center shrink-0">
                        {icon}
                    </span>
                )}
                <span className={`text-sm flex-1 text-left truncate ${selected ? "text-[#15100B]" : "text-[#8e8576]"}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className={`text-[#8e8576] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}>
                    <ChevronIcon />
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#e5dfd3] rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.10)] overflow-hidden">
                    <ul className="max-h-52 overflow-y-auto styled-scrollbar">
                        {options.length === 0 ? (
                            <li className="px-3.5 py-2.5 text-sm text-[#8e8576] text-center">No options</li>
                        ) : options.map(opt => {
                            const isSelected = String(opt.value) === String(value);
                            return (
                                <li key={opt.value}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={[
                                            "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left transition-colors duration-150",
                                            isSelected
                                                ? "bg-[#c6212f]/8 text-[#c6212f] font-semibold"
                                                : "text-[#15100B] hover:bg-[#fbf8f2] hover:text-[#c6212f]",
                                        ].join(" ")}>
                                        <span>{opt.label}</span>
                                        {isSelected && (
                                            <span className="shrink-0 text-[#c6212f]">
                                                <CheckIcon />
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
