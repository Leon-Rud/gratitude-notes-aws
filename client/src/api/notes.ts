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
  gratitude_text: string;
  created_at: string;
  status: string;
};

function mapNote(raw: RawNote): GratitudeNote {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    gratitudeText: raw.gratitude_text,
    createdAt: raw.created_at,
    status: raw.status,
  };
}

export async function createGratitudeNote(input: GratitudeNoteInput) {
  const payload: any = {
    name: input.name,
    email: input.email,
    gratitudeText: input.gratitudeText,
  };
  // Include ID if provided (for editing)
  if (input.id) {
    payload.id = input.id;
  }
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

export async function deleteNote(id: string, token: string) {
  const params = new URLSearchParams();
  params.append("token", token);

  const path = `/gratitude-notes/${encodeURIComponent(id)}?${params.toString()}`;
  const { data } = await callApi<{ deleted?: boolean }>(path, "DELETE");
  return data;
}

export async function submitFeedback(feedbackText: string) {
  const { data } = await callApi<{ message: string }>("/feedback", "POST", {
    body: { feedback: feedbackText },
  });
  return data;
}
