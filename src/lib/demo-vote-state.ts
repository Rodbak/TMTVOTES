/** In-memory vote deltas for presentation mode (survives across requests in `next dev` / `next start`). */

type G = typeof globalThis & {
  __tmtDemoVoteDeltas?: Record<string, Record<string, number>>;
  __tmtDemoVoters?: Record<string, Set<string>>;
};

function g(): G {
  return globalThis as G;
}

export function demoVoterKey(identifierType: string, identifier: string): string {
  const raw = identifier.trim().toLowerCase();
  return `${identifierType}:${raw}`;
}

export function hasDemoAlreadyVoted(topicId: string, voterKey: string): boolean {
  const set = g().__tmtDemoVoters?.[topicId];
  return Boolean(set?.has(voterKey));
}

export function recordDemoVoter(topicId: string, voterKey: string): void {
  const gl = g();
  if (!gl.__tmtDemoVoters) gl.__tmtDemoVoters = {};
  if (!gl.__tmtDemoVoters[topicId]) gl.__tmtDemoVoters[topicId] = new Set();
  gl.__tmtDemoVoters[topicId].add(voterKey);
}

export function getVoteCountDeltas(topicId: string): Record<string, number> {
  const d = g().__tmtDemoVoteDeltas?.[topicId];
  return d ? { ...d } : {};
}

export function incrementDemoVote(topicId: string, optionId: string): void {
  const gl = g();
  if (!gl.__tmtDemoVoteDeltas) gl.__tmtDemoVoteDeltas = {};
  if (!gl.__tmtDemoVoteDeltas[topicId]) gl.__tmtDemoVoteDeltas[topicId] = {};
  const row = gl.__tmtDemoVoteDeltas[topicId];
  row[optionId] = (row[optionId] ?? 0) + 1;
}
