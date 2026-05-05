import { PrismaClient, TopicStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_TOPICS = [
  {
    title: "Best programming language 2025",
    description: "Which language do you think will dominate in 2025?",
    options: ["Python", "JavaScript", "Rust", "Go"],
    votes: [42, 38, 19, 11],
    status: TopicStatus.ACTIVE,
    featured: true,
  },
  {
    title: "Remote vs office work",
    description: "What work setup do you prefer in the modern workplace?",
    options: ["Fully remote", "Hybrid", "Full office"],
    votes: [65, 48, 22],
    status: TopicStatus.ACTIVE,
    featured: false,
  },
  {
    title: "Best social media platform",
    description: "Which platform do you use and enjoy the most?",
    options: ["Instagram", "TikTok", "X (Twitter)", "YouTube"],
    votes: [30, 55, 18, 41],
    status: TopicStatus.ACTIVE,
    featured: false,
  },
  {
    title: "Favourite music genre",
    description: "Vote for your all-time favourite genre.",
    options: ["Afrobeats", "Hip-Hop", "Pop", "R&B", "Gospel"],
    votes: [80, 60, 40, 55, 35],
    status: TopicStatus.CLOSED,
    featured: false,
  },
];

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.ADMIN_PASSWORD?.trim() || "tmt2024";
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || "Administrator";

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.admin.create({
      data: { username, passwordHash, displayName },
    });
    console.log(`Created admin "${username}" (override via ADMIN_PASSWORD).`);
  } else {
    console.log(`Admin "${username}" already exists — skipping.`);
  }

  const count = await prisma.topic.count();
  if (count === 0) {
    for (const t of SEED_TOPICS) {
      await prisma.topic.create({
        data: {
          title: t.title,
          description: t.description,
          status: t.status,
          featured: t.featured,
          options: {
            create: t.options.map((label, i) => ({
              optionText: label,
              voteCount: t.votes[i] ?? 0,
              position: i,
            })),
          },
        },
      });
    }
    console.log(`Seeded ${SEED_TOPICS.length} topics.`);
  } else {
    console.log(`${count} topics already exist — skipping topic seed.`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
