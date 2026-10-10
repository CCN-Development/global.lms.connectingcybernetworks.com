"use client";

import React, { useMemo, useRef } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { ResumeRecord, TEMPLATE_UPLOAD, THEMES, formatBytes, rbAsset } from "./resume-data";
import { analyseResume, atsVerdict } from "./resume-service";
import { FitDocument } from "./PreviewPanel";
import { IconList } from "./ResumeModals";
import { PanelTitle, RB, RTEXT, RbField, RbIcon, SectionLabel } from "./rb-ui";

// ─── Step 1: title & theme ─────────────────────────────────────────────────
function ThemeCard({ resume, themeId, label, selected, onSelect }: { resume: ResumeRecord; themeId: ResumeRecord["theme"]; label: string; selected: boolean; onSelect: () => void }) {
    const preview = useMemo(() => ({ ...resume, theme: themeId }), [resume, themeId]);
    return (
        <ButtonBase
            role="radio"
            aria-checked={selected}
            onClick={onSelect}
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", minWidth: 0, borderRadius: "8px", "&:hover .rb-theme-box": { borderColor: selected ? RB.purple : "rgba(239,239,239,0.24)" } }}
        >
            <Box
                className="rb-theme-box"
                sx={{
                    position: "relative",
                    width: "100%",
                    height: 247,
                    overflow: "hidden",
                    borderRadius: "8px",
                    bgcolor: "rgba(239,239,239,0.12)",
                    border: `2px solid ${selected ? RB.purple : "transparent"}`,
                    transition: "border-color .15s ease",
                }}
            >
                <Box aria-hidden sx={{ position: "absolute", inset: "10px 10px auto", pointerEvents: "none", opacity: selected ? 1 : 0.72 }}>
                    <FitDocument resume={preview} />
                </Box>
            </Box>
            <Typography component="span" sx={{ ...RTEXT.med16, color: selected ? RB.white : RB.n400, width: "100%", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {label}
            </Typography>
        </ButtonBase>
    );
}

export function ThemeStep({
    resume,
    onTitle,
    onTheme,
    onTemplate,
    notify,
}: {
    resume: ResumeRecord;
    onTitle: (title: string) => void;
    onTheme: (theme: ResumeRecord["theme"]) => void;
    onTemplate: (file: File) => void;
    notify: (message: string) => void;
}) {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const template = resume.customTemplate;

    const pick = (file: File | undefined) => {
        if (!file) return;
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!["doc", "docx"].includes(ext)) return notify("Only DOC / DOCX templates are supported");
        if (file.size > TEMPLATE_UPLOAD.maxBytes) return notify(`Template must be smaller than ${TEMPLATE_UPLOAD.maxLabel}`);
        onTemplate(file);
    };

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <PanelTitle>Resume Title</PanelTitle>
                <RbField label="Enter Resume Title" value={resume.title} onChange={onTitle} inputProps={{ maxLength: 60 }} sx={{ "& label": { px: "16px" } }} />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <PanelTitle id="rb-theme-label">Choose Theme Style</PanelTitle>
                <Box role="radiogroup" aria-labelledby="rb-theme-label" sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" }, gap: "24px" }}>
                    {THEMES.map((theme) => (
                        <ThemeCard key={theme.id} resume={resume} themeId={theme.id} label={theme.label} selected={resume.theme === theme.id} onSelect={() => onTheme(theme.id)} />
                    ))}
                    <Box
                        role="radio"
                        aria-checked={resume.theme === "custom"}
                        tabIndex={template ? 0 : -1}
                        onClick={() => template && onTheme("custom")}
                        onKeyDown={(event) => {
                            if (template && (event.key === "Enter" || event.key === " ")) onTheme("custom");
                        }}
                        sx={{
                            position: "relative",
                            height: 247,
                            overflow: "hidden",
                            borderRadius: "8px",
                            border: `1px dashed ${resume.theme === "custom" ? RB.purple : "rgba(239,239,239,0.24)"}`,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "40px",
                            px: "24px",
                            cursor: template ? "pointer" : "default",
                        }}
                    >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%", maxWidth: 139, textAlign: "center" }}>
                            <Typography sx={{ ...RTEXT.med12, color: template ? RB.white : RB.n200, overflowWrap: "anywhere" }}>
                                {template ? template.fileName : "You can upload any Template of your choice."}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Typography sx={{ ...RTEXT.med12, color: RB.n500 }}>{TEMPLATE_UPLOAD.formats}</Typography>
                                <Box component="img" src={rbAsset("dot-4.svg")} alt="" aria-hidden sx={{ width: 4, height: 4 }} />
                                <Typography sx={{ ...RTEXT.med12, color: RB.n500 }}>{template ? formatBytes(template.sizeBytes) : TEMPLATE_UPLOAD.maxLabel}</Typography>
                            </Box>
                        </Box>
                        <ButtonBase
                            onClick={(event) => {
                                event.stopPropagation();
                                fileRef.current?.click();
                            }}
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                height: 32,
                                pl: "12px",
                                pr: "16px",
                                borderRadius: "8px",
                                border: `1px solid ${RB.n600}`,
                                opacity: 0.8,
                                boxShadow: "0 5px 20px 0 rgba(0,0,0,0.02)",
                                ...RTEXT.med12,
                                color: RB.n100,
                                "&:hover": { opacity: 1 },
                            }}
                        >
                            <RbIcon name="icon-upload-16.svg" size={16} />
                            {template ? "Replace" : "Upload"}
                        </ButtonBase>
                        <input
                            ref={fileRef}
                            type="file"
                            accept={TEMPLATE_UPLOAD.accept}
                            hidden
                            onChange={(event) => {
                                pick(event.target.files?.[0]);
                                event.target.value = "";
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </>
    );
}

