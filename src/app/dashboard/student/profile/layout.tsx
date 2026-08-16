"use client";
import React from "react";
import StudentLayout from "@/layouts/StudentLayout";
import { usePathname, useRouter } from "next/navigation";
import { MdArrowBack, MdLogout } from "react-icons/md";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isFeePage = pathname.includes("/fee-details");

    const profileHeader = (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "5px 0",
            }}
        >
            {/* Left: Back + Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        cursor: "pointer",
                        color: "#fff",
                    }}
                >
                    <MdArrowBack size={15} />
                </button>
                <span
                    style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: "-0.01em",
                    }}
                >
                    My Profile
                </span>
            </div>

            {/* Right: Tabs + Logout */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                    onClick={() => router.push("/dashboard/student/profile")}
                    style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        padding: "5px 13px",
                        borderRadius: "99px",
                        border: "none",
                        cursor: "pointer",
                        background: !isFeePage ? "#fff" : "rgba(255,255,255,0.07)",
                        color: !isFeePage ? "#0b0c1e" : "rgba(255,255,255,0.65)",
                        transition: "all 0.2s",
                    }}
                >
                    Personal Details
                </button>
                <button
                    onClick={() => router.push("/dashboard/student/profile/fee-details")}
                    style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        padding: "5px 13px",
                        borderRadius: "99px",
                        border: "none",
                        cursor: "pointer",
                        background: isFeePage ? "#fff" : "rgba(255,255,255,0.07)",
                        color: isFeePage ? "#0b0c1e" : "rgba(255,255,255,0.65)",
                        transition: "all 0.2s",
                    }}
                >
                    Fees Details
                </button>
                <button
                    onClick={() => router.push("/")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        padding: "5px 13px",
                        borderRadius: "99px",
                        border: "1px solid rgba(239,68,68,0.3)",
                        cursor: "pointer",
                        background: "rgba(239,68,68,0.08)",
                        color: "#f87171",
                    }}
                >
                    <MdLogout size={13} />
                    Log out
                </button>
            </div>
        </div>
    );

    return <StudentLayout header={profileHeader}>{children}</StudentLayout>;
}