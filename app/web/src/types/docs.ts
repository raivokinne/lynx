export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface TranslatedContent {
  [key: string]: {
    [languageCode: string]: string;
  };
}

export interface CodeExample {
  language: string;
  code: string;
  filename?: string;
}

export interface ComparisonExample {
  title: string;
  description: string;
  examples: {
    [languageCode: string]: CodeExample;
  };
}

export interface SearchResult {
  section: string;
  sectionTitle: string;
  content: string;
  type: "heading" | "text" | "code";
  language?: string;
}
