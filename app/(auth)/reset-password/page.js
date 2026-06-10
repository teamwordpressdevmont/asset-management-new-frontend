import ResetPasswordForm from "@/components/auth/ResetPassword";
import { Suspense } from "react";

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
