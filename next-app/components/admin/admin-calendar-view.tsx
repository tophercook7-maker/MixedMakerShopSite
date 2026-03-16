"use client";

import { useEffect, useMemo, useState } from "react";
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
  event_type: "appointment" | "client_call" | "followup" | "task" | "scout" | string;
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
    appointment: "#22c55e",
    client_call: "#16a34a",
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
  const [showSoftOnMain, setShowSoftOnMain] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

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

  useEffect(() => {
    void loadCalendarSettings();
  }, []);

  async function loadCalendarSettings() {
    try {
      const res = await fetch("/api/calendar/settings", { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        show_soft_events_on_main_calendar?: boolean;
      };
      if (!res.ok) throw new Error(body.error || "Could not load calendar settings.");
      setShowSoftOnMain(Boolean(body.show_soft_events_on_main_calendar));
    } catch {
      // Do not block calendar rendering for settings failure.
    }
  }

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

  async function createTask(eventType: "task" | "followup" | "client_call" | "appointment") {
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
          Month, week, and day planning for appointments, client calls, follow-up reminders, tasks, and scout runs.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            id="soft-events-setting"
            type="checkbox"
            checked={showSoftOnMain}
            onChange={async (e) => {
              const next = Boolean(e.target.checked);
              setShowSoftOnMain(next);
              setSavingSettings(true);
              try {
                const res = await fetch("/api/calendar/settings", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ show_soft_events_on_main_calendar: next }),
                });
                const body = (await res.json().catch(() => ({}))) as { error?: string };
                if (!res.ok) throw new Error(body.error || "Could not save calendar setting.");
                setError(null);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not save setting.");
              } finally {
                setSavingSettings(false);
              }
            }}
          />
          <label htmlFor="soft-events-setting" className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Show soft events on main calendar availability feed
            {savingSettings ? " (saving...)" : ""}
          </label>
        </div>
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
          {!loading && events.length === 0 ? (
            <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
              No calendar events yet. Create your first appointment or reminder.
            </p>
          ) : null}
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
                Create Follow-up Reminder
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void createTask("client_call")}>
                Create Client Call
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void createTask("appointment")}>
                Create Appointment
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