// ─── Step 3: review & optimise ─────────────────────────────────────────────
function AtsGauge() {
    return (
        <Box aria-hidden sx={{ position: "relative", width: 260, height: 187, flexShrink: 0, overflow: "hidden" }}>
            <Box
                sx={{
                    position: "relative",
                    width: 260,
                    height: 260,
                    borderRadius: "50%",
                    overflow: "hidden",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        padding: "5px",
                        backgroundImage: "linear-gradient(180deg, #737373 0%, #737373 45%, rgba(115,115,115,0) 72%)",
                        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                    },
                }}
            >
                <Box sx={{ position: "absolute", left: 5, top: 5, width: 250, height: 250 }}>
                    <Box component="img" src={rbAsset("ats-gauge-base.png")} alt="" sx={{ position: "absolute", inset: 0, width: 250, height: 250 }} />
                    <Box component="img" src={rbAsset("ats-gauge-ring-1.svg")} alt="" sx={{ position: "absolute", left: 10.73, top: 12.81, width: 232.737, height: 153.989, maxWidth: "none" }} />
                    <Box component="img" src={rbAsset("ats-gauge-ring-2.svg")} alt="" sx={{ position: "absolute", left: 46.75, top: 51.83, width: 161.119, height: 108.473, maxWidth: "none" }} />
                    <Box component="img" src={rbAsset("ats-gauge-ring-3.svg")} alt="" sx={{ position: "absolute", left: 73.75, top: 81.84, width: 107.668, height: 74.4967, maxWidth: "none" }} />
                </Box>
            </Box>
        </Box>
    );
}

export function ReviewStep({ resume }: { resume: ResumeRecord }) {
    const review = useMemo(() => analyseResume(resume.content), [resume.content]);
    const verdict = atsVerdict(review.score);
    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <SectionLabel>ATS Score</SectionLabel>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "center", sm: "flex-start" }, gap: "32px", mt: "8px" }}>
                    <AtsGauge />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, minWidth: 0, textAlign: { xs: "center", sm: "left" } }}>
                        <Typography sx={{ ...RTEXT.med16, fontSize: "17.5px", lineHeight: "26.249px", color: RB.n300 }}>Your Score</Typography>
                        <Typography component="p" aria-label={`ATS score ${review.score} out of ${review.maxScore}`} sx={{ ...RTEXT.poppinsSemi36, color: RB.white }}>
                            {review.score}/{review.maxScore}
                        </Typography>
                        <Typography sx={{ ...RTEXT.med16, color: verdict.color }}>{verdict.text}</Typography>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <SectionLabel>Strengths</SectionLabel>
                <IconList items={review.strengths} icon="icon-check-circle-teal.svg" />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <SectionLabel>Improve your resume with AI</SectionLabel>
                <IconList items={review.improvements} icon="icon-ai-spark-20.svg" />
            </Box>
        </>
    );
}
