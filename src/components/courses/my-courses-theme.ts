// Design tokens for the "My Courses" screen (Figma: LMS (3) › My Courses).

export const MY_COURSES_ASSETS = "/my-courses";

export const COLORS = {
    white: "#FFFFFF",
    neutral75: "#F2F2F2",
    neutral100: "#D9D9D9",
    neutral200: "#BFBFBF",
    neutral300: "#A6A6A6",
    neutral400: "#8C8C8C",
    neutral500: "#737373",
    primary75: "#E3E9F8",
    purple: "#8C24FF",
    milestoneBorder: "#2F53AD",
    milestoneFill: "rgba(47,83,173,0.08)",
    tileBorder: "rgba(64,64,64,0.5)",
    tileFill: "rgba(255,255,255,0.01)",
    buttonBorder: "rgba(227,233,248,0.32)",
    outlineButton: "#5A5A5A",
    levelDone: "#3EBDBC",
    lessonDone: "#2EC4B6",
} as const;

export const FONTS = {
    poppins: "var(--font-poppins), sans-serif",
    lato: "var(--font-lato), sans-serif",
    inter: "var(--font-sans), sans-serif",
} as const;

/** Figma text styles, ready to spread into `sx`. */
export const TYPE = {
    displayBold52: { fontFamily: FONTS.poppins, fontWeight: 700, fontSize: "52px", lineHeight: "78px" },
    displayBold44: { fontFamily: FONTS.poppins, fontWeight: 700, fontSize: "44px", lineHeight: "66px" },
    displayReg44: { fontFamily: FONTS.poppins, fontWeight: 400, fontSize: "44px", lineHeight: "66px" },
    headingMed20: { fontFamily: FONTS.poppins, fontWeight: 500, fontSize: "20px", lineHeight: "30px" },
    headingSemibold28: { fontFamily: FONTS.poppins, fontWeight: 600, fontSize: "28px", lineHeight: "42px" },
    headingSemibold20: { fontFamily: FONTS.poppins, fontWeight: 600, fontSize: "20px", lineHeight: "30px" },
    interReg16: { fontFamily: FONTS.inter, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    mediumBold16: { fontFamily: FONTS.lato, fontWeight: 700, fontSize: "16px", lineHeight: "24px" },
    mediumReg16: { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    headingSemibold24: { fontFamily: FONTS.poppins, fontWeight: 600, fontSize: "24px", lineHeight: "36px" },
    missionTitle24: { fontFamily: FONTS.poppins, fontWeight: 600, fontStyle: "italic", fontSize: "24px", lineHeight: "36px" },
    missionTitle20: { fontFamily: FONTS.poppins, fontWeight: 600, fontStyle: "italic", fontSize: "20px", lineHeight: "30px" },
    buttonMed14: { fontFamily: FONTS.inter, fontWeight: 500, fontSize: "14px", lineHeight: "21px" },
    largeSemibold18: { fontFamily: FONTS.lato, fontWeight: 600, fontSize: "18px", lineHeight: "27px" },
    largeMed18: { fontFamily: FONTS.lato, fontWeight: 500, fontSize: "18px", lineHeight: "27px" },
    mediumSemibold16: { fontFamily: FONTS.lato, fontWeight: 600, fontSize: "16px", lineHeight: "24px" },
    mediumMed16: { fontFamily: FONTS.lato, fontWeight: 500, fontSize: "16px", lineHeight: "24px" },
    smallMed14: { fontFamily: FONTS.lato, fontWeight: 500, fontSize: "14px", lineHeight: "21px" },
    smallSemibold14: { fontFamily: FONTS.lato, fontWeight: 600, fontSize: "14px", lineHeight: "21px" },
    xsMed12: { fontFamily: FONTS.lato, fontWeight: 500, fontSize: "12px", lineHeight: "18px" },
    xsReg12: { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "12px", lineHeight: "18px" },
    xxsReg11: { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "11px", lineHeight: "18px" },
} as const;

/** Dark glass used behind every framed panel; only the angle differs per frame aspect ratio. */
export const glassFill = (angle: string) =>
    `linear-gradient(${angle}, rgba(0,0,0,0.387) 1.3382%, rgba(10,9,9,0.282) 48.715%, rgba(102,102,102,0.009) 96.091%)`;

export const INSET_HIGHLIGHT = "inset 0px 5px 12px 0px rgba(255,255,255,0.12)";

export const PRIMARY_BUTTON_FILL =
    "linear-gradient(90deg, #0027AC 0%, #0B22AC 12.5%, #161DAC 25%, #2C14AC 43.572%, #4608AC 65.007%, #4F04AC 82.544%, #5900AC 100%)";

export const LOCKED_BUTTON_FILL =
    "radial-gradient(ellipse 87px 28px at 50% 50%, rgba(0,0,0,0.88) 0%, rgba(10,9,9,0.64) 22.354%, rgba(33,32,32,0.485) 41.766%, rgba(56,55,55,0.33) 61.177%, rgba(102,102,102,0.02) 100%)";

export const SORT_BUTTON_FILL = "linear-gradient(180deg, rgba(187,201,237,0.08) 0%, rgba(106,114,135,0.05) 100%)";

export const ACTIVE_PILL_FILL =
    "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(204,204,204,0.08) 50%, rgba(153,153,153,0) 100%)";

export const STAT_ROW_FILL = "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(153,153,153,0) 100%)";

/** Figma "Student-Input" tile: a 6%-opacity radial sheen spanning the whole tile. */
export const SHEEN_TILE_FILL =
    "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(204,204,204,0.06) 50%, rgba(153,153,153,0.06) 100%)";

export const TRAILER_BUTTON_FILL =
    "linear-gradient(158.23deg, rgba(140,36,255,0.08) 9.0161%, rgba(14,25,52,0.08) 89.867%)";

export const ACTIVE_TAB_FILL = "linear-gradient(180deg, rgba(187,201,237,0.44) 0%, rgba(106,114,135,0.26) 100%)";

export const BACK_BUTTON_FILL = "linear-gradient(180deg, rgba(227,233,248,0.08) 0%, rgba(134,137,146,0.04) 100%)";

/** Square "Icon Certificate" chip behind the course content icons. */
export const CONTENT_ICON_FILL =
    "linear-gradient(180deg, rgba(79,46,211,0.5) 0%, rgba(79,46,211,0.01) 99.99%, rgba(138,80,230,0) 100%)";

/** Levels tab: the per-level "Preference Card" and the lesson rows inside it. */
export const LEVEL_CARD_FILL = "linear-gradient(180deg, rgba(147,169,226,0.08) 0%, rgba(80,93,124,0.04) 100%)";

export const LESSON_CARD_FILL =
    "linear-gradient(177.1deg, rgba(0,0,0,0.44) 1.3382%, rgba(10,9,9,0.24) 48.715%, rgba(102,102,102,0.24) 96.091%)";

/** Figma "Gradients 4" — gold → orange text used for XP and goal hints. */
export const GOLD_GRADIENT = "linear-gradient(90deg, #F1C40E 0%, #FF6000 100%)";

export const gradientText = (gradient: string) => ({
    backgroundImage: gradient,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
});

// ─── Course themes ─────────────────────────────────────────────────────────

export type CourseThemeKey = "violet" | "crimson" | "amber" | "indigo" | "teal";

export interface CourseTheme {
    /** 1px frame stroke. */
    border: string;
    /** Baked key art (radial gradient + light rays + glows + noise). */
    art: string;
    /** CSS fallback shown while the art loads; mirrors the art's base radial gradient. */
    fallback: string;
    /** Mission emblem used when the course has no uploaded emblem. */
    emblem: string;
}

const radial = (stops: string) => `radial-gradient(97.27% 97.27% at 50% 50%, ${stops})`;

export const COURSE_THEMES: Record<CourseThemeKey, CourseTheme> = {
    violet: {
        border: "#5E03C5",
        art: `${MY_COURSES_ASSETS}/art/cisco-art.png`,
        fallback: radial("#6101CB 0%, #460D98 25%, #2A1865 50%, #20124C 62.5%, #150C33 75%, #0B0619 87.5%, #05030D 93.75%, #000 100%"),
        emblem: `${MY_COURSES_ASSETS}/emblems/ccna.png`,
    },
    crimson: {
        border: "#921F23",
        art: `${MY_COURSES_ASSETS}/art/red-art.png`,
        fallback: radial("#C8292A 0%, #8A1D20 25%, #6B171B 37.5%, #4C1116 50%, #360F15 75%, #1F0D14 100%"),
        emblem: `${MY_COURSES_ASSETS}/emblems/bug-bounty.png`,
    },
    amber: {
        border: "#A1501F",
        art: `${MY_COURSES_ASSETS}/art/orange-art.png`,
        fallback: radial("#DB6921 0%, #B6571C 12.5%, #904516 25%, #6B3211 37.5%, #45200B 50%, #612909 62.5%, #7D3208 75%, #B64505 100%"),
        emblem: `${MY_COURSES_ASSETS}/emblems/soft-skill.png`,
    },
    indigo: {
        border: "#5D72F3",
        art: `${MY_COURSES_ASSETS}/art/blue-art.png`,
        fallback: radial("#131366 0%, #1E1068 50%, #16144E 75%, #0E1934 100%"),
        emblem: `${MY_COURSES_ASSETS}/emblems/ethical-hacking.png`,
    },
    teal: {
        border: "#057F88",
        art: `${MY_COURSES_ASSETS}/art/teal-art.png`,
        fallback: radial("#008080 0%, #0F6971 50%, #008080 100%"),
        emblem: `${MY_COURSES_ASSETS}/emblems/cloud-security.png`,
    },
};

export const UI_ICONS = {
    layers14: `${MY_COURSES_ASSETS}/ui/icon-layers-14.svg`,
    layers16: `${MY_COURSES_ASSETS}/ui/icon-layers-16.svg`,
    layers20: `${MY_COURSES_ASSETS}/ui/icon-layers-20.svg`,
    star12: `${MY_COURSES_ASSETS}/ui/icon-star-12.svg`,
    star16: `${MY_COURSES_ASSETS}/ui/icon-star-16.svg`,
    zap12: `${MY_COURSES_ASSETS}/ui/icon-zap-12.svg`,
    zap16: `${MY_COURSES_ASSETS}/ui/icon-zap-16.svg`,
    clock14: `${MY_COURSES_ASSETS}/ui/icon-clock-14.svg`,
    lock16: `${MY_COURSES_ASSETS}/ui/icon-lock-16.svg`,
    play18: `${MY_COURSES_ASSETS}/ui/icon-play-18.svg`,
    chevronDown16: `${MY_COURSES_ASSETS}/ui/icon-chevron-down-16.svg`,
    arrowBack24: `${MY_COURSES_ASSETS}/leaderboard/icon-arrow-back.svg`,
    buttonHighlight: `${MY_COURSES_ASSETS}/ui/button-highlight.svg`,
} as const;

/** Assets for the course detail ("dedicated course") page. */
export const COURSE_ASSETS = `${MY_COURSES_ASSETS}/course`;
/** Module page artwork (hero poster, kind icons, dividers). */
export const MODULE_ASSETS = `${MY_COURSES_ASSETS}/module`;
/** Quiz / lab overlay artwork. */
export const ACTIVITY_ASSETS = `${MY_COURSES_ASSETS}/activity`;
