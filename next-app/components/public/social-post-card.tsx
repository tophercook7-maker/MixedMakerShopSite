"use client";

import { useEffect, useRef } from "react";
import type { ThreeDScene } from "@/lib/three-d-scenes";

/**
 * Renders a 3D pop-out scene as a Facebook/Instagram-style sponsored post card.
 * The video only plays while it's on screen (IntersectionObserver), so a wall
 * of 50 looping clips stays smooth.
 */
export function SocialPostCard({ scene }: { scene: ThreeDScene }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      style={{
        background: "#fff",
        color: "#050505",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 12px 34px rgba(0,0,0,.28)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        breakInside: "avoid",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px 8px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/m3-icon.png"
          alt={scene.author}
          width={40}
          height={40}
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flex: "0 0 auto", background: "#1e241f" }}
        />
        <div style={{ lineHeight: 1.2, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{scene.author}</div>
          <div style={{ fontSize: 12, color: "#65676b", display: "flex", alignItems: "center", gap: 4 }}>
            Sponsored
            <span aria-hidden>·</span>
            <span aria-hidden>🌐</span>
            {scene.location ? <span style={{ color: "#65676b" }}>· {scene.location}</span> : null}
          </div>
        </div>
      </div>

      {/* caption */}
      <p style={{ margin: 0, padding: "0 12px 10px", fontSize: 15, lineHeight: 1.45 }}>{scene.caption}</p>

      {/* media */}
      <video
        ref={videoRef}
        src={scene.video}
        poster={scene.poster}
        loop
        muted
        playsInline
        preload="none"
        aria-label={`${scene.title} — 3D pop-out video ad`}
        style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover", background: "#000" }}
      />

      {/* counts */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px 4px", fontSize: 13, color: "#65676b" }}>
        <span>👍❤️ {scene.likes.toLocaleString()}</span>
        <span>
          {scene.comments} comments · {scene.shares} shares
        </span>
      </div>

      {/* action bar */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #e4e6eb",
          margin: "0 8px",
          padding: "4px 0",
          fontSize: 14,
          fontWeight: 600,
          color: "#65676b",
        }}
      >
        <span style={{ flex: 1, textAlign: "center", padding: "6px 0" }}>👍 Like</span>
        <span style={{ flex: 1, textAlign: "center", padding: "6px 0" }}>💬 Comment</span>
        <span style={{ flex: 1, textAlign: "center", padding: "6px 0" }}>↪ Share</span>
      </div>
    </article>
  );
}
