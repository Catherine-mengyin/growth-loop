// User
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: number;
}

// Todo/Task
export interface Todo {
  id: string;
  title: string;
  isFocus: boolean;
  completed: boolean;
  milestoneId?: string;
  dueDate: number;
  tags: string[];
  createdAt: number;
}

// Milestone progress type:
// - "self-rating": User manually rates progress 0-100%
// - "numeric": Progress from startValue to targetValue (e.g., weight 80kg -> 70kg)
// - "count": Progress from 0 to targetValue (e.g., read 0 -> 12 books)
export type MilestoneType = "self-rating" | "numeric" | "count";

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  type: MilestoneType;
  startValue: number; // For numeric type; ignored for self-rating and count
  targetValue: number; // For numeric/count; ignored for self-rating
  currentValue: number; // Current progress value
  deadline: number;
  colorTheme: "mint" | "peach" | "dream" | "sky";
  createdAt: number;
}

// Vision
export interface Vision {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: string;
  createdAt: number;
}

// Mood Entry - a single mood record within a day
export interface MoodEntry {
  id: string;
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string; // Why this mood
  timestamp: number; // When this mood was recorded
}

// Journal - one per day, can have multiple mood entries
export interface Journal {
  id: string;
  date: string;
  moodEntries: MoodEntry[]; // Multiple mood records throughout the day
  answers: {
    questionId: string;
    content: string;
  }[];
  createdAt: number;
  updatedAt: number;
}

// Weekly Energy Data
export interface WeeklyEnergy {
  day: string;
  value: number;
}
