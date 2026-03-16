"use client";

import { FormEvent, useState } from "react";

export default function BookWebsiteReviewPage() {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Array<{ start_time: string; end_time: string }>>([]);
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadSlots(day: string) {
    if (!day) {
      setAvailableSlots([]);
      return;
    }
    const qs = new URLSearchParams({ day });
    const res = await fetch(`/api/book/availability?${qs.toString()}`, { cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      slots?: Array<{ start_time: string; end_time: string }>;
    };
    if (!res.ok) throw new Error(body.error || "Could not load availability.");
    setAvailableSlots(Array.isArray(body.slots) ? body.slots : []);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          business_name: businessName,
          email,
          phone,
          preferred_time: preferredTime,
          notes,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        confirmation_email_sent?: boolean;
        next_available_opening?: { start_time?: string };
      };
      if (!res.ok) {
        if (res.status === 409 && body.next_available_opening?.start_time) {
          setPreferredTime(body.next_available_opening.start_time);
          throw new Error(
            `${body.error || "Selected slot is no longer available."} Suggested opening: ${new Date(
              body.next_available_opening.start_time
            ).toLocaleString()}`
          );
        }
        throw new Error(body.error || "Could not book review.");
      }
      setMessage(
        body.confirmation_email_sent
          ? "Booked. Confirmation email sent."
          : "Booked. Confirmation email could not be sent, but your appointment is saved."
      );
      setName("");
      setBusinessName("");
      setEmail("");
      setPhone("");
      setPreferredTime("");
      setSelectedDay("");
      setAvailableSlots([]);
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <section className="max-w-xl mx-auto rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <h1 className="text-2xl font-bold">Book a 15-minute website review</h1>
        <p className="text-sm text-slate-300">
          Pick a time and we will review your site for fast conversion wins.
        </p>

        <form className="space-y-3" onSubmit={onSubmit}>
          <input className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2" placeholder="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          <input className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2"
            type="date"
            value={selectedDay}
            onChange={async (e) => {
              const day = e.target.value;
              setSelectedDay(day);
              setPreferredTime("");
              try {
                await loadSlots(day);
                setError(null);
              } catch (err) {
                setAvailableSlots([]);
                setError(err instanceof Error ? err.message : "Could not load availability.");
              }
            }}
            required
          />
          <select
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            required
          >
            <option value="">Select an available time</option>
            {availableSlots.map((slot) => (
              <option key={slot.start_time} value={slot.start_time}>
                {new Date(slot.start_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </option>
            ))}
          </select>
          <textarea className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 min-h-[110px]" placeholder="Anything we should prepare?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="rounded-md bg-amber-400 text-slate-950 px-4 py-2 font-semibold" type="submit" disabled={loading}>
            {loading ? "Booking..." : "Book Website Review"}
          </button>
        </form>

        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </section>
    </main>
  );
}
