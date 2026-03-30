export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  children?: CategoryItem[];
};
