import type { Metadata } from "next";
import UpdateDetailClient from "@/components/updates/student/UpdateDetailClient";
import { findUpdate } from "@/components/updates/student/mock-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const entry = findUpdate("news", slug);
    return { title: entry ? `${entry.title} | News & Updates` : "News & Updates" };
}

export default async function Page({ params }: Props) {
    const { slug } = await params;
    return <UpdateDetailClient typeSlug="news" identifier={slug} />;
}
