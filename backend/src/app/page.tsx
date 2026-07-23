export default function BackendHomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        background: "#0a0a0f",
        color: "#00d4ff",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>MAD_TECH Backend API</h1>
        <p style={{ color: "#6b7280" }}>Running on port 3001</p>
      </div>
    </main>
  );
}
