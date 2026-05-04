export function isDbConnectionMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    message.includes("Can't reach database server") ||
    message.includes("P1001") ||
    message.includes("PrismaClientInitializationError") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Connection refused") ||
    message.includes("Timed out fetching a new connection") ||
    message.includes("Server has closed the connection") ||
    (m.includes("database server") && m.includes("reach"))
  );
}

function fullMessage(error: Error): string {
  const parts = [error.message];
  let c: unknown = error.cause;
  let depth = 0;
  while (c instanceof Error && depth < 5) {
    parts.push(c.message);
    c = c.cause;
    depth++;
  }
  return parts.join(" ");
}

export function isDbConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  if (code === "P1001" || code === "P1000" || code === "P1017") return true;
  if (error instanceof Error) {
    return isDbConnectionMessage(fullMessage(error));
  }
  return false;
}
