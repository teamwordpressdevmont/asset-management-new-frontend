import EditUserForm from "@/components/dashboard/User/EditUserForm";

export const metadata = { title: "Edit User — Asset." };

export default async function EditUserPage({ params }) {
    const { id } = await params;
    return <EditUserForm id={id} />;
}
