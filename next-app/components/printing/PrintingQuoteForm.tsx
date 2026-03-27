"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  printingPrimaryCtaClass,
  printingSecondaryCtaClass,
  PrintingSection,
} from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { PRINTING_QUOTE_FORM_ID } from "@/components/printing/printing-quote-anchor";
import { PrintingPriceEstimator } from "@/components/printing/PrintingPriceEstimator";
import { type PriceEstimateSnapshot, estimateSummaryRows } from "@/components/printing/printing-price-estimate";
import { buildPrintQuoteSmsHref, PRINTING_QUOTE_PHONE_DISPLAY } from "@/components/printing/printing-sms";
import { trackPublicEvent } from "@/lib/public-analytics";

const QUOTE_REQUEST_FIELDS_ID = "printing-quote-request-fields";

const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.JPG,.JPEG,.PNG,.WEBP";
const CAD_ACCEPT = ".stl,.3mf,.STL,.3MF,model/stl,model/3mf";
const MAX_MB = 25;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function extOf(filename: string): string {
  const m = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m?.[1] || "";
}

function isImageFile(f: File): boolean {
  const ext = extOf(f.name);
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return true;
  return /^image\/(jpeg|png|webp)$/i.test(f.type);
}

function isCadFile(f: File): boolean {
  const ext = extOf(f.name);
  return ext === "stl" || ext === "3mf";
}

const inputClass =
  "w-full rounded-xl border border-white/[0.12] bg-black/45 px-4 py-3 text-[0.9375rem] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-white/35 outline-none transition duration-200 focus:border-orange-500/45 focus:bg-black/[0.52] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]";

const labelClass = "mb-2 block text-[0.8125rem] font-semibold tracking-[-0.02em] text-white/78";

