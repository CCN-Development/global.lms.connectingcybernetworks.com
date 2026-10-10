import { BORDER_PAINT, FONT_INTER, FONT_LATO, FONT_POPPINS, gradientBorder } from "@/components/aish/tokens";

export { BORDER_PAINT, FONT_INTER, FONT_LATO, FONT_POPPINS, gradientBorder };

const FAMILIES = { lato: FONT_LATO, inter: FONT_INTER, poppins: FONT_POPPINS } as const;

/** Typography shorthand matching the Figma text styles, e.g. `t("lato", 16, 24, 500, C.text)`. */
export const t = (family: keyof typeof FAMILIES, size: number, lineHeight: number, weight = 400, color?: string) => ({
    fontFamily: FAMILIES[family],
    fontSize: `${size}px`,
    lineHeight: `${lineHeight}px`,
    fontWeight: weight,
    ...(color ? { color } : {}),
});

/** Chat workspace palette, taken from the LMS Figma (Neutral / Primary scales). */
export const C = {
    panel: "rgba(9,9,21,0.44)",
    panelSolid: "#17171d",
    panelAlt: "rgba(255,255,255,0.04)",
    raised: "#262626",
    border: "rgba(255,255,255,0.24)",
    borderSoft: "rgba(255,255,255,0.08)",
    divider: "rgba(255,255,255,0.24)",
    text: "#ffffff",
    textBody: "#F2F2F2",
    textStrong: "#D9D9D9",
    textSoft: "#BFBFBF",
    textMuted: "#A6A6A6",
    textPlaceholder: "#8C8C8C",
    textFaint: "#737373",
    accent: "#2F53AD",
    accentDark: "#0027AC",
    accentSoft: "#93A9E2",
    accentPale: "#BBC9ED",
    accentGrad:
        "linear-gradient(90deg,#0027AC 0%,#0B22AC 12.5%,#161DAC 25%,#2C14AC 43.572%,#4608AC 65.007%,#4F04AC 82.544%,#5900AC 100%)",
    groupGrad: "linear-gradient(135deg,#2F53AD,#0E1934)",
    communityGrad: "linear-gradient(135deg,#F1C40E,#FF6000)",
    bubbleIn: "rgba(36,38,38,0.64)",
    bubbleOut:
        "linear-gradient(94deg, rgba(0,39,172,0.44) 1.08%, rgba(0,27,121,0.44) 55.33%, rgba(0,16,70,0.44) 109.57%)",
    bubbleOutSolid: "#001B79",
    bubbleCard: "rgba(3,6,12,0.44)",
    linkCard: "rgba(36,38,38,0.64)",
    online: "#22c55e",
    danger: "#D1293D",
    star: "#F1C40E",
    tick: "#BBC9ED",
    hover: "rgba(255,255,255,0.05)",
    active: "rgba(147,169,226,0.12)",
    selected:
        "linear-gradient(155deg, rgba(140,36,255,0.24) 2.05%, rgba(109,33,204,0.24) 20.9%, rgba(77,31,153,0.24) 43.84%, rgba(46,28,103,0.24) 66.79%, rgba(14,25,52,0.24) 89.73%)",
    chipBg: "rgba(255,255,255,0.04)",
    chipActive: "linear-gradient(-7.49deg, #192C5C 7.71%, #345DC2 92.29%)",
    chipBorder: "#E3E9F8",
    badge: "linear-gradient(90deg,#F1C40E,#FF6000)",
    menuBg: "rgba(38,38,38,0.88)",
    menuShadow: "0 8px 24px rgba(255,255,255,0.08)",
    avatarBg: "#93A9E2",
    avatarBorder: "#404040",
    headerGrad: "linear-gradient(180deg, rgba(140,140,140,0) 0%, rgba(11,34,172,0.18) 100%)",
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
    "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.2)", borderRadius: "4px" },
    "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255,255,255,0.32)" },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255,255,255,0.2) transparent",
} as const;

/** Paper styling for every dropdown in the workspace ("Dropdown for …" in the Figma). */
export const menuPaperSx = {
    background: C.menuBg,
    backdropFilter: "blur(6px)",
    borderRadius: "9px",
    boxShadow: C.menuShadow,
    border: "none",
    backgroundImage: "none",
    color: C.textSoft,
    minWidth: 158,
    p: 0,
    overflow: "hidden",
    "& .MuiList-root": { p: 0 },
    "& .MuiMenuItem-root": {
        height: 40,
        minHeight: 40,
        px: "12px",
        py: "8px",
        gap: "8px",
        fontFamily: FONT_INTER,
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: "24px",
        color: C.textSoft,
        "&:hover": { background: C.active },
        "&.Mui-focusVisible": { background: C.active },
    },
} as const;
