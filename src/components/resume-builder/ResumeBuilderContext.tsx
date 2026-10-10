"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { GlobalStyles } from "@mui/material";
import { ResumeContent, ResumeRecord, SEED_RESUMES, createResumeRecord, duplicateResumeRecord } from "./resume-data";
import { saveResume, submitResume as submitResumeRequest } from "./resume-service";
import ResumeDocument from "./ResumeDocument";

interface ResumeBuilderState {
    resumes: ResumeRecord[];
    getResume: (id: string) => ResumeRecord | undefined;
    createResume: () => ResumeRecord;
    updateResume: (id: string, patch: Partial<Omit<ResumeRecord, "id" | "content">>) => void;
    updateContent: (id: string, updater: (content: ResumeContent) => ResumeContent) => void;
    duplicateResume: (id: string) => ResumeRecord | undefined;
    deleteResume: (id: string) => void;
    submitResume: (id: string) => Promise<void>;
    setPrimary: (id: string) => void;
    /** Downloads the server PDF when available, otherwise prints the live preview (Save as PDF). */
    downloadPdf: (id: string) => void;
    notice: string | null;
    notify: (message: string | null) => void;
}

const ResumeBuilderContext = createContext<ResumeBuilderState | null>(null);

export function useResumeBuilder() {
    const ctx = useContext(ResumeBuilderContext);
    if (!ctx) throw new Error("useResumeBuilder must be used inside <ResumeBuilderProvider>");
    return ctx;
}

const touch = (resume: ResumeRecord): ResumeRecord => {
    const next = { ...resume, updatedAt: new Date().toISOString() };
    void saveResume(next);
    return next;
};

/** Prints a single resume page; everything else is hidden by the print stylesheet. */
function PrintRoot({ resume, onDone }: { resume: ResumeRecord; onDone: () => void }) {
    useEffect(() => {
        const finish = () => onDone();
        window.addEventListener("afterprint", finish);
        const timer = window.setTimeout(() => window.print(), 150);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("afterprint", finish);
        };
    }, [onDone]);

    return createPortal(
        <>
            <GlobalStyles
                styles={{
                    "#rb-print-root": { position: "fixed", left: "-10000px", top: 0 },
                    "@media print": {
                        "@page": { size: "auto", margin: 0 },
                        "body *": { visibility: "hidden" },
                        "#rb-print-root, #rb-print-root *": { visibility: "visible" },
                        "#rb-print-root": { position: "absolute", left: 0, top: 0, width: "100%", display: "flex", justifyContent: "center" },
                    },
                }}
            />
            <div id="rb-print-root">
                <ResumeDocument resume={resume} />
            </div>
        </>,
        document.body,
    );
}

/**
 * Holds the student's resumes for the Resume Builder and the Placement apply flow.
 * Preview switch: `?resumes=none` shows the empty list state.
 */
export function ResumeBuilderProvider({ children }: { children: React.ReactNode }) {
    const params = useSearchParams();
    const [resumes, setResumes] = useState<ResumeRecord[]>(() => (params.get("resumes") === "none" ? [] : SEED_RESUMES));
    const [printingId, setPrintingId] = useState<string | null>(null);
    const [notice, notify] = useState<string | null>(null);

    const getResume = useCallback((id: string) => resumes.find((r) => r.id === id), [resumes]);

    const createResume = useCallback(() => {
        const resume = createResumeRecord(resumes.length);
        setResumes((prev) => [resume, ...prev]);
        return resume;
    }, [resumes.length]);

    const updateResume = useCallback((id: string, patch: Partial<Omit<ResumeRecord, "id" | "content">>) => {
        setResumes((prev) => prev.map((r) => (r.id === id ? touch({ ...r, ...patch }) : r)));
    }, []);

    const updateContent = useCallback((id: string, updater: (content: ResumeContent) => ResumeContent) => {
        setResumes((prev) => prev.map((r) => (r.id === id ? touch({ ...r, content: updater(r.content) }) : r)));
    }, []);

    const duplicateResume = useCallback(
        (id: string) => {
            const source = resumes.find((r) => r.id === id);
            if (!source) return undefined;
            const copy = duplicateResumeRecord(source);
            setResumes((prev) => {
                const index = prev.findIndex((r) => r.id === id);
                return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
            });
            return copy;
        },
        [resumes],
    );

    const deleteResume = useCallback((id: string) => setResumes((prev) => prev.filter((r) => r.id !== id)), []);

    const submitResume = useCallback(
        async (id: string) => {
            const source = resumes.find((r) => r.id === id);
            if (!source) return;
            const submitted = await submitResumeRequest(source);
            setResumes((prev) => prev.map((r) => (r.id === id ? submitted : r)));
        },
        [resumes],
    );

    const setPrimary = useCallback((id: string) => {
        setResumes((prev) => prev.map((r) => ({ ...r, isPrimary: r.id === id })));
    }, []);

    const downloadPdf = useCallback(
        (id: string) => {
            const resume = resumes.find((r) => r.id === id);
            if (!resume) return;
            if (resume.pdfUrl) window.open(resume.pdfUrl, "_blank", "noopener,noreferrer");
            else setPrintingId(id);
        },
        [resumes],
    );

    const clearPrinting = useCallback(() => setPrintingId(null), []);
    const printing = printingId ? resumes.find((r) => r.id === printingId) : undefined;

    const value = useMemo<ResumeBuilderState>(
        () => ({
            resumes,
            getResume,
            createResume,
            updateResume,
            updateContent,
            duplicateResume,
            deleteResume,
            submitResume,
            setPrimary,
            downloadPdf,
            notice,
            notify,
        }),
        [resumes, getResume, createResume, updateResume, updateContent, duplicateResume, deleteResume, submitResume, setPrimary, downloadPdf, notice],
    );

    return (
        <ResumeBuilderContext.Provider value={value}>
            {children}
            {printing && <PrintRoot resume={printing} onDone={clearPrinting} />}
        </ResumeBuilderContext.Provider>
    );
}
