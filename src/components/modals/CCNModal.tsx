"use client";
import React from "react";
import { Dialog, Box, IconButton } from "@mui/material";
import { MdClose } from "react-icons/md";

/**
 * CCNModal — reusable dark-themed modal shell.
 *
 * Usage:
 *   <CCNModal open={open} onClose={onClose}>
 *     ...your content...
 *   </CCNModal>
 *
 * The Paper card and blurred backdrop are pre-styled so any child page/
 * component only needs to supply its own content — no need to re-define
 * overlay, blur, border-radius, or shadow.
 */

export interface CCNModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    /** Max pixel width of the card (default 480) */
    maxWidth?: number | string;
    /** Show an ✕ close button in the top-right corner */
    showCloseButton?: boolean;
    /** Extra sx forwarded to the Paper card */
    paperSx?: object;
}

export default function CCNModal({
    open,
    onClose,
    children,
    maxWidth = 480,
    showCloseButton = false,
    paperSx = {},
}: CCNModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            sx={{
                "& .MuiDialog-paper": {
                    bgcolor: "#000000",
                    backgroundImage: "none",
                    borderRadius: "18px",
                    border: "1px solid rgb(255, 255, 255)",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.65)",
                    maxWidth,
                    width: "100%",
                    m: 2,
                    position: "relative",
                    overflow: "hidden",
                    ...paperSx,
                },
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: "rgba(0,0,0,0.72)",
                        backdropFilter: "blur(7px)",
                    },
                },
            }}
        >
            {/* Subtle gradient glow at the top edge */}
            {/* <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60%",
                    height: 2,
                    background: "linear-gradient(90deg, transparent, #7c3aed, #3b5bdb, transparent)",
                    borderRadius: "0 0 4px 4px",
                    pointerEvents: "none",
                }}
            /> */}

            {showCloseButton && (
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        color: "rgba(255,255,255,0.45)",
                        zIndex: 10,
                        "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.06)" },
                    }}
                >
                    <MdClose size={16} />
                </IconButton>
            )}

            {children}
        </Dialog>
    );
}
