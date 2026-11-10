export interface FlashcardData {
  id: string;
  articleId: string;
  question: string;
  answer: string;
  source: SourceReference;
  kind?: 'direct' | 'synthesis';
  relatedSources?: RelatedSource[];
}

export interface SourceReference {
  file: string;
  title: string;
  pages: number[];
  sections: string[];
  evidence: string[];
}

export interface RelatedSource {
  articleId: string;
  source: SourceReference;
}
