"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type TopicStatus = "active" | "closed";

export type Topic = {
  id: number | string;
  title: string;
  desc: string;
  options: string[];
  optionIds?: string[];
  votes: number[];
  status: TopicStatus;
};

const HAS_BACKEND = process.env.NEXT_PUBLIC_HAS_BACKEND === "1";

const SEED_TOPICS: Topic[] = [
  {
    id: 1,
    title: "Best programming language 2025",
    desc: "Which language do you think will dominate in 2025?",
    options: ["Python", "JavaScript", "Rust", "Go"],
    votes: [42, 38, 19, 11],
    status: "active",
  },
  {
    id: 2,
    title: "Remote vs office work",
    desc: "What work setup do you prefer in the modern workplace?",
    options: ["Fully remote", "Hybrid", "Full office"],
    votes: [65, 48, 22],
    status: "active",
  },
  {
    id: 3,
    title: "Best social media platform",
    desc: "Which platform do you use and enjoy the most?",
    options: ["Instagram", "TikTok", "X (Twitter)", "YouTube"],
    votes: [30, 55, 18, 41],
    status: "active",
  },
  {
    id: 4,
    title: "Favourite music genre",
    desc: "Vote for your all-time favourite genre.",
    options: ["Afrobeats", "Hip-Hop", "Pop", "R&B", "Gospel"],
    votes: [80, 60, 40, 55, 35],
    status: "closed",
  },
];

type VoteOutcome =
  | { ok: true }
  | {
      ok: false;
      error:
        | "already_voted"
        | "voting_closed"
        | "network"
        | "validation"
        | "captcha_failed";
      message?: string;
    };

type Ctx = {
  topics: Topic[];
  voted: Record<string, true>;
  loggedIn: boolean;
  hasBackend: boolean;
  ready: boolean;
  refresh: () => Promise<void>;
  vote: (
    topicId: Topic["id"],
    optionIndex: number,
    identifier: string,
    identifierType: "EMAIL" | "PHONE",
    turnstileToken?: string,
  ) => Promise<VoteOutcome>;
  hasVoted: (topicId: Topic["id"]) => boolean;
  toggleStatus: (topicId: Topic["id"]) => Promise<void>;
  removeTopic: (topicId: Topic["id"]) => Promise<void>;
  createTopic: (title: string, desc: string, options: string[]) => Promise<Topic["id"] | null>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const TopicsCtx = createContext<Ctx | null>(null);

const KEY_TOPICS = "tmt.topics";
const KEY_VOTED = "tmt.voted";
const KEY_NID = "tmt.nid";
const KEY_LOGIN = "tmt.loggedIn";

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy mode */
  }
}

type ApiTopic = {
  id: string;
  title: string;
  desc: string;
  status: "active" | "closed" | "draft";
  options: { id: string; label: string; voteCount: number }[];
};

function fromApi(t: ApiTopic): Topic | null {
  if (t.status === "draft") return null;
  return {
    id: t.id,
    title: t.title,
    desc: t.desc,
    options: t.options.map((o) => o.label),
    optionIds: t.options.map((o) => o.id),
    votes: t.options.map((o) => o.voteCount),
    status: t.status,
  };
}

