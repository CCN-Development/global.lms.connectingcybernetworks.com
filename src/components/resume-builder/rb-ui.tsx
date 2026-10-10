"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, ButtonBase, InputBase, SxProps, Theme, Typography } from "@mui/material";
import { FONT_INTER, FONT_LATO, FONT_POPPINS, gradientBorder } from "@/components/aish/tokens";
import { LmsButton } from "@/components/community/community-ui";
import { PL, PTEXT } from "@/components/placement/placement-ui";
import { BuilderStep, DETAILS_TABS, DetailsTab, STEPS, rbAsset } from "./resume-data";

// ─── Tokens (Figma variables) ──────────────────────────────────────────────
export const RB = {
    ...PL,
    purple: "#8C24FF",
    teal: "#2EC4B6",
    success400: "#42CC42",
    warning: "#FFAD4F",
    linkBlue: "#426ACC",
    infoBg: "#E3E9F8",
    infoBorder: "#93A9E2",
    infoText: "#244085",
    fieldBg: "rgba(255,255,255,0.02)",
    fieldBorder: "rgba(64,64,64,0.5)",
    editorBorder: "rgba(227,233,248,0.1)",
    panelBg: "linear-gradient(152.93deg, rgba(0,0,0,0.387) 1.34%, rgba(10,9,9,0.282) 48.72%, rgba(102,102,102,0.009) 96.09%)",
    pillGlass: "linear-gradient(180deg, rgba(187,201,237,0.44) 0%, rgba(106,114,135,0.26) 100%)",
    aiText: "linear-gradient(91.8deg, #F1C40E 0.61%, #FF6000 171.5%)",
    warmText: "linear-gradient(90deg, #F1C40E 0%, #FF6000 100%)",
    acceptBg: "linear-gradient(114deg, #2EC4B6 -10%, #258875 30%, #227964 50%, #206A54 70%, #1B4C33 104%)",
    aiPanelBg: "rgba(255,239,220,0.04)",
    menuBg: "rgba(38,38,38,0.88)",
} as const;

export const RTEXT = {
    ...PTEXT,
    semi12: { fontFamily: FONT_LATO, fontWeight: 600, fontSize: "12px", lineHeight: "18px" },
    semi16: { fontFamily: FONT_LATO, fontWeight: 600, fontSize: "16px", lineHeight: "24px" },
    poppinsReg52: { fontFamily: FONT_POPPINS, fontWeight: 400, fontSize: "52px", lineHeight: "78px" },
    poppinsMed32: { fontFamily: FONT_POPPINS, fontWeight: 500, fontSize: "32px", lineHeight: "48px" },
    poppinsSemi36: { fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: "36px", lineHeight: "54px" },
    interMed16: { fontFamily: FONT_INTER, fontWeight: 500, fontSize: "16px", lineHeight: "24px" },
} as const;

const asArray = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : [sx]);

// ─── Icons ─────────────────────────────────────────────────────────────────
/** Renders a design SVG/PNG from /public/resume-builder at its native size. */
export function RbIcon({ name, size, height, sx }: { name: string; size: number; height?: number; sx?: SxProps<Theme> }) {
    return (
        <Box aria-hidden sx={[{ lineHeight: 0, flexShrink: 0, pointerEvents: "none" }, ...asArray(sx)]}>
            <Image src={rbAsset(name)} alt="" width={size} height={height ?? size} style={{ display: "block", width: size, height: height ?? size, maxWidth: "none" }} />
        </Box>
    );
}

