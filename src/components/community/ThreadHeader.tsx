"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Typography } from "@mui/material";
import { CC, ONLINE_COUNT } from "./community-data";
import { Icon, TEXT } from "./community-ui";
import { useCommunity } from "./CommunityContext";

/** Header used on a discussion thread: back to feed, online count and discussion search. */
export default function ThreadHeader() {
    const router = useRouter();
    const { search, setSearch } = useCommunity();
    const [query, setQuery] = useState(search);

    const goToFeed = () => router.push("/dashboard/student/community");

    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: "16px" }, minWidth: 0 }}>
                <ButtonBase
                    aria-label="Back to feed"
                    onClick={goToFeed}
                    sx={{
                        width: { xs: 36, sm: 44 },
                        height: { xs: 36, sm: 44 },
                        flexShrink: 0,
                        borderRadius: "50px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundImage: "linear-gradient(180deg, rgba(227,233,248,0.08) 0%, rgba(134,137,146,0.04) 100%)",
                        backdropFilter: "blur(25px)",
                        transition: "border-color .15s ease",
                        "&:hover": { borderColor: "rgba(255,255,255,0.24)" },
                    }}
                >
                    <Icon name="icon-arrow-back.svg" size={24} />
                </ButtonBase>
                <Typography component="span" noWrap sx={{ ...TEXT.poppinsMed20, fontSize: { xs: "16px", sm: "20px" }, color: CC.white }}>
                    Back to Feed
                </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: "24px", minWidth: 0 }}>
                <Box
                    sx={{
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        gap: "8px",
                        px: "12px",
                        py: "4px",
                        borderRadius: "50px",
                        backgroundImage: "linear-gradient(92.32deg, rgba(46,196,182,0.24) 4.52%, rgba(27,76,51,0.24) 104.18%)",
                        flexShrink: 0,
                    }}
                >
                    <Icon name="online-dot.svg" size={6} />
                    <Typography sx={{ ...TEXT.med16, color: CC.white, whiteSpace: "nowrap" }}>{ONLINE_COUNT} online</Typography>
                </Box>

                <Box
                    component="form"
                    role="search"
                    onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                        setSearch(query.trim());
                        goToFeed();
                    }}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        height: 48,
                        width: { xs: 48, md: 279 },
                        px: "12px",
                        borderRadius: "12px",
                        border: `1px solid ${CC.primary75}`,
                        transition: "width .2s ease",
                        "&:focus-within": { width: { xs: 200, md: 279 } },
                    }}
                >
                    <ButtonBase type="submit" aria-label="Search discussions" sx={{ borderRadius: "6px", flexShrink: 0 }}>
                        <Icon name="icon-search.svg" size={24} />
                    </ButtonBase>
                    <Box
                        component="input"
                        value={query}
                        placeholder="Search discussions..."
                        aria-label="Search discussions"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            border: "none",
                            outline: "none",
                            bgcolor: "transparent",
                            color: CC.white,
                            ...TEXT.interReg16,
                            "&::placeholder": { color: CC.n300 },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
