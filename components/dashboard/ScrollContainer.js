"use client";
import { useRef, useState, useEffect } from "react";

export default function ScrollContainer({ children }) {
    const scrollRef = useRef(null);
    const contentRef = useRef(null);
    const [hasScrollbar, setHasScrollbar] = useState(false);

    useEffect(() => {
        const el = scrollRef.current;
        const content = contentRef.current;
        if (!el || !content) return;
        const check = () => setHasScrollbar(el.scrollHeight > el.clientHeight);
        check();
        // observe content height — fires when children grow/shrink
        const ro = new ResizeObserver(check);
        ro.observe(content);
        // also observe container for window resize
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div className="ml-6 bg-white rounded-2xl shadow-lg p-6 w-full">
            <div
                ref={scrollRef}
                style={{ paddingRight: hasScrollbar ? "0.75rem" : "0" }}
            className="h-[calc(100vh-200px)] styled-scrollbar overflow-y-auto"
            >
                <div ref={contentRef} className="h-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
