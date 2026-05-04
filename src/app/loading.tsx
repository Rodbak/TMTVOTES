/** Shown immediately while server data loads (avoids a long blank screen on slow DB). */
export default function AppLoading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-tmt-bg px-6 text-center text-tmt-text"
      style={{
        minHeight: "100vh",
        backgroundColor: "#E8F4FC",
        color: "#0B1220",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <p
        className="font-display text-lg font-semibold text-tmt-cyan sm:text-xl"
        style={{ color: "#0091C7" }}
      >
        Loading TMT Votes…
      </p>
      <p className="mt-4 max-w-md text-sm text-tmt-muted" style={{ color: "#4A5F78" }}>
        If this never finishes, PostgreSQL is probably not running or{" "}
        <code style={{ color: "#0091C7" }}>DATABASE_URL</code> in{" "}
        <code style={{ color: "#0091C7" }}>.env</code> is wrong. See the README “Blank page”
        section.
      </p>
    </div>
  );
}
