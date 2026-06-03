export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: readonly string[];
  list?: readonly string[];
  afterList?: string;
};