// ─── Glass panel ("My Tasks" frame) ────────────────────────────────────────
export function GlassPanel({ children, sx, component = "section" }: { children: React.ReactNode; sx?: SxProps<Theme>; component?: React.ElementType }) {
    return (
        <Box
            component={component}
            sx={[
                {
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "24px",
                    backgroundImage: RB.panelBg,
                    backdropFilter: "blur(12px)",
                    boxShadow: "inset 0 3px 6px 0 rgba(255,255,255,0.16)",
                    "&::before": gradientBorder(),
                },
                ...asArray(sx),
            ]}
        >
            <Box aria-hidden sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <Box sx={{ position: "absolute", left: 4, top: -7, width: 800, height: 15, filter: "blur(50px)" }}>
                    <Box component="img" src={rbAsset("panel-glow.png")} alt="" sx={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
                <Box sx={{ position: "absolute", left: 4, bottom: -16, width: 800, height: 15, filter: "blur(50px)", transform: "scaleY(-1)" }}>
                    <Box component="img" src={rbAsset("panel-glow.png")} alt="" sx={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
                <Box sx={{ position: "absolute", left: -13, top: 31, width: 12, height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box sx={{ position: "relative", width: 380, height: 12, flexShrink: 0, transform: "rotate(90deg)" }}>
                        <Box component="img" src={rbAsset("panel-edge-glow-b.svg")} alt="" sx={{ position: "absolute", left: -24, top: -24, width: 428, height: 60, maxWidth: "none" }} />
                    </Box>
                </Box>
            </Box>
            {children}
        </Box>
    );
}

// ─── Typography helpers ────────────────────────────────────────────────────
export function PanelTitle({ children, id }: { children: React.ReactNode; id?: string }) {
    return (
        <Typography id={id} component="h2" sx={{ ...RTEXT.poppinsMed20, color: RB.n100, whiteSpace: "nowrap" }}>
            {children}
        </Typography>
    );
}

export function SectionLabel({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) {
    return (
        <Typography component="h3" sx={[{ ...RTEXT.semi12, color: RB.n500, textTransform: "uppercase", ...{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, ...asArray(sx)]}>
            {children}
        </Typography>
    );
}

/** Gradient text ("Gradients 4"). */
export const gradientText = (paint: string = RB.warmText) =>
    ({ backgroundImage: paint, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }) as const;

// ─── Form field ("Student-Input") ──────────────────────────────────────────
export function RbField({
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    type = "text",
    error,
    inputProps,
    sx,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    type?: string;
    error?: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    sx?: SxProps<Theme>;
}) {
    const id = React.useId();
    return (
        <Box sx={[{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }, ...asArray(sx)]}>
            <Box
                component="label"
                htmlFor={id}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "4px",
                    minHeight: 63,
                    minWidth: 0,
                    p: "12px",
                    borderRadius: "12px",
                    bgcolor: RB.fieldBg,
                    border: `1px solid ${error ? RB.error : RB.fieldBorder}`,
                    cursor: "text",
                    transition: "border-color .15s ease",
                    "&:focus-within": { borderColor: error ? RB.error : RB.primary },
                }}
            >
                <Typography component="span" sx={{ ...RTEXT.reg12, color: RB.n300 }}>
                    {label}
                </Typography>
                <InputBase
                    id={id}
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={onBlur}
                    inputProps={{ ...inputProps, "aria-invalid": !!error }}
                    sx={{
                        p: 0,
                        ...RTEXT.med16,
                        color: RB.white,
                        "& input": { p: 0, height: "24px", textOverflow: "ellipsis" },
                        "& input::placeholder": { color: RB.n500, opacity: 1 },
                    }}
                />
            </Box>
            {error && (
                <Typography role="alert" sx={{ ...RTEXT.reg12, color: RB.error, pl: "4px" }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
}

export function FieldRow({ children }: { children: React.ReactNode }) {
    return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: "16px", width: "100%" }}>{children}</Box>;
}

// ─── Buttons ───────────────────────────────────────────────────────────────
/** Gradient "LMS Button" (Create Resume, Next, Submit…). */
export function PrimaryButton({
    children,
    onClick,
    icon,
    disabled,
    glowLine = false,
    sx,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    glowLine?: boolean;
    sx?: SxProps<Theme>;
}) {
    return (
        <LmsButton onClick={onClick} icon={icon} disabled={disabled} glowLine={glowLine} sx={[{ gap: "8px", flexShrink: 0 }, ...asArray(sx)]}>
            {children}
        </LmsButton>
    );
}

/** Bordered "LMS Button" (Previous, Retry). */
export function GhostButton({ children, onClick, borderWidth = 2, disabled, sx }: { children: React.ReactNode; onClick?: () => void; borderWidth?: 1 | 2; disabled?: boolean; sx?: SxProps<Theme> }) {
    return (
        <ButtonBase
            onClick={onClick}
            disabled={disabled}
            sx={[
                {
                    height: 44,
                    px: "16px",
                    flexShrink: 0,
                    borderRadius: "10px",
                    border: `${borderWidth}px solid ${RB.editorBorder}`,
                    ...RTEXT.interMed14,
                    color: RB.white,
                    whiteSpace: "nowrap",
                    transition: "border-color .15s ease, background-color .15s ease",
                    "&:hover": { borderColor: "rgba(227,233,248,0.32)", bgcolor: "rgba(255,255,255,0.03)" },
                    "&.Mui-disabled": { opacity: 0.5, color: RB.white },
                },
                ...asArray(sx),
            ]}
        >
            {children}
        </ButtonBase>
    );
}

/** Modal "Cancel" button (1px #404040 stroke). */
export function CancelButton({ onClick, label = "Cancel" }: { onClick: () => void; label?: string }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                flex: 1,
                minWidth: 0,
                height: 44,
                px: "24px",
                borderRadius: "10px",
                border: `1px solid ${RB.neutral700}`,
                ...RTEXT.interMed14,
                color: RB.n100,
                transition: "border-color .15s ease",
                "&:hover": { borderColor: RB.n500 },
            }}
        >
            {label}
        </ButtonBase>
    );
}

/** Rounded glass pill (Remove / Change Image / status page actions / Tips). */
export function GlassPill({
    children,
    icon,
    onClick,
    href,
    filled,
    height = 44,
    sx,
    ...rest
}: {
    children: React.ReactNode;
    icon?: string;
    onClick?: () => void;
    href?: string;
    filled?: boolean;
    height?: number;
    sx?: SxProps<Theme>;
} & Omit<React.ComponentProps<typeof ButtonBase>, "sx" | "children" | "onClick">) {
    return (
        <ButtonBase
            {...rest}
            onClick={onClick}
            {...(href ? { LinkComponent: Link, href } : {})}
            sx={[
                {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height,
                    px: "16px",
                    flexShrink: 0,
                    borderRadius: "99px",
                    border: `1px solid ${RB.pillBorder}`,
                    backgroundImage: filled ? RB.pillGlass : "none",
                    backdropFilter: "blur(12px)",
                    ...RTEXT.med16,
                    color: RB.white,
                    whiteSpace: "nowrap",
                    transition: "filter .15s ease, background-color .15s ease",
                    "&:hover": filled ? { filter: "brightness(1.15)" } : { bgcolor: "rgba(227,233,248,0.08)" },
                },
                ...asArray(sx),
            ]}
        >
            {icon && <RbIcon name={icon} size={20} />}
            {children}
        </ButtonBase>
    );
}

export function TipsButton({ onClick }: { onClick: () => void }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                px: "16px",
                py: "4px",
                flexShrink: 0,
                borderRadius: "99px",
                border: `1px solid ${RB.pillBorder}`,
                backdropFilter: "blur(12px)",
                ...RTEXT.med14,
                color: RB.n100,
                "&:hover": { bgcolor: "rgba(227,233,248,0.08)" },
            }}
        >
            <RbIcon name="icon-alert-circle-16.svg" size={16} sx={{ transform: "rotate(180deg)" }} />
            Tips
        </ButtonBase>
    );
}

/** "+ Add …" text button ("btn-secondary"). `small` is the 14px blue variant used for Add Link. */
export function AddButton({ label, onClick, small }: { label: string; onClick: () => void; small?: boolean }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: small ? "8px" : "6px",
                py: small ? 0 : "4px",
                borderRadius: "12px",
                flexShrink: 0,
                ...(small ? RTEXT.interMed14 : RTEXT.med16),
                color: small ? RB.linkBlue : RB.primary200,
                whiteSpace: "nowrap",
                "&:hover": { filter: "brightness(1.2)" },
            }}
        >
            <RbIcon name={small ? "icon-plus-16-blue.svg" : "icon-plus-20-blue.svg"} size={small ? 16 : 20} />
            {label}
        </ButtonBase>
    );
}

