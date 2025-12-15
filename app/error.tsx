"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      padding: "2rem",
      textAlign: "center"
    }}>
      <h2 style={{ marginBottom: "1rem", color: "#ef4444" }}>
        Something went wrong!
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "#a9b0c0" }}>
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "0.375rem",
          cursor: "pointer"
        }}
      >
        Try again
      </button>
    </div>
  );
}
