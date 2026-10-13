import type { Lead, Status } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running?");
  }

  if (!res.ok) {
    let message = "Something went wrong";
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      
    }
    throw new ApiError(message);
  }

  return res.json() as Promise<T>;
}

export function fetchLeads(params: { status?: Status; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return request<Lead[]>(`/leads${qs ? `?${qs}` : ""}`);
}