/** Round icon button used on list rows (eye / more). */
export function RoundIconButton({ icon, label, onClick, bare, ...rest }: { icon: string; label: string; onClick: (event: React.MouseEvent<HTMLButtonElement>) => void; bare?: boolean } & Omit<React.ComponentProps<typeof ButtonBase>, "onClick">) {
    return (
        <ButtonBase
            {...rest}
            aria-label={label}
            onClick={(event) => {
                event.stopPropagation();
                onClick(event);
            }}
            sx={{
                width: bare ? 24 : 40,
                height: bare ? 24 : 40,
                flexShrink: 0,
                borderRadius: "99px",
                ...(bare
                    ? { "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }
                    : {
                          bgcolor: "rgba(38,38,38,0.12)",
                          border: `1px solid ${RB.neutral700}`,
                          boxShadow: "0 5px 20px 0 rgba(0,0,0,0.02)",
                          "&:hover": { borderColor: RB.n600 },
                      }),
            }}
        >
            <RbIcon name={icon} size={20} />
        </ButtonBase>
    );
}

// ─── Removable skill pill ──────────────────────────────────────────────────
export function SkillPill({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                p: "12px",
                borderRadius: "50px",
                bgcolor: "rgba(140,36,255,0.12)",
                border: "1px solid rgba(140,36,255,0.24)",
            }}
        >
            <Typography component="span" sx={{ ...RTEXT.med16, color: RB.n75, whiteSpace: "nowrap" }}>
                {label}
            </Typography>
            <ButtonBase aria-label={`Remove ${label}`} onClick={onRemove} sx={{ borderRadius: "50%", "&:hover": { opacity: 0.7 } }}>
                <RbIcon name="icon-x-circle-pill.svg" size={20} />
            </ButtonBase>
        </Box>
    );
}

