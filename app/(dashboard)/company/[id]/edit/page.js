import EditCompanyForm from "@/components/dashboard/company/EditCompanyForm";

export const metadata = { title: "Edit Company — Asset." };

export default async function EditCompanyPage({ params }) {
    const { id } = await params;
    return <EditCompanyForm id={id} />;
}
