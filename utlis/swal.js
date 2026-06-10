import { createRoot } from "react-dom/client";
import ConfirmModal from "@/components/ui/ConfirmModal";

function fire(options) {
    return new Promise((resolve) => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const root = createRoot(container);

        const cleanup = (confirmed) => {
            root.unmount();
            document.body.removeChild(container);
            resolve({ isConfirmed: confirmed });
        };

        root.render(
            <ConfirmModal
                {...options}
                onConfirm={() => cleanup(true)}
                onCancel={() => cleanup(false)}
            />
        );
    });
}

const MySwal = { fire };
export default MySwal;
