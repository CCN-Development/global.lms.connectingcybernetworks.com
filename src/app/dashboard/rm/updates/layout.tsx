"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, Button, Paper } from "@mui/material";
import { FileText, Megaphone, Newspaper } from "lucide-react";
import RMDashboardLayout from "@/layouts/RMDashboardLayout";
import { UpdatesProvider } from "@/contexts/UpdatesContext";

const TABS = [
    { label: "News", href: "/dashboard/rm/updates/news", icon: Newspaper, color: "#009DFF" },
    { label: "Blogs", href: "/dashboard/rm/updates/blogs", icon: FileText, color: "#7c3aed" },
    { label: "Announcements", href: "/dashboard/rm/updates/announcements", icon: Megaphone, color: "#10b981" },
];

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <RMDashboardLayout title="News & Updates">
            <UpdatesProvider>
                <Box className="flex flex-col gap-2 sm:gap-3 h-full">
                    <Paper
                        elevation={0}
                        className="rounded-lg p-1 flex gap-1 w-fit max-w-full overflow-x-auto"
                        sx={{ border: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}
                    >
                        {TABS.map(({ label, href, icon: Icon, color }) => {
                            const active = pathname.startsWith(href);
                            return (
                                <Button
                                    key={href}
                                    size="small"
                                    onClick={() => router.push(href)}
                                    startIcon={<Icon size={14} />}
                                    sx={{
                                        borderRadius: "9px",
                                        px: 1.75,
                                        py: 0.75,
                                        textTransform: "none",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        whiteSpace: "nowrap",
                                        color: active ? "#ffffff" : "#6b7280",
                                        backgroundColor: active ? color : "transparent",
                                        "&:hover": { backgroundColor: active ? color : "#f1f5f9" },
                                    }}
                                >
                                    {label}
                                </Button>
                            );
                        })}
                    </Paper>

                    <Box className="flex-1 min-h-0">{children}</Box>
                </Box>
            </UpdatesProvider>
        </RMDashboardLayout>
    );
}
