export type MediaRecord = {
  id: string;
  format: string;
  owner: string;
  upload_date: string;
  changes_date: string;
  name: string;
  size: number;
  url?: string | null;
};
