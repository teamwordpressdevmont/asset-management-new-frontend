import EditCategoryForm from "@/components/dashboard/assetCategory/EditCategoryForm";

export const metadata = { title: "Edit Asset Category — Asset." };

export default async function EditCategoryPage({ params }) {
    const { id } = await params;
    return <EditCategoryForm id={id} />;
}
