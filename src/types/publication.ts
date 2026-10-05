export type Publication = {
  /** Filename without extension. */
  id: string;
  title: string;
  url: string;
  /** Position in the list; unique, ascending. */
  order: number;
};
