"use client";

import React from "react";
import { Dialog, IconButton } from "@mui/material";
import { MdClose } from "react-icons/md";
import { PartyPopper } from "lucide-react";

export interface BirthdayRewardDialogProps {
    open: boolean;
    onClose: () => void;
    /** First name shown in the greeting line */
    name: string;
    /** XP awarded for the birthday */
    xp?: number;
    onClaim?: () => void;
    claiming?: boolean;
}

export default function BirthdayRewardDialog({
    open,
    onClose,
    name,
    xp = 100,
    onClaim,
    claiming = false,
}: BirthdayRewardDialogProps) {
    const handleClaim = () => {
        onClaim?.();
        if (!onClaim) onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            sx={{
                "& .MuiDialog-paper": {
                    bgcolor: "#000000",
                    backgroundImage: "none",
                    borderRadius: "24px",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.65)",
                    maxWidth: 604,
                    width: "100%",
                    m: 2,
                    position: "relative",
                    overflow: "hidden",
                    // Border fades out from the top-right corner, as in the design
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        zIndex: 30,
                        borderRadius: "inherit",
                        padding: "1.5px",
                        backgroundImage: "linear-gradient(225deg, #508AF2 0%, rgba(80,138,242,0) 26%)",
                        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        pointerEvents: "none",
                    },
                },
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: "rgba(64,64,64,0.24)",
                        backdropFilter: "blur(12px)",
                    },
                },
            }}
        >
            {/* Ambient blue sheen sweeping across the panel */}
            <div className="absolute left-[-23.16%] top-[-40.18%] flex h-[162.2%] w-[161.9%] items-center justify-center pointer-events-none">
                <div className="flex-none rotate-[-40.17deg]">
                    <div className="relative h-[1433.31px] w-[69.794px]">
                        <div className="absolute inset-[-6.98%_-143.28%]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                alt=""
                                src="/birthday/reward-glow.svg"
                                className="block h-full w-full max-w-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Dark arc behind the gift */}
            <div className="absolute inset-[-32.57%_-22.02%_27.47%_-34.93%] pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt=""
                    src="/birthday/reward-swoosh.svg"
                    className="absolute inset-0 block h-full w-full max-w-none"
                />
            </div>

            <IconButton
                onClick={onClose}
                size="small"
                aria-label="Close birthday reward"
                sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 20,
                    color: "rgba(255,255,255,0.45)",
                    "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.06)" },
                }}
            >
                <MdClose size={16} />
            </IconButton>

            <div className="relative z-10 flex flex-col items-center p-5 sm:p-8">
                {/* Opened gift box, with its light beam and sparkles anchored to it */}
                <div className="relative -mb-[34px] w-[220px] shrink-0 sm:-mb-[47px] sm:w-[310px]">
                    <div className="absolute left-[26.8%] top-[35.3%] h-[26.9%] w-[46.1%]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            alt=""
                            src="/birthday/reward-beam.svg"
                            className="absolute inset-0 block h-full w-full max-w-none"
                        />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        alt=""
                        src="/birthday/reward-gift-transparant.png"
                        className="relative block h-auto w-full max-w-none"
                    />
                    <div className="absolute left-[24.5%] top-[39.5%] h-[20.7%] w-[44.2%]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            alt=""
                            src="/birthday/reward-sparkles.svg"
                            className="absolute inset-0 block h-full w-full max-w-none"
                        />
                    </div>
                </div>

                <div className="flex w-full flex-col items-center justify-center gap-6 sm:gap-8">
                    <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
                        <p
                            className="w-full text-center text-[24px] font-bold leading-[36px] text-white sm:text-[28px] sm:leading-[42px]"
                            style={{ fontFamily: "var(--font-poppins)" }}
                        >
                            Birthday Reward
                        </p>

                        <div className="w-full text-center text-[14px] leading-[22px] text-[#d9d9d9] sm:text-[16px] sm:leading-[24px]">
                            <p className="flex items-center justify-center gap-1.5">
                                Happy Birthday, {name}!
                                <PartyPopper size={18} className="shrink-0 text-[#f59e0b]" />
                            </p>
                            <p>Today comes with a little bonus just for you.</p>
                        </div>

                        <div className="flex h-[63px] items-center gap-3 rounded-[12px] bg-[#15151b] p-3">
                            <div className="relative size-[28px] shrink-0">
                                <div className="absolute inset-[-15.91%_-95.45%_-175%_-95.45%]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        alt=""
                                        src="/birthday/icon-xp.svg"
                                        className="block h-full w-full max-w-none"
                                    />
                                </div>
                            </div>
                            <span
                                className="bg-linear-to-r from-[#f1c40e] to-[#ff6000] bg-clip-text text-[18px] font-semibold leading-[27px] whitespace-nowrap text-transparent"
                                style={{ fontFamily: "var(--font-lato)" }}
                            >
                                +{xp}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClaim}
                        disabled={claiming}
                        className="relative flex h-[44px] w-full items-center justify-center gap-3 overflow-hidden rounded-[10px] p-4 text-[14px] font-medium leading-[21px] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{
                            backgroundImage:
                                "linear-gradient(90deg, rgb(0, 39, 172) 0%, rgb(11, 34, 172) 12.5%, rgb(22, 29, 172) 25%, rgb(44, 20, 172) 43.572%, rgb(70, 8, 172) 65.007%, rgb(79, 4, 172) 82.544%, rgb(89, 0, 172) 100%)",
                            filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.12))",
                        }}
                    >
                        <span className="relative z-10">
                            {claiming ? "Claiming…" : `Claim +${xp} XP`}
                        </span>
                        <div className="pointer-events-none absolute left-1/2 top-[calc(50%+60.5px)] size-[41px] -translate-x-1/2 -translate-y-1/2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                alt=""
                                src="/birthday/reward-btn-glow.svg"
                                className="absolute inset-0 block h-full w-full max-w-none"
                            />
                        </div>
                        <div className="pointer-events-none absolute left-[calc(50%+0.5px)] top-[9px] h-0 w-[136px] -translate-x-1/2">
                            <div className="absolute inset-[-12px_-8.09%_-11px_-8.09%]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    alt=""
                                    src="/birthday/reward-btn-line.svg"
                                    className="block h-full w-full max-w-none"
                                />
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
