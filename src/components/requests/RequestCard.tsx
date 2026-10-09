"use client";

import React, { useState } from "react";
import { Box, ButtonBase, Menu, MenuItem, Typography } from "@mui/material";
import { RQ, TEXT, formatCreated, type SampleRequest } from "./request-data";
import { CardStatusPill, DateStamp, Icon, RepliesPill, dropdownItemSx, dropdownPaperSx } from "./request-parts";

export interface RequestCardProps {
    request: SampleRequest;
    onView: () => void;
    onWithdraw?: () => void;
}

export default function RequestCard({ request, onView, onWithdraw }: RequestCardProps) {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const isActive = request.tab === "active";

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                pt: "8px",
                px: "8px",
                pb: "16px",
                borderRadius: "24px",
                backgroundImage: RQ.cardFrame,
                minWidth: 0,
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", p: "20px", borderRadius: "16px", bgcolor: RQ.cardInner }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", minHeight: 24 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <CardStatusPill tab={request.tab} />
                            {isActive && request.repliesIn && <RepliesPill label={request.repliesIn} />}
                        </Box>
                        {isActive && (
                            <>
                                <ButtonBase
                                    aria-label="More actions"
                                    aria-haspopup="menu"
                                    onClick={(event) => setMenuAnchor(event.currentTarget)}
                                    sx={{ borderRadius: "6px", "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
                                >
                                    <Icon name="icon-more-horiz.svg" size={24} />
                                </ButtonBase>
                                <Menu
                                    anchorEl={menuAnchor}
                                    open={Boolean(menuAnchor)}
                                    onClose={() => setMenuAnchor(null)}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                                    slotProps={{ paper: { sx: { ...dropdownPaperSx, minWidth: 180 } } }}
                                >
                                    <MenuItem
                                        sx={dropdownItemSx}
                                        onClick={() => {
                                            setMenuAnchor(null);
                                            onView();
                                        }}
                                    >
                                        View Details
                                    </MenuItem>
                                    {onWithdraw && (
                                        <MenuItem
                                            sx={{ ...dropdownItemSx, color: RQ.error500 }}
                                            onClick={() => {
                                                setMenuAnchor(null);
                                                onWithdraw();
                                            }}
                                        >
                                            Withdraw Request
                                        </MenuItem>
                                    )}
                                </Menu>
                            </>
                        )}
                    </Box>

                    <Typography component="h3" sx={{ ...TEXT.semi18, color: RQ.white, overflowWrap: "anywhere" }}>
                        {request.category}
                    </Typography>
                </Box>

                {/* Status row */}
                <Box
                    sx={{
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        pl: "16px",
                        pr: "12px",
                        py: "8px",
                        borderRadius: "12px",
                        bgcolor: RQ.timelineBox,
                    }}
                >
                    <Box aria-hidden sx={{ position: "absolute", left: 0, top: 0, width: 7, height: 88, backgroundImage: RQ.timelineAccent }} />
                    <Box sx={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch", pt: "3px", flexShrink: 0 }}>
                            <Icon name="timeline-dot-16.svg" size={16} />
                            <Box sx={{ flex: 1, width: "1px", minHeight: "1px", backgroundImage: RQ.timelineLine }} />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
                            <Typography sx={{ ...TEXT.med14, color: RQ.white }}>{request.statusLabel}</Typography>
                            <DateStamp iso={request.statusAt} size="card" />
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", pl: "12px", pr: "8px" }}>
                <Typography sx={{ ...TEXT.med12, color: RQ.white }}>Created on {formatCreated(request.createdAt)}</Typography>
                <ButtonBase
                    aria-label={`View ${request.category} request`}
                    onClick={onView}
                    sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "999px",
                        border: `1px solid ${RQ.n300}`,
                        backgroundImage: RQ.chipButton,
                        flexShrink: 0,
                        transition: "border-color .15s ease, background-color .15s ease",
                        "&:hover": { borderColor: RQ.white, bgcolor: "rgba(255,255,255,0.08)" },
                    }}
                >
                    <Icon name="icon-chevron-right.svg" size={16} />
                </ButtonBase>
            </Box>
        </Box>
    );
}