// ─── Stepper ───────────────────────────────────────────────────────────────
export function BuilderStepper({ current, onSelect }: { current: BuilderStep; onSelect: (step: BuilderStep) => void }) {
    const currentIndex = STEPS.findIndex((s) => s.id === current);
    return (
        <Box component="ol" aria-label="Resume builder steps" sx={{ display: "flex", alignItems: "center", gap: { xs: "8px", md: "16px" }, m: 0, p: 0, listStyle: "none", minWidth: 0 }}>
            {STEPS.map((step, i) => {
                const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "pending";
                const color = state === "done" ? RB.teal : state === "active" ? RB.white : RB.n500;
                return (
                    <React.Fragment key={step.id}>
                        {i > 0 && <RbIcon name="stepper-line.svg" size={60} height={1} sx={{ display: { xs: "none", lg: "block" } }} />}
                        <Box component="li" sx={{ display: "flex" }}>
                            <ButtonBase
                                aria-current={state === "active" ? "step" : undefined}
                                onClick={() => onSelect(step.id)}
                                sx={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "50px", "&:hover .rb-step-label": { textDecoration: state === "active" ? "none" : "underline" } }}
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        flexShrink: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "50px",
                                        backdropFilter: "blur(8px)",
                                        ...(state === "active"
                                            ? { backgroundImage: "linear-gradient(-10.52deg, rgb(25,44,92) 7.71%, rgb(52,93,194) 92.29%)" }
                                            : { border: `1px solid ${state === "done" ? RB.teal : RB.n500}` }),
                                        ...RTEXT.med16,
                                        color: state === "pending" ? RB.n500 : RB.white,
                                    }}
                                >
                                    {i + 1}
                                </Box>
                                <Typography
                                    className="rb-step-label"
                                    component="span"
                                    sx={{ ...RTEXT.med16, color, whiteSpace: "nowrap", display: { xs: state === "active" ? "inline" : "none", lg: "inline" } }}
                                >
                                    {step.label}
                                </Typography>
                            </ButtonBase>
                        </Box>
                    </React.Fragment>
                );
            })}
        </Box>
    );
}

