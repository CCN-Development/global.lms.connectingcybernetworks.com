"use client";

import React from "react";
import { C } from "./theme";

export type ChatIconName =
    | "search" | "search-24" | "more-vertical" | "grid" | "archive" | "flag" | "video" | "video-24"
    | "chevron-16" | "chevron-20" | "plus" | "smile" | "smile-20" | "mic" | "send" | "phone" | "copy"
    | "x" | "bell" | "star" | "heart" | "minus-circle" | "thumbs-down" | "trash" | "arrow-left"
    | "download" | "download-24" | "forward" | "reply" | "edit" | "check"
    | "users" | "alert-triangle" | "chevron-24" | "back";

type Props = {
    name: ChatIconName;
    size?: number;
    color?: string;
    style?: React.CSSProperties;
};

/** Figma icons are exported as strokes; masking lets any state recolour them. */
export default function ChatIcon({ name, size = 24, color = C.textSoft, style }: Props) {
    const url = `url(/chats/icon-${name}.svg)`;
    return (
        <span
            aria-hidden
            style={{
                display: "inline-block",
                flexShrink: 0,
                width: size,
                height: size,
                backgroundColor: color,
                WebkitMask: `${url} center / 100% 100% no-repeat`,
                mask: `${url} center / 100% 100% no-repeat`,
                ...style,
            }}
        />
    );
}

const TICK_SINGLE =
    "M3.89443 9.94037C3.67836 9.94037 3.47129 9.85235 3.33024 9.69618L0.185201 6.28874C-0.0878898 5.99343 -0.0548788 5.54478 0.257225 5.28639C0.569328 5.02799 1.04349 5.05922 1.31658 5.35454L3.89443 8.14863L11.1898 0.243385C11.4629 -0.0519262 11.9371 -0.0831608 12.2492 0.175236C12.5613 0.433633 12.5943 0.882278 12.3212 1.17759L4.46162 9.69618C4.31757 9.84951 4.1105 9.94037 3.89443 9.94037Z";
const TICK_SECOND =
    "M8.18004 10C8.16503 10 8.15303 10 8.13802 10C7.91895 9.98864 7.71488 9.88642 7.58284 9.72173L7.1537 9.1879C6.90161 8.87555 6.96763 8.42974 7.29474 8.19406C7.57684 7.98962 7.96396 8.00665 8.22805 8.2111L16.2077 0.283134C16.4928 -0.000818744 16.9669 -0.0121771 17.267 0.257578C17.5671 0.527333 17.5792 0.975979 17.2941 1.25993L8.72322 9.78136C8.58217 9.92333 8.3871 10 8.18004 10Z";

/** Message status ticks from the Figma ("Icons - Wp Message Status"); one tick = sent, two = delivered/read. */
export function StatusTicks({ double, color }: { double: boolean; color: string }) {
    return (
        <svg width="20" height="20" viewBox="-1.25 -5 20 20" fill="none" aria-hidden style={{ flexShrink: 0 }}>
            <path d={TICK_SINGLE} fill={color} />
            {double && <path d={TICK_SECOND} fill={color} />}
        </svg>
    );
}
