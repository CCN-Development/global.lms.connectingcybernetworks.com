import UpdatePreviewClient from "./UpdatePreviewClient";

type Props = { params: Promise<{ type: string; update_id: string }> };

export default async function Page({ params }: Props) {
    const { type, update_id } = await params;
    return <UpdatePreviewClient typeSlug={type} updateId={update_id} />;
}
