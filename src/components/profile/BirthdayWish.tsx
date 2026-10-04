"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStudent } from "@/contexts/StudentContext";
import BirthdayRewardDialog from "./BirthdayRewardDialog";

/** DOB is stored as an ISO timestamp, so compare the UTC day/month against the local calendar day. */
function isBirthdayToday(dateOfBirth: string | null | undefined): boolean {
    if (!dateOfBirth) return false;
    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) return false;
    const today = new Date();
    console.log("DOB:", dob, "Today:", today);
    return dob.getUTCMonth() === today.getMonth() && dob.getUTCDate() === today.getDate();
}

export interface BirthdayWishProps {
    /** XP awarded for the birthday */
    xp?: number;
    onClaim?: () => void;
    claiming?: boolean;
    className?: string;
    /** Render the banner even when it is not the student's birthday (for previews) */
    forceShow?: boolean;
}

export default function BirthdayWish({ xp = 100, onClaim, claiming, className, forceShow }: BirthdayWishProps) {
    const { profile, getProfile } = useStudent();
    const [open, setOpen] = useState(false);
    const requestedProfile = useRef(false);

    useEffect(() => {
        if (profile || requestedProfile.current) return;
        requestedProfile.current = true;
        void getProfile();
    }, [profile, getProfile]);

    const isBirthday = useMemo(() => isBirthdayToday(profile?.dateOfBirth), [profile?.dateOfBirth]);

    const firstName = useMemo(
        () => profile?.studentName?.trim().split(/\s+/)[0] ?? "there",
        [profile?.studentName],
    );

    if (!forceShow && !isBirthday) return null;

    return (
        <>
            <div
                className={`relative flex min-h-[200px] mb-3 w-full items-center overflow-hidden rounded-[24px] bg-[#0c0e1d] p-5 sm:p-8 ${className ?? ""}`}
            >
                {/* Gradient backdrop */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt=""
                    src="/birthday/banner-bg.png"
                    className="pointer-events-none absolute inset-0 block h-full w-full max-w-none object-cover"
                />

                {/* Reserve the right strip for the gifts artwork on sm+ */}
                <div className="relative z-10 flex w-full flex-col items-start gap-4 sm:gap-6 sm:pr-[230px]">
                    <div className="flex w-full flex-col items-start gap-1 wrap-break-word text-white">
                        <h2
                            className="text-[22px] font-semibold leading-[32px] sm:text-[28px] sm:leading-[42px]"
                            style={{ fontFamily: "var(--font-poppins)" }}
                        >
                            It&rsquo;s Your Special Day
                        </h2>
                        <p
                            className="text-[14px] font-medium leading-[21px] sm:text-[16px] sm:leading-[24px]"
                            style={{ fontFamily: "var(--font-lato)" }}
                        >
                            To celebrate you, we have a special reward for you
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="relative flex h-[40px] shrink-0 items-center justify-center gap-3 overflow-hidden rounded-[10px]  px-3 py-4 shadow-[0px_0px_8px_0px_rgba(255,255,255,0.12)] transition-opacity hover:opacity-90"
                        style={{
                            backgroundImage:
                                "linear-gradient(90deg, rgb(212, 17, 128) 0%, rgb(180, 17, 150) 26.234%, rgb(147, 16, 173) 52.469%, rgb(90, 16, 195) 76.234%, rgb(33, 16, 218) 100%)",
                        }}
                    >
                        <div className="relative z-10 size-[18px] shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                alt=""
                                src="/birthday/icon-gift.svg"
                                className="absolute inset-0 block h-full w-full max-w-none"
                            />
                        </div>
                        <span className="relative z-10 whitespace-nowrap text-[14px] font-medium leading-[21px] text-[#f2f2f2]">
                            Open Birthday Reward
                        </span>

                        <div className="pointer-events-none absolute left-1/2 top-[calc(50%+60.5px)] size-[41px] -translate-x-1/2 -translate-y-1/2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                alt=""
                                src="/birthday/btn-glow.svg"
                                className="absolute inset-0 block h-full w-full max-w-none"
                            />
                        </div>
                        <div className="pointer-events-none absolute left-[-32px] top-0 h-[3px] w-[286px]">
                            <div className="absolute inset-[-266.67%_-2.8%]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    alt=""
                                    src="/birthday/btn-line-top.svg"
                                    className="block h-full w-full max-w-none"
                                />
                            </div>
                        </div>
                        <div className="pointer-events-none absolute left-[-5px] top-[-55px] flex h-[144px] w-[6px] items-center justify-center">
                            <div className="flex-none rotate-90">
                                <div className="relative h-[6px] w-[144px]">
                                    <div className="absolute inset-[-133.33%_-5.56%]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            alt=""
                                            src="/birthday/btn-line-left.svg"
                                            className="block h-full w-full max-w-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute left-[-3px] top-[43px] h-[6px] w-[231px]">
                            <div className="absolute inset-[-133.33%_-3.46%]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    alt=""
                                    src="/birthday/btn-line-bottom.svg"
                                    className="block h-full w-full max-w-none"
                                />
                            </div>
                        </div>
                    </button>
                </div>

                {/* Confetti scattered over the whole banner */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt=""
                    src="/birthday/banner-confetti.svg"
                    className="pointer-events-none absolute inset-0 z-20 block h-full w-full max-w-none"
                />

                {/* Gifts & balloons artwork — screen blending drops its black matte */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt=""
                    src="/birthday/banner-gifts-transparant.png"
                    className="pointer-events-none absolute inset-y-0 right-[5.97%] z-20 hidden h-full w-auto max-w-none mix-blend-screen sm:block"
                />

                <div className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] shadow-[inset_0px_3px_6px_0px_rgba(255,255,255,0.16)]" />

                {/* Gradient hairline border: bright at the top and bottom edges, invisible in between */}
                <div
                    className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
                    style={{
                        padding: "1px",
                        backgroundImage:
                            "linear-gradient(176deg, rgba(255,255,255,0.44) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 74%, rgba(255,255,255,0.44) 100%)",
                        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                    }}
                />
            </div>

            <BirthdayRewardDialog
                open={open}
                onClose={() => setOpen(false)}
                name={firstName}
                xp={xp}
                onClaim={onClaim}
                claiming={claiming}
            />
        </>
    );
}
