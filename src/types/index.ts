export interface Sentence {
  id: number;
  text: string;
  translation: string;
}

export interface Feedback {
  pronunciation: string;
  fluency: string;
  overall: string;
  suggestions: string;
}

export interface RecordingState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
} 