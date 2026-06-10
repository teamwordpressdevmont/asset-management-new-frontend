"use client";
import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
                    fontSize: "13px",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                },
                error: {
                    style: {
                        background: "#fff1f1",
                        color: "#b91c1c",
                        border: "1px solid #fecaca",
                    },
                    iconTheme: {
                        primary: "#ef4444",
                        secondary: "#fff",
                    },
                },
                success: {
                    style: {
                        background: "#f0fdf4",
                        color: "#15803d",
                        border: "1px solid #bbf7d0",
                    },
                    iconTheme: {
                        primary: "#22c55e",
                        secondary: "#fff",
                    },
                },
            }}
        />
    );
}
