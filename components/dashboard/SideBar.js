"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, ROLES } from "@/utlis/navLinks";
import { getUser } from "@/utlis/auth";
import { useState, useEffect, useRef } from 'react';
import Image from "next/image";

function canSee(item, userRole) {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
}

export default function SideBar() {
    const pathname = usePathname();
    const [userRole, setUserRole] = useState(null);
    const navRef = useRef(null);
    const [hasScrollbar, setHasScrollbar] = useState(false);

    useEffect(() => {
        setUserRole(getUser()?.role?.name ?? null);
    }, []);

    // Track which parent items are expanded
    const [expanded, setExpanded] = useState({});

    // Auto-expand parent if a child route is currently active
    useEffect(() => {
        const autoExpand = {};
        NAV_LINKS.forEach((group) => {
            group.items.forEach((item) => {
                if (item.children?.some((c) => matchesPath(pathname, c.href))) {
                    autoExpand[item.href] = true;
                }
            });
        });
        setExpanded(autoExpand);
    }, [pathname]);

    const matchesPath = (current, href) => {
        const base = href.endsWith('/') ? href.slice(0, -1) : href;
        return current === base || current.startsWith(base + '/');
    };

    const isActive = (href) => pathname === href;

    const isChildActive = (item) => item.children?.some((c) => matchesPath(pathname, c.href));

    const toggleExpand = (href) => {
        setExpanded((prev) => ({ ...prev, [href]: !prev[href] }));
    };

    useEffect(() => {
        const el = navRef.current;

        const checkScrollbar = () => {
            if (el) {
                setHasScrollbar(el.scrollHeight > el.clientHeight);
            }
        };

        checkScrollbar();

        // Recheck on resize
        window.addEventListener("resize", checkScrollbar);

        return () => window.removeEventListener("resize", checkScrollbar);
    }, []);

    return (
        <aside className="h-[calc(100vh-152px)] shadow-xl bg-white rounded-3xl flex flex-col w-62.5 shrink-0 py-6 px-4">
            {/* Nav */}
            <nav ref={navRef} className={`flex-1 min-h-0 overflow-y-auto flex flex-col gap-5 styled-scrollbar ${hasScrollbar ? "pr-3" : ""
                }`}>
                {NAV_LINKS.map((group) => {
                    const visibleItems = group.items.filter((item) => canSee(item, userRole));
                    if (!visibleItems.length) return null;
                    return (
                    <div key={group.section}>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-900/50 px-3 mb-2">
                            {group.section}
                        </p>
                        <ul className="flex flex-col gap-0.5">
                            {visibleItems.map((item) => {
                                const active = isActive(item.href);
                                const childActive = isChildActive(item);
                                const hasChildren = !!item.children?.length;
                                const isOpen = expanded[item.href] ?? false;

                                return (
                                    <li key={item.href}>
                                        {/* Parent item */}
                                        <div className={`rounded-lg transition-all duration-150
                                            ${active || childActive
                                                ? "bg-[#C6212F]"
                                                : "hover:bg-[#C6212F]/90!"
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                {/* If has children — button to toggle; else — Link */}
                                                {hasChildren ? (
                                                    <button
                                                        onClick={() => toggleExpand(item.href)}
                                                        className={`cursor-pointer flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-left ${active || childActive ? "text-white" : "text-black hover:text-white"} transition-colors`}
                                                    >
                                                        <span className={`shrink-0 transition-colors`}>
                                                            {item.icon}
                                                        </span>
                                                        <span className={`flex-1 ${active || childActive ? "font-semibold" : ""}`}>
                                                            {item.label}
                                                        </span>
                                                        {/* Chevron */}
                                                        <svg
                                                            width="13" height="13" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                                            className={`transition-transform duration-200 ${isOpen ? "rotate-180 " : ""}`}
                                                        >
                                                            <path d="M6 9l6 6 6-6" />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <Link href={item.href} className={`flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium transition-colors ${active ? "text-white" : "text-black hover:text-white"}`}>
                                                        <span className={`shrink-0 transition-colors`}>
                                                            {item.icon}
                                                        </span>
                                                        <span className={`flex-1 ${active ? "font-semibold" : ""}`}>
                                                            {item.label}
                                                        </span>
                                                        {active && (
                                                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white" />
                                                        )}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sub-menu */}
                                        {hasChildren && isOpen && (
                                            <ul className="mt-0.5 ml-9.5 flex flex-col gap-0.5 border-l-2 border-gray-200 pl-3">
                                                {item.children.map((child) => {
                                                    const childIsActive = isActive(child.href);
                                                    return (
                                                        <li key={child.href}>
                                                            <Link
                                                                href={child.href}
                                                                className={`flex items-center gap-2 py-1.5 text-xs font-medium transition-colors rounded-r-lg
                                                                    ${childIsActive
                                                                        ? "text-[#C6212F] font-semibold"
                                                                        : "text-gray-900/50 hover:text-black"
                                                                    }`}
                                                            >
                                                                <span className={`w-1 h-1 rounded-full shrink-0 transition-colors ${childIsActive ? "bg-[#C6212F]" : "bg-gray-900/50"}`} />
                                                                {child.label}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    );
                })}
            </nav>
        </aside>
    );
}
