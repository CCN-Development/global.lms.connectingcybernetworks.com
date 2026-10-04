/** Design tokens for the Ask Aish / AI Assistant screens. */

/** Figma's three stacked stroke paints: flat 10% white, top-left glow, bottom-right glow. */
export const BORDER_PAINT = [
    "linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.10))",
    "linear-gradient(291deg, rgba(255,255,255,0.24) 3%, rgba(255,255,255,0) 47%)",
    "linear-gradient(105deg, rgba(255,255,255,0.24) 8%, rgba(153,153,153,0) 35%)",
].join(", ");

/** 1px gradient stroke painted on a masked pseudo-element so it follows the radius. */
export const gradientBorder = (width = "1px") => ({
    content: '""',
    position: "absolute" as const,
    inset: 0,
    borderRadius: "inherit",
    padding: width,
    backgroundImage: BORDER_PAINT,
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    pointerEvents: "none" as const,
    zIndex: 2,
});

export const AISH = {
    panelBg: "linear-gradient(180deg, rgba(147,169,226,0.04) 0%, rgba(80,93,124,0.02) 100%)",
    iconButtonBg: "linear-gradient(180deg, rgba(227,233,248,0.04) 0%, rgba(134,137,146,0.02) 100%)",
    composerBg: "rgba(9,9,21,0.44)",
    userBubbleBg:
        "linear-gradient(171.44deg, rgba(0,39,172,0.44) 1.34%, rgba(0,27,121,0.44) 48.72%, rgba(0,16,70,0.44) 96.09%)",
    botBubbleBg:
        "linear-gradient(171.96deg, rgba(0,0,0,0.387) 1.34%, rgba(10,9,9,0.282) 48.72%, rgba(102,102,102,0.009) 96.09%)",
    sendBg:
        "linear-gradient(90deg, #0027AC 0%, #0B22AC 12.5%, #161DAC 25%, #2C14AC 43.572%, #4608AC 65.007%, #4F04AC 82.544%, #5900AC 100%)",
    chipBg: "rgba(255,255,255,0.04)",
    chipBorder: "#BFBFBF",
    menuActiveBg: "rgba(64,64,64,0.5)",
    bubbleInnerGlow: "inset 0 0 6px rgba(255,255,255,0.16)",

    white: "#FFFFFF",
    textBody: "#F2F2F2",
    textStrong: "#D9D9D9",
    textSoft: "#BFBFBF",
    textMuted: "#A6A6A6",
    textPlaceholder: "#8C8C8C",
    textLabel: "#737373",
} as const;

/** MUI Typography falls back to Roboto without a ThemeProvider, so Lato is set explicitly. */
export const FONT_LATO = "var(--font-lato), Arial, Helvetica, sans-serif";
export const FONT_INTER = "var(--font-sans)";
export const FONT_POPPINS = "var(--font-poppins)";
