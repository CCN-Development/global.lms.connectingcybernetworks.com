"use client";

import React from "react";
import { Toaster } from "react-hot-toast";
import { CommunityApiProvider } from "@/contexts/CommunityContext";
import type { CommunityVariant } from "./community-data";
import { CommunityProvider } from "./CommunityContext";
import NewDiscussionModal from "./NewDiscussionModal";

interface CommunityRootProps {
    children: React.ReactNode;
    /** Feed route, e.g. /dashboard/student/community or /dashboard/admin/ccn-forum. */
    basePath: string;
    variant?: CommunityVariant;
}

/** Everything a community route needs: API + screen state, the composer modal and the toast host. */
export default function CommunityRoot({ children, basePath, variant = "student" }: CommunityRootProps) {
    return (
        <CommunityApiProvider>
            <CommunityProvider basePath={basePath} variant={variant}>
                {children}
                <NewDiscussionModal />
            </CommunityProvider>
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
        </CommunityApiProvider>
    );
}