// ─── Details tab bar ───────────────────────────────────────────────────────
export function DetailsTabBar({ current, onSelect }: { current: DetailsTab; onSelect: (tab: DetailsTab) => void }) {
    const activeRef = React.useRef<HTMLButtonElement | null>(null);
    React.useEffect(() => {
        activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }, [current]);

    return (
        <Box
            role="tablist"
            aria-label="Resume sections"
            sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                width: "100%",
                borderBottom: `1px solid ${RB.neutral700}`,
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
            }}
        >
            {DETAILS_TABS.map((tab) => {
                const active = tab.id === current;
                return (
                    <ButtonBase
                        key={tab.id}
                        ref={active ? activeRef : undefined}
                        role="tab"
                        aria-selected={active}
                        onClick={() => onSelect(tab.id)}
                        sx={{
                            flexShrink: 0,
                            px: active ? "8px" : 0,
                            py: "16px",
                            mb: "-1px",
                            borderBottom: active ? `3px solid ${RB.purple}` : "3px solid transparent",
                            ...RTEXT.med16,
                            color: active ? RB.purple : RB.n600,
                            whiteSpace: "nowrap",
                            transition: "color .15s ease",
                            "&:hover": { color: active ? RB.purple : RB.n300 },
                        }}
                    >
                        {tab.label}
                    </ButtonBase>
                );
            })}
        </Box>
    );
}

// ─── Accordion entry card ──────────────────────────────────────────────────
export function EntryCard({
    label,
    title,
    expanded,
    onToggle,
    onDelete,
    children,
}: {
    label: string;
    title: string;
    expanded: boolean;
    onToggle: () => void;
    onDelete?: () => void;
    children: React.ReactNode;
}) {
    const bodyId = React.useId();
    if (!expanded) {
        return (
            <ButtonBase
                aria-expanded={false}
                aria-controls={bodyId}
                onClick={onToggle}
                sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    px: "16px",
                    py: "12px",
                    borderRadius: "12px",
                    bgcolor: RB.fieldBg,
                    border: `1px solid ${RB.fieldBorder}`,
                    textAlign: "left",
                    "&:hover": { borderColor: RB.n600 },
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                    <Typography component="span" sx={{ ...RTEXT.med12, color: RB.n300, textTransform: "uppercase" }}>
                        {label}
                    </Typography>
                    <Typography component="span" sx={{ ...RTEXT.med16, color: title ? RB.white : RB.n500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {title || "Untitled"}
                    </Typography>
                </Box>
                <RbIcon name="icon-chevron-down-collapsed.svg" size={20} />
            </ButtonBase>
        );
    }
    return (
        <Box id={bodyId} sx={{ display: "flex", flexDirection: "column", gap: "16px", p: "16px", borderRadius: "12px", bgcolor: "rgba(255,255,255,0.04)", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <Typography component="span" sx={{ ...RTEXT.med12, color: RB.n300, textTransform: "uppercase" }}>
                    {label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {onDelete && (
                        <ButtonBase aria-label={`Delete ${label.toLowerCase()}`} onClick={onDelete} sx={{ borderRadius: "4px", "&:hover": { opacity: 0.75 } }}>
                            <RbIcon name="icon-trash-red.svg" size={22} />
                        </ButtonBase>
                    )}
                    <ButtonBase aria-label={`Collapse ${label.toLowerCase()}`} aria-expanded onClick={onToggle} sx={{ borderRadius: "4px", "&:hover": { opacity: 0.75 } }}>
                        <RbIcon name="icon-chevron-down-expanded.svg" size={20} sx={{ transform: "rotate(180deg)" }} />
                    </ButtonBase>
                </Box>
            </Box>
            {children}
        </Box>
    );
}

// ─── Dividers ──────────────────────────────────────────────────────────────
/** "— 2 Resume Added —" counter with fading rules on both sides. */
export function CountDivider({ label }: { label: string }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
            <Box component="img" src={rbAsset("divider-left.svg")} alt="" aria-hidden sx={{ flex: 1, minWidth: 0, height: "1px", display: "block" }} />
            <Typography sx={{ ...RTEXT.med12, color: RB.n300, whiteSpace: "nowrap" }}>{label}</Typography>
            <Box component="img" src={rbAsset("divider-right.svg")} alt="" aria-hidden sx={{ flex: 1, minWidth: 0, height: "1px", display: "block", transform: "rotate(180deg)" }} />
        </Box>
    );
}
