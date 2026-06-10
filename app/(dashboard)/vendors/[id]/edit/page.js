import EditVendorForm from "@/components/dashboard/vendors/EditVendorForm";

export const metadata = { title: "Edit Vendor — Asset." };

export default async function EditVendorPage({ params }) {
    const { id } = await params;
    return <EditVendorForm id={id} />;
}
