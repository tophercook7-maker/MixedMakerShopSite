"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core";

type LeadLite = {
  id: string;
  business_name?: string | null;
};

type CalendarEventRow = {
  id: string;
  lead_id?: string | null;
  title: string;
  event_type: "meeting" | "followup" | "task" | "scout" | string;
  start_time: string;
  end_time?: string | null;
  notes?: string | null;
  lead_business_name?: string | null;
};

type AdminCalendarViewProps = {
  leads: LeadLite[];
};

async function fetchEvents(startIso: string, endIso: string): Promise<CalendarEventRow[]> {
  const qs = new URLSearchParams({ start: startIso, end: endIso });
  const res = await fetch(`/api/calendar/events?${qs.toString()}`, { cache: "no-store" });
  const data = (await res.json().catch(() => [])) as CalendarEventRow[] | { error?: string };
  if (!res.ok || !Array.isArray(data)) throw new Error((data as { error?: string })?.error || "Could not load events.");
  return data;
}

function toEventInput(row: CalendarEventRow): EventInput {
  const colorByType: Record<string, string> = {
    meeting: "#22c55e",
    followup: "#f59e0b",
    task: "#60a5fa",
    scout: "#a78bfa",
  };
  const type = String(row.event_type || "task").toLowerCase();
  return {
    id: row.id,
    title: row.title,
    start: row.start_time,
    end: row.end_time || undefined,
    backgroundColor: colorByType[type] || "#60a5fa",
    borderColor: colorByType[type] || "#60a5fa",
    extendedProps: {
      leadId: row.lead_id || null,
      leadBusinessName: row.lead_business_name || null,
      eventType: row.event_type,
      notes: row.notes || "",
    },
  };
}

export function AdminCalendarView({ leads }: AdminCalendarViewProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskStart, setTaskStart] = useState("");
  const [taskEnd, setTaskEnd] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskLeadId, setTaskLeadId] = useState("");

  const leadOptions = useMemo(
    () =>
      leads.map((lead) => ({
        id: String(lead.id),
        label: String(lead.business_name || "Unnamed lead"),
      })),
    [leads]
  );

  async function loadForRange(arg: DatesSetArg) {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchEvents(arg.startStr, arg.endStr);
      setEvents(rows.map(toEventInput));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load calendar events.");
    } finally {
      setLoading(false);
    }
  }

  async function saveEventMove(eventId: string, start: Date | null, end: Date | null) {
    const res = await fetch(`/api/calendar/events/${encodeURIComponent(eventId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_time: start ? start.toISOString() : null,
        end_time: end ? end.toISOString() : null,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(body.error || "Could not update event time.");
  }

  async function onEventDrop(arg: { event: { id: string; start: Date | null; end: Date | null }; revert: () => void }) {
    setError(null);
    setMessage(null);
    try {
      await saveEventMove(arg.event.id, arg.event.start, arg.event.end);
      setMessage("Event moved.");
    } catch (e) {
      arg.revert();
      setError(e instanceof Error ? e.message : "Could not move event.");
    }
  }

  async function onEventResize(arg: { event: { id: string; start: Date | null; end: Date | null }; revert: () => void }) {
    setError(null);
    setMessage(null);
    try {
      await saveEventMove(arg.event.id, arg.event.start, arg.event.end);
      setMessage("Event updated.");
    } catch (e) {
      arg.revert();
      setError(e instanceof Error ? e.message : "Could not resize event.");
    }
  }

  function onEventClick(arg: EventClickArg) {
    const leadId = String(arg.event.extendedProps?.leadId || "").trim();
    if (!leadId) return;
    window.location.href = `/admin/leads/${encodeURIComponent(leadId)}`;
  }

  function onDateSelect(arg: DateSelectArg) {
    const isoStart = arg.startStr.slice(0, 16);
    const isoEnd = arg.endStr ? arg.endStr.slice(0, 16) : "";
    setTaskStart(isoStart);
    setTaskEnd(isoEnd);
    if (!taskTitle.trim()) setTaskTitle("Follow-up task");
  }

  async function createTask(eventType: "task" | "followup" | "meeting") {
    setError(null);
    setMessage(null);
    const title = taskTitle.trim();
    if (!title) {
      setError("Task title is required.");
      return;
    }
    if (!taskStart) {
      setError("Start time is required.");
      return;
    }
    const res = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        event_type: eventType,
        start_time: new Date(taskStart).toISOString(),
        end_time: taskEnd ? new Date(taskEnd).toISOString() : null,
        notes: taskNotes.trim() || null,
        lead_id: taskLeadId || null,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(body.error || "Could not create event.");
      return;
    }
    setTaskTitle("");
    setTaskNotes("");
    setTaskLeadId("");
    setMessage("Calendar event created.");
  }

  return (
    <div className="space-y-4">
      <section className="admin-card">
        <h1 className="text-2xl font-bold mb-2">CRM Calendar</h1>
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Month, week, and day planning for meetings, follow-ups, tasks, and scout events.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="admin-card">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            editable
            selectable
            selectMirror
            events={events}
            datesSet={loadForRange}
            select={onDateSelect}
            eventDrop={onEventDrop}
            eventResize={onEventResize}
            eventClick={onEventClick}
            height="auto"
          />
          {loading ? <p className="text-xs mt-2">Loading events...</p> : null}
        </section>

        <aside className="space-y-3">
          <section className="admin-card space-y-2">
            <h2 className="text-sm font-semibold">Quick Task Creation</h2>
            <input
              className="admin-input h-9"
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Start time
            </label>
            <input className="admin-input h-9" type="datetime-local" value={taskStart} onChange={(e) => setTaskStart(e.target.value)} />
            <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
              End time
            </label>
            <input className="admin-input h-9" type="datetime-local" value={taskEnd} onChange={(e) => setTaskEnd(e.target.value)} />
            <select className="admin-input h-9" value={taskLeadId} onChange={(e) => setTaskLeadId(e.target.value)}>
              <option value="">No lead attached</option>
              {leadOptions.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.label}
                </option>
              ))}
            </select>
            <textarea
              className="admin-input min-h-[100px]"
              placeholder="Notes"
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button className="admin-btn-primary text-xs" onClick={() => void createTask("task")}>
                Create Task
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void createTask("followup")}>
                Create Follow-up
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void createTask("meeting")}>
                Create Meeting
              </button>
            </div>
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-1">Lead Context</h2>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Click any event attached to a lead to open its lead workspace.
            </p>
            <div className="mt-2">
              <Link href="/admin/leads" className="admin-btn-ghost text-xs">
                Open Leads
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {message ? <p className="text-xs" style={{ color: "#86efac" }}>{message}</p> : null}
      {error ? <p className="text-xs" style={{ color: "#fca5a5" }}>{error}</p> : null}
    </div>
  );
}
