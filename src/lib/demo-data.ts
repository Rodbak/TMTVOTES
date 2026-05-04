import type { Topic, Option } from "@prisma/client";
import { TopicStatus } from "@prisma/client";
import { getVoteCountDeltas } from "./demo-vote-state";

export type TopicWithOptions = Topic & { options: Option[] };

const created = new Date("2026-01-10T15:00:00.000Z");
const updated = new Date("2026-01-15T10:00:00.000Z");

function opts(topicId: string, rows: { text: string; votes: number; suffix: string }[]): Option[] {
  return rows.map((r) => ({
    id: `${topicId}-opt-${r.suffix}`,
    topicId,
    optionText: r.text,
    voteCount: r.votes,
  }));
}

function buildAllstar(): TopicWithOptions {
  const now = Date.now();
  const id = "demo-topic-allstar";
  return {
    id,
    title: "Who should start the All-Star game?",
    description:
      "Fan favourite starter — sample ballot you can reword for sponsors, arenas, or broadcast partners.",
    status: TopicStatus.ACTIVE,
    featured: true,
    startDate: new Date(now - 3 * 86400000),
    endDate: new Date(now + 14 * 86400000),
    createdAt: created,
    updatedAt: updated,
    options: opts(id, [
      { text: "Jordan Lee", votes: 128, suffix: "a" },
      { text: "Sam Rivera", votes: 96, suffix: "b" },
      { text: "Alex Chen", votes: 84, suffix: "c" },
    ]),
  };
}

function buildMvp(): TopicWithOptions {
  const now = Date.now();
  const id = "demo-topic-mvp";
  return {
    id,
    title: "Company MVP — Q1 spotlight",
    description: "Recognise the teammate who shipped the biggest impact this quarter.",
    status: TopicStatus.ACTIVE,
    featured: true,
    startDate: new Date(now - 5 * 86400000),
    endDate: new Date(now + 10 * 86400000),
    createdAt: created,
    updatedAt: updated,
    options: opts(id, [
      { text: "Engineering guild", votes: 203, suffix: "a" },
      { text: "Customer success pod", votes: 187, suffix: "b" },
      { text: "Design systems", votes: 156, suffix: "c" },
    ]),
  };
}

function buildSustainability(): TopicWithOptions {
  const now = Date.now();
  const id = "demo-topic-sustainability";
  return {
    id,
    title: "Next green initiative to fund",
    description: "Employees vote where the sustainability budget goes for the next cycle.",
    status: TopicStatus.ACTIVE,
    featured: false,
    startDate: new Date(now - 2 * 86400000),
    endDate: new Date(now + 21 * 86400000),
    createdAt: created,
    updatedAt: updated,
    options: opts(id, [
      { text: "Solar on HQ roof", votes: 92, suffix: "a" },
      { text: "EV shuttle pilot", votes: 88, suffix: "b" },
      { text: "Ocean plastic offset", votes: 71, suffix: "c" },
      { text: "Local tree planting", votes: 64, suffix: "d" },
    ]),
  };
}

function buildLaunch(): TopicWithOptions {
  const now = Date.now();
  const id = "demo-topic-launch";
  return {
    id,
    title: "Name the new analytics module",
    description: "Product marketing is down to four finalists — pick the name that ships.",
    status: TopicStatus.ACTIVE,
    featured: false,
    startDate: new Date(now - 86400000),
    endDate: new Date(now + 9 * 86400000),
    createdAt: created,
    updatedAt: updated,
    options: opts(id, [
      { text: "PulseLens", votes: 45, suffix: "a" },
      { text: "SignalDeck", votes: 52, suffix: "b" },
      { text: "Northstar", votes: 38, suffix: "c" },
      { text: "BeaconGrid", votes: 41, suffix: "d" },
    ]),
  };
}

function buildSnack(): TopicWithOptions {
  const now = Date.now();
  const id = "demo-topic-snack";
  return {
    id,
    title: "Office snack bracket — finals",
    description: "Which snack wins the bracket? (Demo closed topic with final results.)",
    status: TopicStatus.CLOSED,
    featured: false,
    startDate: new Date(now - 30 * 86400000),
    endDate: new Date(now - 7 * 86400000),
    createdAt: created,
    updatedAt: updated,
    options: opts(id, [
      { text: "Kettle chips", votes: 412, suffix: "a" },
      { text: "Dark chocolate", votes: 389, suffix: "b" },
    ]),
  };
}

function buildRemote(): TopicWithOptions {
  const now = Date.now();
  const id = "demo-topic-remote";
  return {
    id,
    title: "Remote days per week (2025 policy)",
    description: "Closed ballot — leadership used results to set the hybrid baseline.",
    status: TopicStatus.CLOSED,
    featured: false,
    startDate: new Date(now - 90 * 86400000),
    endDate: new Date(now - 45 * 86400000),
    createdAt: created,
    updatedAt: updated,
    options: opts(id, [
      { text: "2 days remote", votes: 512, suffix: "a" },
      { text: "3 days remote", votes: 498, suffix: "b" },
      { text: "Fully flexible", votes: 276, suffix: "c" },
    ]),
  };
}

function buildCharity(): TopicWithOptions {
  const now = Date.now();
  const id = "demo-topic-charity";
  return {
    id,
    title: "Charity partner of the year",
    description: "Annual partner vote — archived after the gala announcement.",
    status: TopicStatus.CLOSED,
    featured: false,
    startDate: new Date(now - 120 * 86400000),
    endDate: new Date(now - 14 * 86400000),
    createdAt: created,
    updatedAt: updated,
    options: opts(id, [
      { text: "City food bank", votes: 623, suffix: "a" },
      { text: "Youth coding camps", votes: 601, suffix: "b" },
      { text: "Disaster relief fund", votes: 534, suffix: "c" },
    ]),
  };
}

const BUILDERS: Record<string, () => TopicWithOptions> = {
  "demo-topic-allstar": buildAllstar,
  "demo-topic-mvp": buildMvp,
  "demo-topic-sustainability": buildSustainability,
  "demo-topic-launch": buildLaunch,
  "demo-topic-snack": buildSnack,
  "demo-topic-remote": buildRemote,
  "demo-topic-charity": buildCharity,
};

function applyDeltas(topic: TopicWithOptions): TopicWithOptions {
  const deltas = getVoteCountDeltas(topic.id);
  if (Object.keys(deltas).length === 0) return topic;
  return {
    ...topic,
    options: topic.options.map((o) => ({
      ...o,
      voteCount: o.voteCount + (deltas[o.id] ?? 0),
    })),
  };
}

export function getPresentationTopicsActive(): TopicWithOptions[] {
  const ids = [
    "demo-topic-allstar",
    "demo-topic-mvp",
    "demo-topic-sustainability",
    "demo-topic-launch",
  ];
  const list = ids.map((id) => applyDeltas(BUILDERS[id]()));
  return list.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}

export function getPresentationTopicsClosed(): TopicWithOptions[] {
  const ids = ["demo-topic-snack", "demo-topic-remote", "demo-topic-charity"];
  const list = ids.map((id) => applyDeltas(BUILDERS[id]()));
  return list.sort((a, b) => (b.endDate?.getTime() ?? 0) - (a.endDate?.getTime() ?? 0));
}

export function getPresentationTopicById(id: string): TopicWithOptions | null {
  const fn = BUILDERS[id];
  if (!fn) return null;
  const t = fn();
  if (t.status === TopicStatus.DRAFT) return null;
  return applyDeltas(t);
}
