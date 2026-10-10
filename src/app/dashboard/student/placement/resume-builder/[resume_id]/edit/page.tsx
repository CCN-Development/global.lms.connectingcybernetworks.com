"use client";

import { useParams } from "next/navigation";
import { Box } from "@mui/material";
import ResumeEditor from "@/components/resume-builder/ResumeEditor";

export default function ResumeEditorPage() {
    const { resume_id } = useParams<{ resume_id: string }>();
    return (
        // Desktop locks the editor to the viewport so both panels scroll independently.
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1, minHeight: 0, height: { lg: "calc(100vh - 48px)" } }}>
            <ResumeEditor key={resume_id} resumeId={resume_id} />
        </Box>
    );
}
