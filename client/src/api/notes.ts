import { callApi } from "./client";
import type {
  CreateNoteResponse,
  GratitudeNote,
  GratitudeNoteInput,
  TodayNotesResponse,
} from "./types";

type RawNote = {
  id: string;
  name: string;
  email?: string;
  note_items: string[];
  created_at: string;
  status: string;
};

function mapNote(raw: RawNote): GratitudeNote {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    gratitudeItems: raw.note_items,
    createdAt: raw.created_at,
    status: raw.status,
  };
}

export async function createGratitudeNote(input: GratitudeNoteInput) {
  const payload = {
    name: input.name,
    email: input.email,
    gratitudeText: input.gratitudeText,
  };
  const { data, status } = await callApi<CreateNoteResponse>(
    "/gratitude-notes",
    "POST",
    { body: payload },
  );
  if (status !== 200 && status !== 201)
    throw new Error(`Unexpected status: ${status}`);
  return data;
}

export async function getTodayNotes(): Promise<TodayNotesResponse> {
  const { data } = await callApi<{ items: RawNote[] }>(
    `/gratitude-notes/today`,
    "GET",
  );
  return {
    items: data.items.map(mapNote),
  };
}

export async function getNote(id: string): Promise<GratitudeNote> {
  const { data } = await callApi<RawNote>(
    `/gratitude-notes/${encodeURIComponent(id)}`,
    "GET",
  );
  return mapNote(data);
}

export async function deleteNote(id: string, token: string) {
  const params = new URLSearchParams();
  params.append("token", token);

  const path = `/gratitude-notes/${encodeURIComponent(id)}?${params.toString()}`;
  const { data } = await callApi<{ deleted?: boolean }>(path, "DELETE");
  return data;
}

export function parseGratitudeText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^[-•*]\s+/, "").trim())
    .filter(Boolean)
    .map((item) => (item.length > 150 ? item.slice(0, 150) : item));
}

export async function submitFeedback(feedbackText: string) {
  const { data } = await callApi<{ message: string }>("/feedback", "POST", {
    body: { feedback: feedbackText },
  });
  return data;
}
