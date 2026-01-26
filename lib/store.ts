import type { Todo, Milestone, Vision, Journal, WeeklyEnergy } from "./types";

const STORAGE_KEYS = {
  TODOS: "growth_loop_todos",
  MILESTONES: "growth_loop_milestones",
  VISIONS: "growth_loop_visions",
  JOURNALS: "growth_loop_journals",
};

// Generic storage helpers
function getFromStorage<T>(key: string, userId: string): T[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`${key}_${userId}`);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, userId: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${key}_${userId}`, JSON.stringify(data));
}

// Todos
export function getTodos(userId: string): Todo[] {
  return getFromStorage<Todo>(STORAGE_KEYS.TODOS, userId);
}

export function saveTodos(userId: string, todos: Todo[]): void {
  saveToStorage(STORAGE_KEYS.TODOS, userId, todos);
}

export function addTodo(userId: string, todo: Omit<Todo, "id" | "createdAt">): Todo {
  const todos = getTodos(userId);
  const newTodo: Todo = {
    ...todo,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  todos.push(newTodo);
  saveTodos(userId, todos);
  return newTodo;
}

export function updateTodo(userId: string, todoId: string, updates: Partial<Todo>): void {
  const todos = getTodos(userId);
  const index = todos.findIndex((t) => t.id === todoId);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updates };
    saveTodos(userId, todos);
  }
}

export function deleteTodo(userId: string, todoId: string): void {
  const todos = getTodos(userId).filter((t) => t.id !== todoId);
  saveTodos(userId, todos);
}

// Milestones
export function getMilestones(userId: string): Milestone[] {
  return getFromStorage<Milestone>(STORAGE_KEYS.MILESTONES, userId);
}

export function saveMilestones(userId: string, milestones: Milestone[]): void {
  saveToStorage(STORAGE_KEYS.MILESTONES, userId, milestones);
}

export function addMilestone(
  userId: string,
  milestone: Omit<Milestone, "id" | "createdAt">
): Milestone {
  const milestones = getMilestones(userId);
  const newMilestone: Milestone = {
    ...milestone,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  milestones.push(newMilestone);
  saveMilestones(userId, milestones);
  return newMilestone;
}

export function updateMilestone(
  userId: string,
  milestoneId: string,
  updates: Partial<Milestone>
): void {
  const milestones = getMilestones(userId);
  const index = milestones.findIndex((m) => m.id === milestoneId);
  if (index !== -1) {
    milestones[index] = { ...milestones[index], ...updates };
    saveMilestones(userId, milestones);
  }
}

export function deleteMilestone(userId: string, milestoneId: string): void {
  const milestones = getMilestones(userId).filter((m) => m.id !== milestoneId);
  saveMilestones(userId, milestones);
}

// Visions
export function getVisions(userId: string): Vision[] {
  return getFromStorage<Vision>(STORAGE_KEYS.VISIONS, userId);
}

export function saveVisions(userId: string, visions: Vision[]): void {
  saveToStorage(STORAGE_KEYS.VISIONS, userId, visions);
}

export function addVision(userId: string, vision: Omit<Vision, "id" | "createdAt">): Vision {
  const visions = getVisions(userId);
  const newVision: Vision = {
    ...vision,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  visions.push(newVision);
  saveVisions(userId, visions);
  return newVision;
}

export function updateVision(userId: string, visionId: string, updates: Partial<Vision>): void {
  const visions = getVisions(userId);
  const index = visions.findIndex((v) => v.id === visionId);
  if (index !== -1) {
    visions[index] = { ...visions[index], ...updates };
    saveVisions(userId, visions);
  }
}

export function deleteVision(userId: string, visionId: string): void {
  const visions = getVisions(userId).filter((v) => v.id !== visionId);
  saveVisions(userId, visions);
}

// Journals
export function getJournals(userId: string): Journal[] {
  return getFromStorage<Journal>(STORAGE_KEYS.JOURNALS, userId);
}

export function saveJournals(userId: string, journals: Journal[]): void {
  saveToStorage(STORAGE_KEYS.JOURNALS, userId, journals);
}

export function addJournal(
  userId: string,
  journal: Omit<Journal, "id" | "createdAt" | "updatedAt">
): Journal {
  const journals = getJournals(userId);
  const now = Date.now();
  const newJournal: Journal = {
    ...journal,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  journals.push(newJournal);
  saveJournals(userId, journals);
  return newJournal;
}

// Get or create today's journal
export function getOrCreateTodayJournal(userId: string): Journal {
  const today = new Date().toISOString().split("T")[0];
  let journal = getJournalByDate(userId, today);

  if (!journal) {
    journal = addJournal(userId, {
      date: today,
      moodEntries: [],
      answers: [],
    });
  }

  return journal;
}

// Add a mood entry to a journal
export function addMoodEntry(
  userId: string,
  journalId: string,
  mood: 1 | 2 | 3 | 4 | 5,
  note?: string
): void {
  const journals = getJournals(userId);
  const index = journals.findIndex((j) => j.id === journalId);

  if (index !== -1) {
    const newEntry = {
      id: crypto.randomUUID(),
      mood,
      note,
      timestamp: Date.now(),
    };
    // Ensure moodEntries array exists (for backward compatibility with old data)
    if (!journals[index].moodEntries) {
      journals[index].moodEntries = [];
    }
    journals[index].moodEntries.push(newEntry);
    journals[index].updatedAt = Date.now();
    saveJournals(userId, journals);
  }
}

// Update a mood entry
export function updateMoodEntry(
  userId: string,
  journalId: string,
  entryId: string,
  updates: { mood?: 1 | 2 | 3 | 4 | 5; note?: string }
): void {
  const journals = getJournals(userId);
  const journalIndex = journals.findIndex((j) => j.id === journalId);

  if (journalIndex !== -1) {
    // Ensure moodEntries array exists
    if (!journals[journalIndex].moodEntries) {
      journals[journalIndex].moodEntries = [];
      return;
    }
    const entryIndex = journals[journalIndex].moodEntries.findIndex((e) => e.id === entryId);
    if (entryIndex !== -1) {
      journals[journalIndex].moodEntries[entryIndex] = {
        ...journals[journalIndex].moodEntries[entryIndex],
        ...updates,
      };
      journals[journalIndex].updatedAt = Date.now();
      saveJournals(userId, journals);
    }
  }
}

// Delete a mood entry
export function deleteMoodEntry(userId: string, journalId: string, entryId: string): void {
  const journals = getJournals(userId);
  const journalIndex = journals.findIndex((j) => j.id === journalId);

  if (journalIndex !== -1) {
    // Ensure moodEntries array exists
    if (!journals[journalIndex].moodEntries) {
      journals[journalIndex].moodEntries = [];
      return;
    }
    journals[journalIndex].moodEntries = journals[journalIndex].moodEntries.filter(
      (e) => e.id !== entryId
    );
    journals[journalIndex].updatedAt = Date.now();
    saveJournals(userId, journals);
  }
}

export function getJournalByDate(userId: string, date: string): Journal | undefined {
  return getJournals(userId).find((j) => j.date === date);
}

export function updateJournal(userId: string, journalId: string, updates: Partial<Journal>): void {
  const journals = getJournals(userId);
  const index = journals.findIndex((j) => j.id === journalId);
  if (index !== -1) {
    journals[index] = { ...journals[index], ...updates, updatedAt: Date.now() };
    saveJournals(userId, journals);
  }
}

// Weekly Energy calculation
// Energy is based on: journal mood (40%), task completion (40%), having a journal entry (20%)
export function getWeeklyEnergy(userId: string): WeeklyEnergy[] {
  const todos = getTodos(userId);
  const journals = getJournals(userId);
  const days = ["一", "二", "三", "四", "五", "六", "日"];

  const today = new Date();
  const weekData: WeeklyEnergy[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayIndex = (date.getDay() + 6) % 7; // Monday = 0

    let energy = 0;
    let hasActivity = false;

    // 1. Journal mood contributes 40% (mood 1-5 maps to 8-40 points)
    // Use average mood if multiple entries exist
    const journal = journals.find((j) => j.date === dateStr);
    if (journal && journal.moodEntries && journal.moodEntries.length > 0) {
      const avgMood =
        journal.moodEntries.reduce((sum, e) => sum + e.mood, 0) / journal.moodEntries.length;
      energy += Math.round(avgMood * 8); // 8-40 points based on average mood
      hasActivity = true;
    }

    // 2. Having a journal entry contributes 20% (20 points bonus)
    if (journal && (journal.moodEntries?.length > 0 || journal.answers?.length > 0)) {
      energy += 20;
      hasActivity = true;
    }

    // 3. Task completion contributes 40%
    // Check tasks that were created/due around this date
    const relevantTodos = todos.filter((t) => {
      const todoDate = new Date(t.dueDate).toISOString().split("T")[0];
      return todoDate === dateStr;
    });

    if (relevantTodos.length > 0) {
      const completedCount = relevantTodos.filter((t) => t.completed).length;
      const completionRate = completedCount / relevantTodos.length;
      energy += Math.round(completionRate * 40); // 0-40 points
      hasActivity = true;
    }

    // If no activity at all for this day, show a small baseline (10) to indicate the day exists
    // but only for past days including today
    if (!hasActivity && i >= 0) {
      energy = 10; // Small baseline value so the bar is visible
    }

    weekData.push({
      day: days[dayIndex],
      value: Math.max(0, Math.min(100, energy)),
    });
  }

  return weekData;
}

// Streak calculation
export function getStreak(userId: string): number {
  const todos = getTodos(userId);
  const completedDates = new Set<string>();

  for (const todo of todos) {
    if (todo.completed) {
      const date = new Date(todo.dueDate).toISOString().split("T")[0];
      completedDates.add(date);
    }
  }

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    if (completedDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}
