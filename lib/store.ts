import { supabase } from "./supabase";
import type { Todo, Milestone, Vision, Journal, WeeklyEnergy, MoodEntry } from "./types";

// Todos
export async function getTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching todos:", error);
    return [];
  }

  return data.map((t) => ({
    id: t.id,
    title: t.title,
    isFocus: t.is_focus,
    completed: t.completed,
    milestoneId: t.milestone_id,
    dueDate: new Date(t.due_date).getTime(),
    tags: t.tags || [],
    createdAt: new Date(t.created_at).getTime(),
  }));
}

export async function addTodo(
  userId: string,
  todo: Omit<Todo, "id" | "createdAt">
): Promise<Todo | null> {
  const { data, error } = await supabase
    .from("todos")
    .insert({
      user_id: userId,
      title: todo.title,
      is_focus: todo.isFocus,
      completed: todo.completed,
      milestone_id: todo.milestoneId,
      due_date: new Date(todo.dueDate).toISOString(),
      tags: todo.tags,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding todo:", error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    isFocus: data.is_focus,
    completed: data.completed,
    milestoneId: data.milestone_id,
    dueDate: new Date(data.due_date).getTime(),
    tags: data.tags || [],
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updates: Partial<Todo>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.isFocus !== undefined) dbUpdates.is_focus = updates.isFocus;
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if (updates.milestoneId !== undefined) dbUpdates.milestone_id = updates.milestoneId;
  if (updates.dueDate !== undefined) dbUpdates.due_date = new Date(updates.dueDate).toISOString();
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

  const { error } = await supabase
    .from("todos")
    .update(dbUpdates)
    .eq("id", todoId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating todo:", error);
  }
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", todoId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting todo:", error);
  }
}

// Milestones
export async function getMilestones(userId: string): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching milestones:", error);
    return [];
  }

  return data.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    type: m.type as Milestone["type"],
    startValue: Number(m.start_value),
    targetValue: Number(m.target_value),
    currentValue: Number(m.current_value),
    deadline: new Date(m.deadline).getTime(),
    colorTheme: m.color_theme as Milestone["colorTheme"],
    createdAt: new Date(m.created_at).getTime(),
  }));
}

export async function addMilestone(
  userId: string,
  milestone: Omit<Milestone, "id" | "createdAt">
): Promise<Milestone | null> {
  const { data, error } = await supabase
    .from("milestones")
    .insert({
      user_id: userId,
      title: milestone.title,
      description: milestone.description,
      type: milestone.type,
      start_value: milestone.startValue,
      target_value: milestone.targetValue,
      current_value: milestone.currentValue,
      deadline: new Date(milestone.deadline).toISOString(),
      color_theme: milestone.colorTheme,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding milestone:", error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    type: data.type as Milestone["type"],
    startValue: Number(data.start_value),
    targetValue: Number(data.target_value),
    currentValue: Number(data.current_value),
    deadline: new Date(data.deadline).getTime(),
    colorTheme: data.color_theme as Milestone["colorTheme"],
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function updateMilestone(
  userId: string,
  milestoneId: string,
  updates: Partial<Milestone>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.startValue !== undefined) dbUpdates.start_value = updates.startValue;
  if (updates.targetValue !== undefined) dbUpdates.target_value = updates.targetValue;
  if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
  if (updates.deadline !== undefined) dbUpdates.deadline = new Date(updates.deadline).toISOString();
  if (updates.colorTheme !== undefined) dbUpdates.color_theme = updates.colorTheme;

  const { error } = await supabase
    .from("milestones")
    .update(dbUpdates)
    .eq("id", milestoneId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating milestone:", error);
  }
}

export async function deleteMilestone(userId: string, milestoneId: string): Promise<void> {
  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", milestoneId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting milestone:", error);
  }
}

// Visions
export async function getVisions(userId: string): Promise<Vision[]> {
  const { data, error } = await supabase
    .from("visions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching visions:", error);
    return [];
  }

  return data.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    imageUrl: v.image_url,
    category: v.category,
    createdAt: new Date(v.created_at).getTime(),
  }));
}

