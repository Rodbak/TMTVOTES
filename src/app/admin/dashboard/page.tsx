import Link from "next/link";
import { redirect } from "next/navigation";
import { TopicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth-server";
import { closeExpiredTopics } from "@/lib/topics";
import { LogoutButton } from "./logout-button";
import { TopicActions } from "./topic-actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");

  await closeExpiredTopics();
  const [topics, stats] = await Promise.all([
    prisma.topic.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: {
        options: true,
        _count: { select: { votes: true } },
      },
    }),
    prisma.$transaction([
      prisma.topic.count(),
      prisma.vote.count(),
      prisma.topic.count({ where: { status: TopicStatus.ACTIVE } }),
      prisma.topic.count({ where: { status: TopicStatus.CLOSED } }),
    ]),
  ]);

  const [totalTopics, totalVotes, activeCount, closedCount] = stats;

  return (
    <div className="min-h-screen bg-tmt-bg px-4 py-8 text-tmt-text">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-tmt-muted">Signed in as</p>
            <h1 className="font-display text-3xl font-bold">
              {admin.displayName}
              <span className="text-tmt-muted"> ({admin.username})</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/topics/new" className="btn-glow px-5 py-2 text-sm">
              Create New Topic
            </Link>
            <LogoutButton />
            <Link
              href="/"
              className="rounded-xl border-2 border-tmt-border bg-white/90 px-4 py-2 text-sm text-tmt-muted hover:border-tmt-cyan"
            >
              Public site
            </Link>
          </div>
        </header>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total topics", value: totalTopics },
            { label: "Votes cast (all)", value: totalVotes },
            { label: "Active", value: activeCount },
            { label: "Closed", value: closedCount },
          ].map((c) => (
            <div key={c.label} className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-wider text-tmt-muted">{c.label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-tmt-cyan tabular-nums">
                {c.value}
              </p>
            </div>
          ))}
        </div>

        <div className="glass overflow-hidden rounded-2xl">
          <div className="border-b border-tmt-border/80 bg-tmt-surfaceMuted/50 px-6 py-4 font-display text-lg font-bold">
            All topics
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-tmt-surfaceMuted text-tmt-muted">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Votes</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => (
                  <tr key={t.id} className="border-t border-tmt-border/40 hover:bg-tmt-surfaceMuted/60">
                    <td className="px-6 py-3 font-medium">{t.title}</td>
                    <td className="px-6 py-3 text-tmt-muted">{t.status}</td>
                    <td className="px-6 py-3 tabular-nums">{t._count.votes}</td>
                    <td className="px-6 py-3 text-tmt-muted">
                      {t.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Link
                          href={`/admin/topics/edit/${t.id}`}
                          className="text-tmt-cyan hover:underline"
                        >
                          Edit
                        </Link>
                        <Link href={`/results/${t.id}`} className="text-tmt-muted hover:underline">
                          View results
                        </Link>
                        <Link
                          href={`/admin/topics/${t.id}/voters`}
                          className="text-tmt-purple hover:underline"
                        >
                          Voters
                        </Link>
                        <TopicActions topicId={t.id} status={t.status} title={t.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
