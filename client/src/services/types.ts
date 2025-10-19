export type CreateResponse = {
  message: string;
  id: string;
};

export type CheckResponse = {
  exists: boolean;
  id: string;
};

export type DeleteResponse = {
  message: string;
  id: string;
};
