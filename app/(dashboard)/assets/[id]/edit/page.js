import EditAssetForm from "@/components/dashboard/assets/EditAssetForm";

export const metadata = { title: "Edit Asset — Asset." };

export default async function EditAssetPage({ params }) {
    const { id } = await params;
    return <EditAssetForm id={id} />;
}
