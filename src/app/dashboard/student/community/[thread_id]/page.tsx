"use client";

import { useParams } from "next/navigation";
import ThreadView from "@/components/community/ThreadView";

export default function CommunityThreadPage() {
    const params = useParams();
    return <ThreadView threadId={params.thread_id as string} />;
}
