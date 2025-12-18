export type GratitudeNoteInput = {
  name: string;
  email: string;
  gratitudeText: string;
};

export type GratitudeNote = {
  id: string;
  name: string;
  email?: string;
  gratitudeItems: string[];
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
