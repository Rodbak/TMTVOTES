"use client";

import { useRouter } from "next/navigation";
import { TopicStatus } from "@prisma/client";
import { toast } from "sonner";

export function TopicActions({
  topicId,
  status,
  title,
}: {
  topicId: string;
  status: TopicStatus;
  title: string;
}) {
  const router = useRouter();

  async function toggle() {
    const next =
      status === TopicStatus.ACTIVE
        ? TopicStatus.CLOSED
        : status === TopicStatus.CLOSED
          ? TopicStatus.ACTIVE
          : TopicStatus.ACTIVE;
    const res = await fetch(`/api/admin/topics/${topicId}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) toast.error("Could not update status");
    else {
      toast.success("Status updated");
      router.refresh();
    }
  }

  async function del() {
    if (!confirm(`Delete topic "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/topics/${topicId}`, { method: "DELETE" });
    if (!res.ok) toast.error("Delete failed");
    else {
      toast.success("Topic deleted");
      router.refresh();
    }
  }

  return (
    <>
      <button type="button" onClick={toggle} className="text-tmt-purple hover:underline">
        Toggle open/close
      </button>
      <button type="button" onClick={del} className="text-tmt-error hover:underline">
        Delete
      </button>
    </>
  );
}
