export type InterviewState = "SETUP" | "INTERVIEW" | "FEEDBACK";

export type SeniorityLevel = "Junior" | "Mid-Level" | "Senior" | "Staff / Lead";

export interface CandidateProfile {
  name: string;
  seniority: SeniorityLevel;
}

export interface SampleJobDescription {
  id: string;
  title: string;
  category: "Frontend" | "Backend" | "Full Stack" | "AI / ML" | "DevOps" | "Product";
  company: string;
  description: string;
}

export interface InterviewMetrics {
  userMessagesCount: number;
  aiMessagesCount: number;
  totalExchanges: number;
  elapsedSeconds: number;
}
