/** CCN Meet palette — kept close to the chat workspace so the product feels continuous. */
export const M = {
    bg: "#0b0f1c",
    surface: "#141a2b",
    surfaceAlt: "#1b2236",
    raised: "#232c45",
    border: "#28314c",
    borderSoft: "#1f2740",
    text: "#ffffff",
    textSoft: "#9aa3bd",
    textMuted: "#6b7490",
    accent: "#6366f1",
    accentDark: "#4f46e5",
    accentSoft: "#818cf8",
    accentGrad: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    danger: "#f43f5e",
    dangerDark: "#e11d48",
    online: "#22c55e",
    warn: "#f59e0b",
    tileBg: "#131a2c",
    speaking: "#38bdf8",
} as const;

export const meetScrollbarSx = {
    "&::-webkit-scrollbar": { width: "4px" },
    "&::-webkit-scrollbar-thumb": { background: "#2f3a5c", borderRadius: "4px" },
    "&::-webkit-scrollbar-track": { background: "transparent" },
} as const;
