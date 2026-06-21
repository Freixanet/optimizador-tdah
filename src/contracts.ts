export type SourceType = 'text' | 'link' | 'youtube' | 'file' | 'pdf';

export type SavedSession = {
  data: Record<string, unknown>;
  currentStep: number;
  isComplete?: boolean;
  viewAll?: boolean;
};

export type MapRecord = {
  id: string;
  title: string;
  category?: string;
  pinned?: boolean;
  pinnedAt?: number;
  createdAt: number;
  updatedAt: number;
  sourceType: SourceType;
  session: SavedSession;
};

export type TransformRequest = {
  text?: string;
  type: 'text' | 'link' | 'pdf' | 'image';
  fileData?: string;
  mimeType?: string;
  preferredModel?: string;
};