export function PrintingQuoteForm() {
  const formId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cadInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [estimateMeta, setEstimateMeta] = useState<{
    summaryLine: string;
    snapshot: PriceEstimateSnapshot;
  } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragDepth, setDragDepth] = useState(0);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const dragActive = dragDepth > 0;

  useEffect(() => {
    if (!file || !isImageFile(file)) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const clearFileInputs = useCallback(() => {
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (cadInputRef.current) cadInputRef.current.value = "";
  }, []);

  const trySetImageFile = useCallback((f: File | null) => {
    if (!f || f.size === 0) return;
    if (f.size > MAX_BYTES) {
      setFileError("That file is too large. Try a smaller image.");
      return;
    }
    if (!isImageFile(f)) {
      setFileError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    setFileError("");
    setFile(f);
  }, []);

  const trySetCadFile = useCallback((f: File | null) => {
    if (!f || f.size === 0) return;
    if (f.size > MAX_BYTES) {
      setFileError("That file is too large. Try a smaller file.");
      return;
    }
    if (!isCadFile(f)) {
      setFileError("Please upload an STL or 3MF file.");
      return;
    }
    setFileError("");
    setFile(f);
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setFileError("");
    clearFileInputs();
  }, [clearFileInputs]);

  const onEstimateChange = useCallback(
    (p: { engaged: boolean; snapshot: PriceEstimateSnapshot; summaryLine: string }) => {
      setEstimateMeta(p.engaged ? { summaryLine: p.summaryLine, snapshot: p.snapshot } : null);
    },
    [],
  );

  const textRequestHref = useMemo(
    () => buildPrintQuoteSmsHref(estimateMeta?.snapshot ?? null),
    [estimateMeta],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const desc = String(fd.get("description") || "").trim();
    fd.delete("file");
    if (!desc && !file) {
      setError("Add a short description or upload a photo / 3D file.");
      return;
    }
    if (!email) {
      setError("Please enter your email so I can reply.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      if (file) {
        fd.append("file", file);
      }
      if (estimateMeta) {
        fd.set("pricing_estimate", estimateMeta.summaryLine);
        fd.set("pricing_estimate_json", JSON.stringify(estimateMeta.snapshot));
      }
      const res = await fetch("/api/print-quote", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      trackPublicEvent("public_print_request_submit");
      setSuccess(true);
      setFile(null);
      setFileError("");
      setEstimateMeta(null);
      e.currentTarget.reset();
      clearFileInputs();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PrintingSection divider={false} className="border-b border-white/[0.06] bg-[#060908] pb-[4.5rem] pt-0 md:pb-[6rem]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_70%_45%_at_50%_120%,rgba(16,185,129,0.07),transparent)]"
        aria-hidden
      />
      <div className={cn(printingContentClass, "relative")}>
        <RevealOnScroll>
          <div
            id={PRINTING_QUOTE_FORM_ID}
            className="relative scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-black/55 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_28px_80px_rgba(0,0,0,0.4)] backdrop-blur-[2px] sm:scroll-mt-28 sm:p-8 md:p-10 lg:p-11"
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(249,115,22,0.06),transparent)]"
              aria-hidden
            />

            <div className="relative mx-auto max-w-[36rem]">
              {success ? (
                <div
                  className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-5 py-6 text-center"
                  role="status"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-400/85">
                    Quote
                  </p>
                  <p className="mt-4 text-[1.05rem] font-semibold leading-snug text-emerald-100">
                    Got it. I&apos;ll take a look and get back to you.
                  </p>
                  <p className="mt-4 text-[0.75rem] leading-relaxed tracking-wide text-white/38">
                    Local builds. Real parts. No guesswork.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-5 text-[0.875rem] font-semibold text-orange-300 underline-offset-2 hover:text-orange-200 hover:underline"
                  >
                    Send another request
                  </button>
                </div>
              ) : (
                <form id={formId} onSubmit={handleSubmit} className="space-y-5">
                  <PrintingPriceEstimator
                    formFieldsId={QUOTE_REQUEST_FIELDS_ID}
                    descriptionTextAreaRef={descriptionRef}
                    quoteNameFieldRef={nameInputRef}
                    onEstimateChange={onEstimateChange}
                  />

                  <div id={QUOTE_REQUEST_FIELDS_ID} className="scroll-mt-28">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-400/85">Quote</p>
                    <h2 className="mt-3 text-[1.5rem] font-bold leading-tight tracking-[-0.035em] text-white sm:text-[1.65rem] md:text-[1.85rem] [text-shadow:0_2px_32px_rgba(0,0,0,0.45)]">
                      Send your file or describe what you need
                    </h2>
                    <p className="mt-3 text-[0.875rem] leading-relaxed text-white/55">
                      Upload a file, drop a photo, write a few lines, or do all three — whatever gets the idea across. I
                      reply by email first.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor={`${formId}-name`}>
                      Your name <span className="text-orange-400/90">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      id={`${formId}-name`}
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-email`}>
                        Email <span className="text-orange-400/90">*</span>
                      </label>
                      <input
                        id={`${formId}-email`}
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className={inputClass}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-phone`}>
                        Phone (optional)
                      </label>
                      <input
                        id={`${formId}-phone`}
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        className={inputClass}
                        placeholder="501-555-0100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor={`${formId}-project`}>
                      Project name / item needed
                    </label>
                    <input
                      id={`${formId}-project`}
                      name="project_title"
                      type="text"
                      className={inputClass}
                      placeholder="e.g. dishwasher wheel bracket, mower chute adapter…"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor={`${formId}-desc`}>
                      Describe what you need
                      {file ? (
                        <span className="font-normal text-white/45"> (optional — use if you didn&apos;t attach a file)</span>
                      ) : (
                        <span className="text-orange-400/90"> *</span>
                      )}
                    </label>
                    <textarea
                      ref={descriptionRef}
                      id={`${formId}-desc`}
                      name="description"
                      required={!file}
                      rows={4}
                      className={cn(inputClass, "min-h-[7.5rem] resize-y py-3 leading-relaxed")}
                      placeholder="Problem, size, how it should work, what broke, or what you want to achieve…"
                    />
                    <p className="mt-2 text-[0.72rem] leading-relaxed text-white/40">
                      If you only have a sketch or a broken part, a photo in the upload area below often tells the story —
                      then you can keep this short.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-material`}>
                        Material preference (optional)
                      </label>
                      <input
                        id={`${formId}-material`}
                        name="material_preference"
                        type="text"
                        className={inputClass}
                        placeholder="e.g. standard PLA, prefer black…"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-ref`}>
                        Reference link or image URL (optional)
                      </label>
                      <input
                        id={`${formId}-ref`}
                        name="reference_url"
                        type="url"
                        className={inputClass}
                        placeholder="https://…"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className={labelClass}>
                      Upload a photo or 3D file <span className="font-normal text-white/45">(optional)</span>
                    </p>
                    <p className="-mt-1 text-[0.72rem] leading-relaxed text-white/40">
                      Not required if your description above covers it — many people send both.
                    </p>

                    <input
                      ref={imageInputRef}
                      id={`${formId}-photo`}
                      type="file"
                      accept={IMAGE_ACCEPT}
                      className="sr-only"
                      tabIndex={-1}
                      onChange={(ev) => {
                        const next = ev.target.files?.[0] || null;
                        if (next) trySetImageFile(next);
                      }}
                    />
                    <input
                      ref={cadInputRef}
                      id={`${formId}-cad`}
                      type="file"
                      accept={CAD_ACCEPT}
                      className="sr-only"
                      tabIndex={-1}
                      onChange={(ev) => {
                        const next = ev.target.files?.[0] || null;
                        if (next) trySetCadFile(next);
                      }}
                    />

                    {file ? (
                      <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
                          <div
                            className={cn(
                              "relative mx-auto aspect-square w-full max-w-[220px] shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black/50 sm:mx-0 sm:h-[7.5rem] sm:w-[7.5rem] sm:max-w-none",
                              !previewUrl && "flex items-center justify-center",
                            )}
                          >
                            {previewUrl ? (
                              <img
                                src={previewUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="px-3 text-center text-[0.7rem] font-medium uppercase tracking-wide text-white/38">
                                3D file
                              </span>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
                            <p className="truncate text-[0.875rem] font-medium text-white/82" title={file.name}>
                              {file.name}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setFileError("");
                                  if (file && isCadFile(file)) {
                                    cadInputRef.current?.click();
                                  } else {
                                    imageInputRef.current?.click();
                                  }
                                }}
                                className="rounded-lg border border-white/[0.14] bg-white/[0.04] px-3.5 py-2 text-[0.8125rem] font-semibold text-white/85 transition hover:border-orange-500/35 hover:bg-white/[0.07]"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={removeFile}
                                className="rounded-lg border border-white/[0.1] bg-transparent px-3.5 py-2 text-[0.8125rem] font-semibold text-white/55 transition hover:border-white/[0.18] hover:text-white/75"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Upload a photo: drag and drop or choose file"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setFileError("");
                            imageInputRef.current?.click();
                          }
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragDepth((d) => d + 1);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragDepth((d) => Math.max(0, d - 1));
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragDepth(0);
                          setFileError("");
                          const next = e.dataTransfer.files?.[0] || null;
                          if (next) trySetImageFile(next);
                        }}
                        onClick={() => {
                          setFileError("");
                          imageInputRef.current?.click();
                        }}
                        className={cn(
                          "cursor-pointer rounded-xl border border-dashed px-4 py-10 text-center transition sm:py-12",
                          "border-white/[0.16] bg-black/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                          "hover:border-orange-500/30 hover:bg-black/[0.42] active:scale-[0.99]",
                          dragActive && "border-orange-500/45 bg-orange-500/[0.07] shadow-[0_0_0_3px_rgba(249,115,22,0.1)]",
                        )}
                      >
                        <p className="text-[0.9375rem] font-medium leading-snug text-white/78">
                          Drag and drop an image here, or click to choose one
                        </p>
                        <p className="mt-2 text-[0.75rem] leading-relaxed text-white/42">A photo helps a lot.</p>
                        <p className="mt-3 text-[0.72rem] text-white/35">JPG, PNG, or WebP · up to {MAX_MB} MB</p>
                      </div>
                    )}

                    {fileError ? (
                      <p className="rounded-lg border border-orange-500/25 bg-orange-500/[0.08] px-3 py-2 text-[0.8125rem] text-orange-100/95">
                        {fileError}
                      </p>
                    ) : null}

                    <p className="text-[0.72rem] leading-relaxed text-white/36">
                      Have an STL or 3MF?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setFileError("");
                          cadInputRef.current?.click();
                        }}
                        className="font-semibold text-orange-300/90 underline-offset-2 hover:text-orange-200 hover:underline"
                      >
                        Attach a 3D file
                      </button>
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <label className={labelClass} htmlFor={`${formId}-dim`}>
                        Size or measurements (optional)
                      </label>
                      <input
                        id={`${formId}-dim`}
                        name="dimensions"
                        type="text"
                        className={inputClass}
                        placeholder={'e.g. ~4" wide'}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-qty`}>
                        How many?
                      </label>
                      <input id={`${formId}-qty`} name="quantity" type="text" className={inputClass} placeholder="1" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-deadline`}>
                        When do you need it? (optional)
                      </label>
                      <input
                        id={`${formId}-deadline`}
                        name="deadline"
                        type="text"
                        className={inputClass}
                        placeholder="e.g. next Friday"
                      />
                    </div>
                  </div>

                  {error ? (
                    <p className="rounded-lg border border-orange-500/25 bg-orange-500/[0.08] px-3 py-2 text-[0.8125rem] text-orange-100/95">
                      {error}
                    </p>
                  ) : null}

                  {estimateMeta ? (
                    <div className="rounded-xl border border-white/[0.1] bg-black/40 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-white/40">
                        Estimate summary
                      </p>
                      <ul className="mt-2.5 space-y-1 text-[0.8125rem] leading-snug text-white/72">
                        {estimateSummaryRows(estimateMeta.snapshot).map((row) => (
                          <li key={row.label}>
                            <span className="text-white/45">{row.label}:</span> {row.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <p className="text-center text-[0.8125rem] leading-relaxed text-white/48">
                    You don&apos;t need perfect measurements — just send what you have.
                  </p>

                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        printingPrimaryCtaClass,
                        "w-full min-h-[3.35rem] flex-1 text-[0.96875rem] font-semibold disabled:cursor-not-allowed disabled:opacity-55",
                      )}
                    >
                      {loading ? "Sending…" : "Send request"}
                    </button>
                    <a
                      href={textRequestHref}
                      className={cn(
                        printingSecondaryCtaClass,
                        "flex min-h-[3.35rem] flex-1 items-center justify-center rounded-xl border border-white/[0.18] bg-white/[0.06] px-4 text-center text-[0.9375rem] font-semibold text-white/88 transition hover:border-orange-500/35 hover:bg-white/[0.09]",
                      )}
                    >
                      Text Your Request
                    </a>
                  </div>
                  <p className="text-center text-[0.72rem] leading-relaxed text-white/38">
                    Text <span className="text-white/50">{PRINTING_QUOTE_PHONE_DISPLAY}</span> — same info, faster
                    on your phone. Add your photo in Messages.
                  </p>

                  <p className="pt-0.5 text-center text-[0.75rem] leading-relaxed tracking-wide text-white/38">
                    Local builds. Real parts. No guesswork.
                  </p>
                </form>
              )}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
