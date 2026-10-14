import type { Lead } from "./types";

export function isClosed(lead: Lead): boolean {
  return lead.status === "Won" || lead.status === "Lost";
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function isTodayFollowUp(lead: Lead): boolean {
  return !!lead.follow_up_at && !isClosed(lead) && isToday(lead.follow_up_at);
}

export function isOverdue(lead: Lead): boolean {
  return (
    !!lead.follow_up_at &&
    !isClosed(lead) &&
    new Date(lead.follow_up_at).getTime() < Date.now()
  );
}

export function formatFollowUp(iso: string, overdue: boolean): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (isToday(iso)) {
    return overdue
      ? `Overdue: was due today at ${time}`
      : `Follow-up today at ${time}`;
  }

  const date = d.toLocaleDateString([], { month: "short", day: "numeric" });
  return overdue
    ? `Overdue: was due ${date}, ${time}`
    : `Follow-up ${date}, ${time}`;
}