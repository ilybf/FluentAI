export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface AIWritingFeedback {
  score: number;
  correctedText: string;
  grammar: string[];
  style: string[];
}

export interface ReadingQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}