export function TopicsProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>(SEED_TOPICS);
  const [voted, setVoted] = useState<Record<string, true>>({});
  const [nextId, setNextId] = useState<number>(SEED_TOPICS.length + 1);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!HAS_BACKEND) return;
    try {
      const res = await fetch("/api/topics", { cache: "no-store" });
      if (!res.ok) throw new Error(`status_${res.status}`);
      const data = (await res.json()) as { topics: ApiTopic[] };
      const list = data.topics.map(fromApi).filter(Boolean) as Topic[];
      setTopics(list);
    } catch (e) {
      console.error("topics refresh failed", e);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (HAS_BACKEND) {
        await refresh();
        try {
          const res = await fetch("/api/auth/me", { cache: "no-store" });
          const data = (await res.json()) as { admin: unknown };
          if (!cancelled) setLoggedIn(Boolean(data.admin));
        } catch {
          /* ignore */
        }
      } else {
        setTopics(loadJSON<Topic[]>(KEY_TOPICS, SEED_TOPICS));
        setVoted(loadJSON<Record<string, true>>(KEY_VOTED, {}));
        setNextId(loadJSON<number>(KEY_NID, SEED_TOPICS.length + 1));
        setLoggedIn(loadJSON<boolean>(KEY_LOGIN, false));
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (!HAS_BACKEND && ready) saveJSON(KEY_TOPICS, topics);
  }, [topics, ready]);
  useEffect(() => {
    if (!HAS_BACKEND && ready) saveJSON(KEY_VOTED, voted);
  }, [voted, ready]);
  useEffect(() => {
    if (!HAS_BACKEND && ready) saveJSON(KEY_NID, nextId);
  }, [nextId, ready]);
  useEffect(() => {
    if (!HAS_BACKEND && ready) saveJSON(KEY_LOGIN, loggedIn);
  }, [loggedIn, ready]);

  const hasVoted = useCallback(
    (topicId: Topic["id"]) => Boolean(voted[String(topicId)]),
    [voted],
  );

  const vote = useCallback(
    async (
      topicId: Topic["id"],
      optionIndex: number,
      identifier: string,
      identifierType: "EMAIL" | "PHONE",
      turnstileToken?: string,
    ): Promise<VoteOutcome> => {
      if (HAS_BACKEND) {
        const topic = topics.find((t) => t.id === topicId);
        const optionId = topic?.optionIds?.[optionIndex];
        if (!topic || !optionId) {
          return { ok: false, error: "validation" };
        }
        try {
          const res = await fetch("/api/vote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topicId,
              optionId,
              identifier,
              identifierType,
              turnstileToken,
            }),
          });
          if (res.status === 409) {
            setVoted((prev) => ({ ...prev, [String(topicId)]: true }));
            return { ok: false, error: "already_voted" };
          }
          if (res.status === 400) {
            const data = await res.json().catch(() => ({}));
            const err = data?.error;
            return {
              ok: false,
              error:
                err === "voting_closed"
                  ? "voting_closed"
                  : err === "captcha_failed"
                    ? "captcha_failed"
                    : "validation",
              message: data?.message,
            };
          }
          if (!res.ok) {
            return { ok: false, error: "network" };
          }
          setVoted((prev) => ({ ...prev, [String(topicId)]: true }));
          await refresh();
          return { ok: true };
        } catch {
          return { ok: false, error: "network" };
        }
      }

      setTopics((prev) =>
        prev.map((t) => {
          if (t.id !== topicId) return t;
          const next = [...t.votes];
          next[optionIndex] = (next[optionIndex] ?? 0) + 1;
          return { ...t, votes: next };
        }),
      );
      setVoted((prev) => ({ ...prev, [String(topicId)]: true }));
      return { ok: true };
    },
    [topics, refresh],
  );

  const toggleStatus = useCallback(
    async (topicId: Topic["id"]) => {
      if (HAS_BACKEND) {
        await fetch(`/api/admin/topics/${topicId}/toggle`, { method: "POST" });
        await refresh();
        return;
      }
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? {
                ...t,
                status: t.status === "active" ? "closed" : "active",
              }
            : t,
        ),
      );
    },
    [refresh],
  );

  const removeTopic = useCallback(
    async (topicId: Topic["id"]) => {
      if (HAS_BACKEND) {
        await fetch(`/api/admin/topics/${topicId}`, { method: "DELETE" });
        await refresh();
        return;
      }
      setTopics((prev) => prev.filter((t) => t.id !== topicId));
    },
    [refresh],
  );

  const createTopic = useCallback(
    async (
      title: string,
      desc: string,
      options: string[],
    ): Promise<Topic["id"] | null> => {
      if (HAS_BACKEND) {
        const res = await fetch("/api/admin/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description: desc, options }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        await refresh();
        return data?.topic?.id ?? null;
      }

      const id = nextId;
      setTopics((prev) => [
        ...prev,
        {
          id,
          title,
          desc: desc || "Cast your vote on this topic.",
          options,
          votes: options.map(() => 0),
          status: "active",
        },
      ]);
      setNextId((n) => n + 1);
      return id;
    },
    [nextId, refresh],
  );

  const login = useCallback(
    async (username: string, password: string) => {
      if (HAS_BACKEND) {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          if (!res.ok) return false;
          setLoggedIn(true);
          return true;
        } catch {
          return false;
        }
      }
      const ok = username === "admin" && password === "tmt2024";
      setLoggedIn(ok);
      return ok;
    },
    [],
  );

  const logout = useCallback(async () => {
    if (HAS_BACKEND) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        /* ignore */
      }
    }
    setLoggedIn(false);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      topics,
      voted,
      loggedIn,
      hasBackend: HAS_BACKEND,
      ready,
      refresh,
      vote,
      hasVoted,
      toggleStatus,
      removeTopic,
      createTopic,
      login,
      logout,
    }),
    [
      topics,
      voted,
      loggedIn,
      ready,
      refresh,
      vote,
      hasVoted,
      toggleStatus,
      removeTopic,
      createTopic,
      login,
      logout,
    ],
  );

  return <TopicsCtx.Provider value={value}>{children}</TopicsCtx.Provider>;
}

export function useTopics(): Ctx {
  const ctx = useContext(TopicsCtx);
  if (!ctx) throw new Error("useTopics must be used inside TopicsProvider");
  return ctx;
}