export async function addVision(
  userId: string,
  vision: Omit<Vision, "id" | "createdAt">
): Promise<Vision | null> {
  const { data, error } = await supabase
    .from("visions")
    .insert({
      user_id: userId,
      title: vision.title,
      description: vision.description,
      image_url: vision.imageUrl,
      category: vision.category,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding vision:", error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    imageUrl: data.image_url,
    category: data.category,
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function updateVision(
  userId: string,
  visionId: string,
  updates: Partial<Vision>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  if (updates.category !== undefined) dbUpdates.category = updates.category;

  const { error } = await supabase
    .from("visions")
    .update(dbUpdates)
    .eq("id", visionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating vision:", error);
  }
}

export async function deleteVision(userId: string, visionId: string): Promise<void> {
  const { error } = await supabase
    .from("visions")
    .delete()
    .eq("id", visionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting vision:", error);
  }
}

// Journals
export async function getJournals(userId: string): Promise<Journal[]> {
  const { data, error } = await supabase
    .from("journals")
    .select(`
      *,
      mood_entries (*),
      journal_answers (*)
    `)
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching journals:", error);
    return [];
  }

  return data.map((j) => ({
    id: j.id,
    date: j.date,
    moodEntries: (j.mood_entries || []).map((e: { id: string; mood: number; note: string | null; timestamp: string }) => ({
      id: e.id,
      mood: e.mood as MoodEntry["mood"],
      note: e.note || undefined,
      timestamp: new Date(e.timestamp).getTime(),
    })),
    answers: (j.journal_answers || []).map((a: { question_id: string; content: string }) => ({
      questionId: a.question_id,
      content: a.content,
    })),
    createdAt: new Date(j.created_at).getTime(),
    updatedAt: new Date(j.updated_at).getTime(),
  }));
}

export async function getJournalByDate(userId: string, date: string): Promise<Journal | undefined> {
  const { data, error } = await supabase
    .from("journals")
    .select(`
      *,
      mood_entries (*),
      journal_answers (*)
    `)
    .eq("user_id", userId)
    .eq("date", date)
    .single();

  if (error || !data) {
    return undefined;
  }

  return {
    id: data.id,
    date: data.date,
    moodEntries: (data.mood_entries || []).map((e: { id: string; mood: number; note: string | null; timestamp: string }) => ({
      id: e.id,
      mood: e.mood as MoodEntry["mood"],
      note: e.note || undefined,
      timestamp: new Date(e.timestamp).getTime(),
    })),
    answers: (data.journal_answers || []).map((a: { question_id: string; content: string }) => ({
      questionId: a.question_id,
      content: a.content,
    })),
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  };
}

export async function getOrCreateTodayJournal(userId: string): Promise<Journal> {
  const today = new Date().toISOString().split("T")[0];
  let journal = await getJournalByDate(userId, today);

  if (!journal) {
    const { data, error } = await supabase
      .from("journals")
      .insert({
        user_id: userId,
        date: today,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error("Failed to create journal");
    }

    journal = {
      id: data.id,
      date: data.date,
      moodEntries: [],
      answers: [],
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };
  }

  return journal;
}

export async function addMoodEntry(
  userId: string,
  journalId: string,
  mood: 1 | 2 | 3 | 4 | 5,
  note?: string
): Promise<void> {
  const { error } = await supabase.from("mood_entries").insert({
    journal_id: journalId,
    mood,
    note,
  });

  if (error) {
    console.error("Error adding mood entry:", error);
    return;
  }

  // Update journal's updated_at
  await supabase
    .from("journals")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", journalId);
}

export async function updateMoodEntry(
  userId: string,
  journalId: string,
  entryId: string,
  updates: { mood?: 1 | 2 | 3 | 4 | 5; note?: string }
): Promise<void> {
  const { error } = await supabase
    .from("mood_entries")
    .update(updates)
    .eq("id", entryId);

  if (error) {
    console.error("Error updating mood entry:", error);
    return;
  }

  await supabase
    .from("journals")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", journalId);
}

export async function deleteMoodEntry(
  userId: string,
  journalId: string,
  entryId: string
): Promise<void> {
  const { error } = await supabase.from("mood_entries").delete().eq("id", entryId);

  if (error) {
    console.error("Error deleting mood entry:", error);
    return;
  }

  await supabase
    .from("journals")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", journalId);
}

export async function updateJournal(
  userId: string,
  journalId: string,
  updates: Partial<Journal>
): Promise<void> {
  // Handle answers update
  if (updates.answers) {
    // Delete existing answers and insert new ones
    await supabase.from("journal_answers").delete().eq("journal_id", journalId);

    if (updates.answers.length > 0) {
      await supabase.from("journal_answers").insert(
        updates.answers.map((a) => ({
          journal_id: journalId,
          question_id: a.questionId,
          content: a.content,
        }))
      );
    }
  }

  await supabase
    .from("journals")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", journalId);
}

// Weekly Energy calculation
export async function getWeeklyEnergy(userId: string): Promise<WeeklyEnergy[]> {
  const todos = await getTodos(userId);
  const journals = await getJournals(userId);
  const days = ["一", "二", "三", "四", "五", "六", "日"];

  const today = new Date();
  const weekData: WeeklyEnergy[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayIndex = (date.getDay() + 6) % 7;

    let energy = 0;
    let hasActivity = false;

    const journal = journals.find((j) => j.date === dateStr);
    if (journal && journal.moodEntries && journal.moodEntries.length > 0) {
      const avgMood =
        journal.moodEntries.reduce((sum, e) => sum + e.mood, 0) / journal.moodEntries.length;
      energy += Math.round(avgMood * 8);
      hasActivity = true;
    }

    if (journal && (journal.moodEntries?.length > 0 || journal.answers?.length > 0)) {
      energy += 20;
      hasActivity = true;
    }

    const relevantTodos = todos.filter((t) => {
      const todoDate = new Date(t.dueDate).toISOString().split("T")[0];
      return todoDate === dateStr;
    });

    if (relevantTodos.length > 0) {
      const completedCount = relevantTodos.filter((t) => t.completed).length;
      const completionRate = completedCount / relevantTodos.length;
      energy += Math.round(completionRate * 40);
      hasActivity = true;
    }

    if (!hasActivity && i >= 0) {
      energy = 10;
    }

    weekData.push({
      day: days[dayIndex],
      value: Math.max(0, Math.min(100, energy)),
    });
  }

  return weekData;
}

// Streak calculation
export async function getStreak(userId: string): Promise<number> {
  const todos = await getTodos(userId);
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

// Legacy sync functions (no-ops for backward compatibility)
export function saveTodos(): void {}
export function saveMilestones(): void {}
export function saveVisions(): void {}
export function saveJournals(): void {}
export async function addJournal(
  userId: string,
  journal: Omit<Journal, "id" | "createdAt" | "updatedAt">
): Promise<Journal> {
  const { data, error } = await supabase
    .from("journals")
    .insert({
      user_id: userId,
      date: journal.date,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error("Failed to create journal");
  }

  // Insert mood entries if any
  if (journal.moodEntries && journal.moodEntries.length > 0) {
    await supabase.from("mood_entries").insert(
      journal.moodEntries.map((e) => ({
        journal_id: data.id,
        mood: e.mood,
        note: e.note,
      }))
    );
  }

  // Insert answers if any
  if (journal.answers && journal.answers.length > 0) {
    await supabase.from("journal_answers").insert(
      journal.answers.map((a) => ({
        journal_id: data.id,
        question_id: a.questionId,
        content: a.content,
      }))
    );
  }

  return {
    id: data.id,
    date: data.date,
    moodEntries: journal.moodEntries || [],
    answers: journal.answers || [],
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  };
}
