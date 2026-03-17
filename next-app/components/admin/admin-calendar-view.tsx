"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, DatesSetArg, EventClickArg, EventInput, EventContentArg } from "@fullcalendar/core";
import { buildLeadPath } from "@/lib/lead-route";

type LeadLite = {
  id: string;
  business_name?: string | null;
};

type CalendarEventRow = {
  id: string;
  workspace_id?: string | null;
  owner_id?: string | null;
  lead_id?: string | null;
  title: string;
  event_type: "appointment" | "client_call" | "personal" | "followup" | "task" | "scout" | string;
  start_time: string;
  end_time?: string | null;
  notes?: string | null;
  is_blocking?: boolean | null;
  hard_block?: boolean | null;
  lead_business_name?: string | null;
  debug?: {
    payload?: Record<string, unknown>;
    owner_id?: string | null;
    workspace_id?: string | null;
  };
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
    personal: "#0ea5e9",
    followup: "#f59e0b",
    task: "#60a5fa",
    scout: "#a78bfa",
  };
  const type = String(row.event_type || "task").toLowerCase();
  const isBlocking = Boolean(row.is_blocking ?? row.hard_block);
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
      isBlocking,
      workspaceId: row.workspace_id || null,
      ownerId: row.owner_id || null,
    },
  };
}

