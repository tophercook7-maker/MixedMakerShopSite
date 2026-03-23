"use client";

import { useCallback, useRef, useState } from "react";

const ACCEPT =
  ".stl,.3mf,.png,.jpg,.jpeg,.webp,model/stl,model/3mf,image/png,image/jpeg,image/webp";
const MAX_MB = 25;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function UploadPrintPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const pickFile = useCallback((f: File | null) => {
    setError("");
    if (!f || f.size === 0) {
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_MB} MB.`);
      setFile(null);
      return;
    }
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      pickFile(f || null);
    },
    [pickFile]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Please upload STL, 3MF, or an image file.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("file", file);
      const res = await fetch("/api/print-request", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      setFile(null);
      e.currentTarget.reset();
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="section">
        <div className="container">
          <div className="panel">
            <h1 style={{ margin: "0 0 12px" }}>Got it — we&apos;ll take a look and get back to you.</h1>
            <p className="subhead" style={{ marginBottom: 20 }}>
              We usually reply within one business day. If your project is urgent, mention it in a follow-up
              email and we&apos;ll do our best.
            </p>
            <button type="button" className="btn gold" onClick={() => setSuccess(false)}>
              Upload another file
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 8px" }}>Upload your 3D print</h1>
          <p className="subhead">
            Send us your file or a picture and we&apos;ll take care of the rest.
          </p>

          <form onSubmit={handleSubmit} className="card form-card" style={{ maxWidth: 560, marginTop: 20 }}>
            <div
              role="button"
              tabIndex={0}
              className="card"
              style={{
                marginBottom: 20,
                padding: 24,
                textAlign: "center",
                borderStyle: "dashed",
                borderWidth: 2,
                borderColor: dragOver ? "var(--gold)" : "rgba(255,255,255,0.2)",
                background: dragOver ? "rgba(255,184,0,0.06)" : "rgba(0,0,0,0.15)",
                cursor: "pointer",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onClick={() => inputRef.current?.click()}
            >
              <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Drop a file here or click to browse</p>
              <p className="small" style={{ margin: 0, color: "var(--muted)" }}>
                STL, 3MF, or image (PNG, JPG, WebP) · up to {MAX_MB} MB
              </p>
              {file && (
                <p className="small" style={{ marginTop: 12, color: "var(--gold)" }}>
                  Selected: {file.name}
                </p>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                style={{ display: "none" }}
                onChange={(ev) => pickFile(ev.target.files?.[0] || null)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="print-name">
                Name
              </label>
              <input className="form-input" id="print-name" name="name" type="text" required autoComplete="name" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="print-email">
                Email
              </label>
              <input
                className="form-input"
                id="print-email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="print-desc">
                Tell us what you want printed <span className="small">(optional)</span>
              </label>
              <textarea className="form-textarea" id="print-desc" name="description" rows={4} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="print-qty">
                Quantity <span className="small">(optional)</span>
              </label>
              <input className="form-input" id="print-qty" name="quantity" type="text" placeholder="e.g. 2" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="print-color">
                Color preference <span className="small">(optional)</span>
              </label>
              <input
                className="form-input"
                id="print-color"
                name="color_preference"
                type="text"
                placeholder="e.g. black, natural PLA"
              />
            </div>

            {error && (
              <p className="small" style={{ color: "var(--gold)", marginBottom: 12 }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn gold" disabled={loading}>
              {loading ? "Sending…" : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
