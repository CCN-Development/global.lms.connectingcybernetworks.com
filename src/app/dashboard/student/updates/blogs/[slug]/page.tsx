import UpdateDetailClient from "@/components/updates/student/UpdateDetailClient";

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
    const { slug } = await params;
    return <UpdateDetailClient typeSlug="blogs" identifier={slug} />;
}