export function AdminCalendarView({ leads }: AdminCalendarViewProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [currentRange, setCurrentRange] = useState<{ start: string; end: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showSoftOnMain, setShowSoftOnMain] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState<"appointment" | "client_call" | "personal" | "followup" | "task" | "scout">("task");
  const [taskIsBlocking, setTaskIsBlocking] = useState(false);
  const [taskStart, setTaskStart] = useState("");
  const [taskEnd, setTaskEnd] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskLeadId, setTaskLeadId] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);
  const [loadingEventDetails, setLoadingEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    eventType: string;
    start: string;
    end: string;
    notes: string;
    leadId: string;
    leadBusinessName: string;
    isBlocking: boolean;
    workspaceId: string;
    ownerId: string;
  } | null>(null);
  const [saveDebug, setSaveDebug] = useState<{
    save_attempted: boolean;
    payload: Record<string, unknown> | null;
    workspace_id: string | null;
    owner_id: string | null;
    save_succeeded: boolean;
    error: string | null;
  }>({
    save_attempted: false,
    payload: null,
    workspace_id: null,
    owner_id: null,
    save_succeeded: false,
    error: null,
  });

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
    setCurrentRange({ start: arg.startStr, end: arg.endStr });
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

  async function refreshCurrentRange() {
    if (!currentRange) return;
    setLoading(true);
    try {
      const rows = await fetchEvents(currentRange.start, currentRange.end);
      setEvents(rows.map(toEventInput));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not refresh calendar events.");
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

  async function onEventClick(arg: EventClickArg) {
    const fallback = {
      id: String(arg.event.id || ""),
      title: String(arg.event.title || ""),
      eventType: String(arg.event.extendedProps?.eventType || "task"),
      start: arg.event.start ? new Date(arg.event.start).toISOString().slice(0, 16) : "",
      end: arg.event.end ? new Date(arg.event.end).toISOString().slice(0, 16) : "",
      notes: String(arg.event.extendedProps?.notes || ""),
      leadId: String(arg.event.extendedProps?.leadId || ""),
      leadBusinessName: String(arg.event.extendedProps?.leadBusinessName || ""),
      isBlocking: Boolean(arg.event.extendedProps?.isBlocking),
      workspaceId: String(arg.event.extendedProps?.workspaceId || ""),
      ownerId: String(arg.event.extendedProps?.ownerId || ""),
    };
    setSelectedEvent(fallback);
    setLoadingEventDetails(true);
    try {
      const res = await fetch(`/api/calendar/events/${encodeURIComponent(fallback.id)}`, { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as CalendarEventRow & { error?: string };
      if (!res.ok) throw new Error(body.error || "Could not load event details.");
      setSelectedEvent({
        id: String(body.id || fallback.id),
        title: String(body.title || fallback.title),
        eventType: String(body.event_type || fallback.eventType),
        start: body.start_time ? new Date(body.start_time).toISOString().slice(0, 16) : fallback.start,
        end: body.end_time ? new Date(body.end_time).toISOString().slice(0, 16) : "",
        notes: String(body.notes || ""),
        leadId: String(body.lead_id || fallback.leadId || ""),
        leadBusinessName: String(body.lead_business_name || fallback.leadBusinessName || ""),
        isBlocking: Boolean(body.is_blocking ?? fallback.isBlocking),
        workspaceId: String(body.workspace_id || fallback.workspaceId || ""),
        ownerId: String(body.owner_id || fallback.ownerId || ""),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load event details.");
    } finally {
      setLoadingEventDetails(false);
    }
  }

  function onDateSelect(arg: DateSelectArg) {
    const isoStart = arg.startStr.slice(0, 16);
    const isoEnd = arg.endStr ? arg.endStr.slice(0, 16) : "";
    setTaskStart(isoStart);
    setTaskEnd(isoEnd);
    if (!taskTitle.trim()) setTaskTitle("Follow-up task");
  }

  useEffect(() => {
    if (taskType === "appointment" || taskType === "client_call" || taskType === "personal") {
      setTaskIsBlocking(true);
    } else {
      setTaskIsBlocking(false);
    }
  }, [taskType]);

  function eventContent(arg: EventContentArg) {
    const eventType = String(arg.event.extendedProps?.eventType || "task");
    const isBlocking = Boolean(arg.event.extendedProps?.isBlocking);
    return (
      <div style={{ padding: "2px 4px" }}>
        <div style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>{arg.timeText ? `${arg.timeText} ` : ""}{arg.event.title}</div>
        <div style={{ fontSize: 10, opacity: 0.9 }}>
          {eventType} · {isBlocking ? "blocking" : "non-blocking"}
        </div>
      </div>
    );
  }

  async function createTask() {
    const rawPayload = {
      title: taskTitle.trim(),
      event_type: taskType,
      start_time: taskStart ? new Date(taskStart).toISOString() : null,
      end_time: taskEnd ? new Date(taskEnd).toISOString() : null,
      notes: taskNotes.trim() || null,
      is_blocking: taskIsBlocking,
      lead_id: taskLeadId || null,
    };
    // Reflect click/submit immediately in debug panel, even if validation fails.
    setSaveDebug({
      save_attempted: true,
      payload: rawPayload,
      workspace_id: null,
      owner_id: null,
      save_succeeded: false,
      error: null,
    });
    setError(null);
    setMessage(null);
    const title = taskTitle.trim();
    if (!title) {
      setError("Task title is required.");
      setSaveDebug((prev) => ({ ...prev, error: "Task title is required." }));
      return;
    }
    if (!taskStart) {
      setError("Start time is required.");
      setSaveDebug((prev) => ({ ...prev, error: "Start time is required." }));
      return;
    }
    const requestPayload = {
      title,
      event_type: taskType,
      start_time: new Date(taskStart).toISOString(),
      end_time: taskEnd ? new Date(taskEnd).toISOString() : null,
      notes: taskNotes.trim() || null,
      is_blocking: taskIsBlocking,
      lead_id: taskLeadId || null,
    };
    setSaveDebug((prev) => ({ ...prev, payload: requestPayload }));
    setSavingEvent(true);
    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      const body = (await res.json().catch(() => ({}))) as CalendarEventRow & { error?: string };
      const debug = body.debug || {};
      if (!res.ok) {
        const errText = body.error || "Could not create event.";
        setError(errText);
        setSaveDebug({
          save_attempted: true,
          payload: requestPayload,
          workspace_id: String(debug.workspace_id || "").trim() || null,
          owner_id: String(debug.owner_id || "").trim() || null,
          save_succeeded: false,
          error: errText,
        });
        return;
      }
      const created = body && body.id ? toEventInput(body) : null;
      if (created) {
        setEvents((prev) => [...prev.filter((ev) => String(ev.id || "") !== String(created.id || "")), created]);
      }
      await refreshCurrentRange();
      setTaskTitle("");
      setTaskNotes("");
      setTaskLeadId("");
      setMessage(taskType === "appointment" ? "Appointment created" : "Event created");
      setSaveDebug({
        save_attempted: true,
        payload: requestPayload,
        workspace_id: String(debug.workspace_id || "").trim() || null,
        owner_id: String(debug.owner_id || "").trim() || null,
        save_succeeded: true,
        error: null,
      });
    } catch (e) {
      const errText = e instanceof Error ? e.message : "Could not create event.";
      setError(errText);
      setSaveDebug((prev) => ({ ...prev, save_succeeded: false, error: errText }));
    } finally {
      setSavingEvent(false);
    }
  }

  function onCreateEventSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void createTask();
  }

  async function saveSelectedEvent() {
    if (!selectedEvent) return;
    setError(null);
    setMessage(null);
    if (!selectedEvent.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!selectedEvent.start) {
      setError("Start time is required.");
      return;
    }
    setSavingEvent(true);
    try {
      const res = await fetch(`/api/calendar/events/${encodeURIComponent(selectedEvent.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedEvent.title,
          event_type: selectedEvent.eventType,
          start_time: new Date(selectedEvent.start).toISOString(),
          end_time: selectedEvent.end ? new Date(selectedEvent.end).toISOString() : null,
          notes: selectedEvent.notes || null,
          lead_id: selectedEvent.leadId || null,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as CalendarEventRow & { error?: string };
      if (!res.ok) {
        setError(body.error || "Could not update event.");
        return;
      }
      setMessage("Event updated successfully.");
      setSelectedEvent(null);
      await refreshCurrentRange();
    } finally {
      setSavingEvent(false);
    }
  }

  async function deleteSelectedEvent() {
    if (!selectedEvent) return;
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    setSavingEvent(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/calendar/events/${encodeURIComponent(selectedEvent.id)}`, {
        method: "DELETE",
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error || "Could not delete event.");
        return;
      }
      setEvents((prev) => prev.filter((ev) => String(ev.id || "") !== selectedEvent.id));
      setSelectedEvent(null);
      setMessage("Event deleted.");
      await refreshCurrentRange();
    } finally {
      setSavingEvent(false);
    }
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
            eventContent={eventContent}
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
          <section className="admin-card">
            <h2 className="text-sm font-semibold">Manual Event Creation</h2>
            <form className="space-y-2 mt-2" onSubmit={onCreateEventSubmit}>
              <input
                className="admin-input h-9"
                placeholder="Event title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Event type
              </label>
              <select className="admin-input h-9" value={taskType} onChange={(e) => setTaskType(e.target.value as typeof taskType)}>
                <option value="appointment">appointment</option>
                <option value="client_call">client_call</option>
                <option value="personal">personal</option>
                <option value="followup">followup</option>
                <option value="task">task</option>
                <option value="scout">scout</option>
              </select>
              <label className="text-xs flex items-center gap-2" style={{ color: "var(--admin-muted)" }}>
                <input type="checkbox" checked={taskIsBlocking} onChange={(e) => setTaskIsBlocking(Boolean(e.target.checked))} />
                blocking event
              </label>
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
                <button type="submit" className="admin-btn-primary text-xs" disabled={savingEvent}>
                  {savingEvent ? "Saving..." : "Create Event"}
                </button>
              </div>
            </form>
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

      {selectedEvent ? (
        <section className="admin-card space-y-2">
          <h2 className="text-sm font-semibold">Event Details</h2>
          {loadingEventDetails ? (
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Loading event details...
            </p>
          ) : null}
          <input
            className="admin-input h-9"
            value={selectedEvent.title}
            onChange={(e) => setSelectedEvent((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
          />
          <select
            className="admin-input h-9"
            value={selectedEvent.eventType}
            onChange={(e) => setSelectedEvent((prev) => (prev ? { ...prev, eventType: e.target.value } : prev))}
          >
            <option value="appointment">appointment</option>
            <option value="client_call">client_call</option>
            <option value="personal">personal</option>
            <option value="followup">followup</option>
            <option value="task">task</option>
            <option value="scout">scout</option>
          </select>
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className="admin-input h-9"
              type="datetime-local"
              value={selectedEvent.start}
              onChange={(e) => setSelectedEvent((prev) => (prev ? { ...prev, start: e.target.value } : prev))}
            />
            <input
              className="admin-input h-9"
              type="datetime-local"
              value={selectedEvent.end}
              onChange={(e) => setSelectedEvent((prev) => (prev ? { ...prev, end: e.target.value } : prev))}
            />
          </div>
          <textarea
            className="admin-input min-h-[100px]"
            value={selectedEvent.notes}
            onChange={(e) => setSelectedEvent((prev) => (prev ? { ...prev, notes: e.target.value } : prev))}
            placeholder="Notes"
          />
          <div className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Type: {selectedEvent.eventType} · {selectedEvent.isBlocking ? "blocking" : "non-blocking"} · owner:{" "}
            {selectedEvent.ownerId || "—"} · workspace: {selectedEvent.workspaceId || "—"}
          </div>
          <div className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Lead ID: {selectedEvent.leadId || "—"}
          </div>
          {selectedEvent.leadId ? (
            <div className="flex flex-wrap gap-2">
              <a href={buildLeadPath(selectedEvent.leadId, selectedEvent.leadBusinessName || null)} className="admin-btn-ghost text-xs">
                Open Lead
              </a>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button className="admin-btn-primary text-xs" onClick={() => void saveSelectedEvent()} disabled={savingEvent}>
              {savingEvent ? "Saving..." : "Save Changes"}
            </button>
            <button className="admin-btn-danger text-xs" onClick={() => void deleteSelectedEvent()} disabled={savingEvent}>
              Delete Event
            </button>
            <button className="admin-btn-ghost text-xs" onClick={() => setSelectedEvent(null)} disabled={savingEvent}>
              Close
            </button>
          </div>
        </section>
      ) : null}

      {message ? <p className="text-xs" style={{ color: "#86efac" }}>{message}</p> : null}
      {error ? <p className="text-xs" style={{ color: "#fca5a5" }}>{error}</p> : null}
      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2">Calendar Save Debug (temporary)</h2>
        <div className="text-xs space-y-1" style={{ color: "var(--admin-muted)" }}>
          <p>save_attempted: {String(saveDebug.save_attempted)}</p>
          <p>workspace_id: {saveDebug.workspace_id || "null"}</p>
          <p>owner_id: {saveDebug.owner_id || "null"}</p>
          <p>save_succeeded: {String(saveDebug.save_succeeded)}</p>
          <p>error: {saveDebug.error || "none"}</p>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0, padding: "8px", border: "1px solid var(--admin-border)", borderRadius: 8 }}>
            payload: {JSON.stringify(saveDebug.payload, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}
