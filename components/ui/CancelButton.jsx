"use client";

import { useRouter } from "next/navigation";

export default function CancelButton() {
  const router = useRouter();

  const handleCancel = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <button
      onClick={handleCancel}
      type="button"
      className="px-5 py-2.5 text-sm font-medium text-[#544b40] bg-[#fbf8f2] border border-[#e5dfd3] rounded-[10px] mr-2"
    >
      Cancel
    </button>
  );
}
