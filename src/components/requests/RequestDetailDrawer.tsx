"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Drawer, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { RQ, TEXT, requestAsset, type SampleRequest, type TimelineItem } from "./request-data";
import { DateStamp, DrawerStatusPill, Icon, TagPill } from "./request-parts";

const hiddenScrollbar = {
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": { display: "none" },
} as const;

/** Glass panel used by the description and feedback blocks. */
const glassPanelSx = {
    position: "relative",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.88)",
    backgroundImage: RQ.glassPanel,
    backdropFilter: "blur(12px)",
    boxShadow: RQ.glassInset,
} as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <Typography sx={{ ...TEXT.reg14, color: RQ.n300, textTransform: "uppercase" }}>{children}</Typography>;
}

function TimelineMarker({ kind }: { kind: TimelineItem["kind"] }) {
    if (kind === "step") return <Icon name="timeline-dot-20.svg" size={20} />;
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: "50px",
                border: "1px solid rgba(255,255,255,0.08)",
                bgcolor: kind === "rejected" ? RQ.error600 : undefined,
                backgroundImage: kind === "accepted" ? RQ.acceptedMarker : undefined,
                flexShrink: 0,
            }}
        >
            <Icon name={kind === "rejected" ? "icon-x-12.svg" : "icon-check-12.svg"} size={12} />
        </Box>
    );
}

function TimelineRow({ item }: { item: TimelineItem }) {
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px", minHeight: 47 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch", pt: "2px", flexShrink: 0 }}>
                <TimelineMarker kind={item.kind} />
                {item.kind === "step" && <Box sx={{ flex: 1, width: "1px", minHeight: "1px", backgroundImage: RQ.timelineLine }} />}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", columnGap: "12px", rowGap: "4px", flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                    <Typography sx={{ ...TEXT.med16, color: RQ.white }}>{item.title}</Typography>
                    {item.note && <Typography sx={{ ...TEXT.interReg12, color: RQ.n300 }}>{item.note}</Typography>}
                </Box>
                <DateStamp iso={item.at} size="drawer" />
            </Box>
        </Box>
    );
}

function Callout({ label, text, tone }: { label: string; text: string; tone: "next" | "rejection" }) {
    const isNext = tone === "next";
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                p: "16px",
                borderRadius: "24px",
                borderStyle: "solid",
                borderColor: isNext ? RQ.primary500 : "#7A1824",
                borderWidth: isNext ? "1px 1px 3px 1px" : "0.6px 0.6px 2px 0.6px",
                bgcolor: isNext ? "rgba(47,83,173,0.08)" : undefined,
                backgroundImage: isNext
                    ? undefined
                    : "linear-gradient(180deg, rgba(224,44,66,0.08) 0%, rgba(173,34,51,0.08) 50%, rgba(122,24,36,0.08) 100%)",
            }}
        >
            <SectionLabel>{label}</SectionLabel>
            <Typography sx={{ ...TEXT.med16, color: RQ.white, whiteSpace: "pre-line" }}>{text}</Typography>
        </Box>
    );
}

export interface RequestDetailDrawerProps {
    open: boolean;
    request: SampleRequest | null;
    onClose: () => void;
    onWithdraw: (request: SampleRequest) => void;
    onFeedback: (request: SampleRequest, value: "up" | "down") => void;
}

