"use client";

import { useParams } from "next/navigation";
import ResumeStatus from "@/components/resume-builder/ResumeStatus";

export default function ResumeStatusPage() {
    const { resume_id } = useParams<{ resume_id: string }>();
    return <ResumeStatus key={resume_id} resumeId={resume_id} />;
}
