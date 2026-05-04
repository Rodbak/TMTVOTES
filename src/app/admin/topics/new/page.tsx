import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth-server";
import { TopicForm } from "../topic-form";

export const dynamic = "force-dynamic";

export default async function NewTopicPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-tmt-bg px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin/dashboard" className="text-sm text-tmt-cyan hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-tmt-text">Create topic</h1>
        <p className="mt-2 text-sm text-tmt-muted">
          Set dates to control visibility; active topics appear on the public homepage.
        </p>
        <div className="mt-8 glass rounded-2xl p-6">
          <TopicForm mode="new" />
        </div>
      </div>
    </div>
  );
}