export default function RequestDetailDrawer({ open, request, onClose, onWithdraw, onFeedback }: RequestDetailDrawerProps) {
    const isActive = request?.tab === "active";

    const openAttachment = () => {
        if (request?.attachment?.url) window.open(request.attachment.url, "_blank", "noopener,noreferrer");
        else toast("Preview isn’t available for sample attachments.");
    };

    return (
        <Drawer
            anchor="right"
            open={open && request !== null}
            onClose={onClose}
            slotProps={{
                backdrop: { sx: { bgcolor: RQ.overlay, backdropFilter: "blur(12px)" } },
                paper: {
                    sx: {
                        width: { xs: "100%", sm: 476 },
                        height: "100%",
                        overflow: "hidden",
                        bgcolor: "#000",
                        backgroundImage: "none",
                        color: RQ.white,
                        borderStyle: "solid",
                        borderColor: RQ.modalStroke,
                        borderWidth: { xs: 0, sm: "1.5px 0 1.5px 1.5px" },
                        borderTopLeftRadius: { xs: 0, sm: "32px" },
                        borderBottomLeftRadius: { xs: 0, sm: "32px" },
                        boxShadow: "0 0 44px rgba(255,255,255,0.32)",
                        backdropFilter: "blur(50px)",
                    },
                },
            }}
        >
            {request && (
                <>
                    {/* Ellipse 697 / 698 glows */}
                    <Box aria-hidden sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                        {[
                            { left: 180.44, top: 184.64 },
                            { left: 257.44, top: 107.64 },
                        ].map((glow) => (
                            <Box
                                key={glow.left}
                                sx={{ position: "absolute", left: glow.left, top: glow.top, transform: "translate(-50%, -50%) rotate(-40.17deg)", lineHeight: 0 }}
                            >
                                <Image src={requestAsset("drawer-glow.svg")} alt="" width={169.794} height={1533.31} />
                            </Box>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            position: "relative",
                            height: "100%",
                            overflowY: "auto",
                            ...hiddenScrollbar,
                            display: "flex",
                            flexDirection: "column",
                            gap: "32px",
                            p: { xs: "20px", sm: "32px" },
                        }}
                    >
                        {/* Header + summary */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                                <SectionLabel>Request Details</SectionLabel>
                                <ButtonBase
                                    aria-label="Close"
                                    onClick={onClose}
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50px",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        backgroundImage: RQ.iconButton,
                                        backdropFilter: "blur(25px)",
                                        flexShrink: 0,
                                        "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                                    }}
                                >
                                    <Icon name="icon-x.svg" size={24} />
                                </ButtonBase>
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                        <DrawerStatusPill tab={request.tab} />
                                        <TagPill label={request.tag} />
                                    </Box>
                                    <Typography
                                        component="h2"
                                        sx={{ ...TEXT.poppinsSemi28, fontSize: { xs: "24px", sm: "28px" }, lineHeight: { xs: "36px", sm: "42px" }, color: RQ.white, overflowWrap: "anywhere" }}
                                    >
                                        {request.title}
                                    </Typography>
                                </Box>

                                <Box sx={{ ...glassPanelSx, display: "flex", flexDirection: "column", gap: "16px", p: "20px" }}>
                                    <SectionLabel>Description</SectionLabel>
                                    <Typography sx={{ ...TEXT.reg16, color: RQ.n75, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
                                        {request.description}
                                    </Typography>
                                </Box>

                                {request.attachment && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "12px",
                                            minHeight: 67,
                                            p: "16px",
                                            borderRadius: "16px",
                                            backgroundImage: RQ.attachmentRow,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0 }}>
                                                <Icon name="file-icon.svg" size={40} height={42} />
                                            </Box>
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                                <Typography sx={{ ...TEXT.med16, color: RQ.n75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {request.attachment.name}
                                                </Typography>
                                                <Typography sx={{ ...TEXT.interReg14, color: RQ.n400 }}>{request.attachment.sizeLabel}</Typography>
                                            </Box>
                                        </Box>
                                        <ButtonBase
                                            aria-label="View attachment"
                                            onClick={openAttachment}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "99px",
                                                border: `1px solid ${RQ.n700}`,
                                                bgcolor: "rgba(38,38,38,0.12)",
                                                boxShadow: "0 5px 20px rgba(0,0,0,0.02)",
                                                flexShrink: 0,
                                                "&:hover": { borderColor: RQ.n500, bgcolor: "rgba(255,255,255,0.06)" },
                                            }}
                                        >
                                            <Icon name="icon-eye.svg" size={20} />
                                        </ButtonBase>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Status history */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <SectionLabel>Status History</SectionLabel>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {request.timeline.map((item) => (
                                    <TimelineRow key={item.id} item={item} />
                                ))}
                                {request.nextStep && <Callout label="Next Step" text={request.nextStep} tone="next" />}
                                {request.rejectionReason && <Callout label="Reason for Rejection" text={request.rejectionReason} tone="rejection" />}
                            </Box>
                            {isActive && request.expectedResponse && (
                                <Typography sx={{ ...TEXT.med14, color: RQ.warning }}>{request.expectedResponse}</Typography>
                            )}
                        </Box>

                        {/* Feedback (closed requests) */}
                        {!isActive && (
                            <Box sx={{ ...glassPanelSx, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", p: "20px", backgroundImage: RQ.glassPanel.replace("169deg", "176.78deg") }}>
                                <Typography sx={{ ...TEXT.reg16, color: RQ.n75 }}>
                                    {request.feedback ? "Thanks for your feedback!" : "Was this request handled satisfactorily?"}
                                </Typography>
                                <Box sx={{ display: "flex", gap: "12px", flexShrink: 0 }}>
                                    {(["up", "down"] as const).map((value) => {
                                        const selected = request.feedback === value;
                                        return (
                                            <ButtonBase
                                                key={value}
                                                aria-label={value === "up" ? "Yes, satisfied" : "No, not satisfied"}
                                                aria-pressed={selected}
                                                onClick={() => onFeedback(request, value)}
                                                sx={{
                                                    borderRadius: "6px",
                                                    opacity: request.feedback && !selected ? 0.4 : 1,
                                                    outline: selected ? `1px solid ${RQ.n300}` : "none",
                                                    outlineOffset: "3px",
                                                    transition: "opacity .15s ease",
                                                    "&:hover": { opacity: 1 },
                                                }}
                                            >
                                                <Icon name={value === "up" ? "icon-thumbs-up.svg" : "icon-thumbs-down.svg"} size={24} />
                                            </ButtonBase>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}

                        {/* Withdraw (open requests) */}
                        {isActive && (
                            <ButtonBase
                                onClick={() => onWithdraw(request)}
                                sx={{
                                    mt: "auto",
                                    width: "100%",
                                    height: 44,
                                    flexShrink: 0,
                                    px: "24px",
                                    borderRadius: "10px",
                                    border: `1px solid ${RQ.n700}`,
                                    ...TEXT.interMed14,
                                    color: RQ.n100,
                                    transition: "border-color .15s ease, background-color .15s ease",
                                    "&:hover": { borderColor: RQ.n500, bgcolor: "rgba(255,255,255,0.04)" },
                                }}
                            >
                                Withdraw Request
                            </ButtonBase>
                        )}
                    </Box>
                </>
            )}
        </Drawer>
    );
}
