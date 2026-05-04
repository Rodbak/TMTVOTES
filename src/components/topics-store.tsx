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
  id: number;
  title: string;
  desc: string;
  options: string[];
  votes: number[];
  status: TopicStatus;
};

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

type Ctx = {
  topics: Topic[];
  voted: Record<number, true>;
  loggedIn: boolean;
  vote: (topicId: number, optionIndex: number) => void;
  hasVoted: (topicId: number) => boolean;
  toggleStatus: (topicId: number) => void;
  removeTopic: (topicId: number) => void;
  createTopic: (title: string, desc: string, options: string[]) => number;
  login: (username: string, password: string) => boolean;
  logout: () => void;
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

export function TopicsProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>(SEED_TOPICS);
  const [voted, setVoted] = useState<Record<number, true>>({});
  const [nextId, setNextId] = useState<number>(SEED_TOPICS.length + 1);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTopics(loadJSON<Topic[]>(KEY_TOPICS, SEED_TOPICS));
    setVoted(loadJSON<Record<number, true>>(KEY_VOTED, {}));
    setNextId(loadJSON<number>(KEY_NID, SEED_TOPICS.length + 1));
    setLoggedIn(loadJSON<boolean>(KEY_LOGIN, false));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveJSON(KEY_TOPICS, topics);
  }, [topics, hydrated]);
  useEffect(() => {
    if (hydrated) saveJSON(KEY_VOTED, voted);
  }, [voted, hydrated]);
  useEffect(() => {
    if (hydrated) saveJSON(KEY_NID, nextId);
  }, [nextId, hydrated]);
  useEffect(() => {
    if (hydrated) saveJSON(KEY_LOGIN, loggedIn);
  }, [loggedIn, hydrated]);

  const vote = useCallback((topicId: number, optionIndex: number) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const next = [...t.votes];
        next[optionIndex] = (next[optionIndex] ?? 0) + 1;
        return { ...t, votes: next };
      }),
    );
    setVoted((prev) => ({ ...prev, [topicId]: true }));
  }, []);

  const hasVoted = useCallback((topicId: number) => Boolean(voted[topicId]), [voted]);

  const toggleStatus = useCallback((topicId: number) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, status: t.status === "active" ? "closed" : "active" }
          : t,
      ),
    );
  }, []);

  const removeTopic = useCallback((topicId: number) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  }, []);

  const createTopic = useCallback(
    (title: string, desc: string, options: string[]) => {
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
    [nextId],
  );

  const login = useCallback((username: string, password: string) => {
    const ok = username === "admin" && password === "tmt2024";
    setLoggedIn(ok);
    return ok;
  }, []);

  const logout = useCallback(() => setLoggedIn(false), []);

  const value = useMemo<Ctx>(
    () => ({
      topics,
      voted,
      loggedIn,
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
