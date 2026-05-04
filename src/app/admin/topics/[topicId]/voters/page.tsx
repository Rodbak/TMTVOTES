import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

type Props = { params: { topicId: string } };

export default async function AdminVotersPage({ params }: Props) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");

  const topic = await prisma.topic.findUnique({ where: { id: params.topicId } });
  if (!topic) notFound();

  const votes = await prisma.vote.findMany({
    where: { topicId: params.topicId },
    orderBy: { votedAt: "desc" },
    include: { option: { select: { optionText: true } } },
  });

  return (
    <div className="min-h-screen bg-tmt-bg px-4 py-8 text-tmt-text">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/dashboard" className="text-sm text-tmt-cyan hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold">Voter audit — {topic.title}</h1>
        <p className="mt-2 text-sm text-tmt-muted">
          Identifiers are stored as hashes only. Below is a masked fingerprint for support — not
          the original email or phone.
        </p>
        <div className="mt-8 glass overflow-hidden rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-tmt-surfaceMuted text-tmt-muted">
              <tr>
                <th className="px-4 py-3">Masked ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Choice</th>
                <th className="px-4 py-3">Voted at</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((v) => (
                <tr key={v.id} className="border-t border-tmt-border/40">
                  <td className="px-4 py-2 font-mono text-xs">
                    {v.voterIdentifierHash.slice(0, 8)}…{v.voterIdentifierHash.slice(-6)}
                  </td>
                  <td className="px-4 py-2">{v.identifierType}</td>
                  <td className="px-4 py-2">{v.option.optionText}</td>
                  <td className="px-4 py-2 text-tmt-muted">
                    {v.votedAt.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
