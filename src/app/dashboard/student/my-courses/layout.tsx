"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

/** Every My Courses screen reports XP, rank-ups and errors through toasts. */
export default function MyCoursesLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                containerStyle={{ zIndex: 2000 }}
                toastOptions={{
                    style: {
                        background: "rgba(10,10,16,0.94)",
                        color: "#F2F2F2",
                        border: "1px solid rgba(140,36,255,0.45)",
                        backdropFilter: "blur(12px)",
                        fontSize: 14,
                    },
                    success: { iconTheme: { primary: "#2EC4B6", secondary: "#0A0A10" } },
                    error: { iconTheme: { primary: "#F87171", secondary: "#0A0A10" } },
                }}
            />
        </>
    );
}
