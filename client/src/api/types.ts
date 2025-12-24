export type GratitudeNoteInput = {
  name: string;
  email: string;
  gratitudeText: string;
  id?: string; // Optional ID for editing existing notes
};

export type GratitudeNote = {
  id: string;
  name: string;
  email?: string;
  gratitudeText: string;
  createdAt?: string;
  status?: string;
};

export type CreateNoteResponse = {
  id: string;
  owner_token: string;
};

export type TodayNotesResponse = {
  items: GratitudeNote[];
};
