"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="rounded-xl border-2 border-tmt-border bg-white/90 px-4 py-2 text-sm text-tmt-muted hover:border-tmt-error hover:text-tmt-error"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        toast.success("Signed out");
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}
