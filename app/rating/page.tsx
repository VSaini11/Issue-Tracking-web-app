"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function RatingContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const ratingStr = searchParams.get("rating")
  // Guard against 'undefined' string and NaN (can happen on legacy docs without clientRating field)
  const ratingParsed = ratingStr && ratingStr !== 'undefined' ? parseInt(ratingStr, 10) : null
  const rating = ratingParsed !== null && !isNaN(ratingParsed) ? ratingParsed : null

  const staffName = searchParams.get("staff")
  const issueTitle = searchParams.get("issue")
  const issueId = searchParams.get("id")

  const starDisplay = (r: number) =>
    "★".repeat(r) + "☆".repeat(5 - r)

  const configs: Record<string, { emoji: string; title: string; message: string; color: string; bg: string }> = {
    success: {
      emoji: "🎉",
      title: "Thank You for Your Feedback!",
      message: `Your 5-star rating for ${staffName ?? 'the staff'} on issue "${issueTitle ?? 'General'}" has been recorded.`,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    already: {
      emoji: "✅",
      title: "Already Rated",
      message: `You have already submitted a rating for ${staffName ?? 'this staff'} on issue "${issueTitle ?? 'General'}". Thank you!`,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    invalid: {
      emoji: "❌",
      title: "Invalid Request",
      message: "This rating link is invalid or has expired. Please contact support.",
      color: "#ef4444",
      bg: "#fef2f2",
    },
    error: {
      emoji: "⚠️",
      title: "Something Went Wrong",
      message: "We couldn't record your rating. Please try again later.",
      color: "#d97706",
      bg: "#fffbeb",
    },
  }

  const cfg = configs[status ?? "error"] ?? configs.error

  const starColors: Record<number, string> = {
    1: "#ef4444",
    2: "#f97316",
    3: "#eab308",
    4: "#84cc16",
    5: "#22c55e",
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-sans" style={{ background: "#f1f5f9" }}>
      <div
        className="max-w-md w-full mx-4 rounded-3xl shadow-2xl text-center overflow-hidden"
        style={{ background: "white", padding: "0" }}
      >
        <div style={{ background: cfg.bg, padding: "40px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "72px", marginBottom: "16px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}>{cfg.emoji}</div>
          <h1 style={{ color: cfg.color, fontSize: "28px", fontWeight: "800", margin: "0", letterSpacing: "-0.025em" }}>
            {cfg.title}
          </h1>
        </div>

        <div style={{ padding: "40px 32px" }}>
          {status === "success" && rating !== null && (
            <div
              style={{
                display: "inline-block",
                margin: "0 0 24px",
                padding: "20px 32px",
                background: "#f8fafc",
                borderRadius: "20px",
                border: `2px solid ${cfg.color}`,
                boxShadow: `0 10px 15px -3px ${cfg.color}20`,
              }}
            >
              <span
                style={{
                  fontSize: "42px",
                  color: starColors[rating] ?? "#f59e0b",
                  letterSpacing: "6px",
                  display: "block",
                  lineHeight: "1",
                  marginBottom: "12px"
                }}
              >
                {starDisplay(rating)}
              </span>
              <p style={{ margin: "0", color: "#475569", fontSize: "16px", fontWeight: "600" }}>
                You rated: <span style={{ color: cfg.color }}>{rating} / 5 stars</span>
              </p>
            </div>
          )}

          {status === "already" && rating !== null && (
            <div style={{ margin: "0 0 24px", padding: "20px", background: "#f8fafc", borderRadius: "20px" }}>
              <span style={{ fontSize: "36px", color: starColors[rating] ?? "#f59e0b" }}>
                {starDisplay(rating)}
              </span>
              <p style={{ margin: "8px 0 0", color: "#475569", fontSize: "15px", fontWeight: "600" }}>
                Previous rating: {rating} / 5 stars
              </p>
            </div>
          )}

          <div style={{ padding: "0 10px" }}>
            <p style={{ color: "#334155", fontSize: "17px", lineHeight: "1.6", margin: "0 0 8px 0", fontWeight: "500" }}>
              {cfg.message}
            </p>
            {staffName && (
              <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 32px 0" }}>
                Attributed to <strong style={{ color: "#1e293b" }}>{staffName}</strong>.
                <br />
                <span className="font-mono text-[10px] mt-1 block">Issue ID: {issueId ?? 'Unknown'}</span>
              </p>
            )}
          </div>

          <a
            href="/"
            style={{
              display: "inline-block",
              width: "100%",
              padding: "16px 32px",
              background: "#0f172a",
              color: "white",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "700",
              boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.4)",
              transition: "transform 0.2s ease"
            }}
          >
            Back to Dashboard
          </a>

          <p style={{ marginTop: "32px", color: "#94a3b8", fontSize: "12px", fontWeight: "500", letterSpacing: "0.05em" }}>
            ISSUE TRACKING PORTAL • SECURE FEEDBACK
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RatingPage() {
  return (
    <Suspense>
      <RatingContent />
    </Suspense>
  )
}
