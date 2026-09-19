/** Shared dark-glass palette for the chat workspace. */
export const C = {
    panel: "rgba(13,17,33,0.90)",
    panelSolid: "#0d1121",
    panelAlt: "#101527",
    raised: "#151b30",
    border: "#212944",
    borderSoft: "#1a2136",
    text: "#ffffff",
    textSoft: "#98a2bd",
    textMuted: "#6b7490",
    accent: "#6366f1",
    accentDark: "#4f46e5",
    accentSoft: "#818cf8",
    accentGrad: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    groupGrad: "linear-gradient(135deg,#0ea5e9,#2563eb)",
    communityGrad: "linear-gradient(135deg,#f59e0b,#ef4444)",
    bubbleIn: "#161d33",
    bubbleOut: "linear-gradient(135deg,#4338ca,#6d28d9)",
    bubbleOutSolid: "#4f46e5",
    online: "#22c55e",
    danger: "#f43f5e",
    star: "#f59e0b",
    tick: "#38bdf8",
    hover: "#141b2e",
    active: "#1b2140",
    selected: "#1d2445",
    chipBg: "#182039",
} as const;

/** Deterministic accent for sender names inside group chats. */
const NAME_COLORS = [
    "#f472b6", "#38bdf8", "#34d399", "#fbbf24",
    "#a78bfa", "#fb7185", "#22d3ee", "#facc15",
];

export function senderColor(userId: string) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
    return NAME_COLORS[hash % NAME_COLORS.length];
}

export const scrollbarSx = {
    "&::-webkit-scrollbar": { width: "4px", height: "4px" },
    "&::-webkit-scrollbar-thumb": { background: "#2a3350", borderRadius: "4px" },
    "&::-webkit-scrollbar-thumb:hover": { background: "#3b466b" },
    "&::-webkit-scrollbar-track": { background: "transparent" },
} as const;
