"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getJournals,
  getJournalByDate,
  updateJournal,
  getOrCreateTodayJournal,
  addMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
} from "@/lib/store";
import type { Journal as JournalType, MoodEntry } from "@/lib/types";
import { ChevronLeft, ChevronRight, Check, Eye, Edit3, X, Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { JSX } from "react";

type ViewMode = "list" | "view" | "mood" | "questions" | "bulk-edit" | "preview";

const MOODS = [
  { value: 5, emoji: "Grinning", label: "非常开心", color: "#4ADE80" },
  { value: 4, emoji: "Smile", label: "开心", color: "#86EFAC" },
  { value: 3, emoji: "Neutral", label: "一般", color: "#FB923C" },
  { value: 2, emoji: "Sad", label: "低落", color: "#94A3B8" },
  { value: 1, emoji: "Tired", label: "疲惫", color: "#F87171" },
];

const QUESTIONS = [
  { id: "grateful", title: "今日感恩", prompt: "今天你感恩什么？" },
  { id: "achievement", title: "今日成就", prompt: "今天你完成了什么让你骄傲的事？" },
  { id: "learn", title: "今日学习", prompt: "今天你学到了什么新东西？" },
  { id: "tomorrow", title: "明日计划", prompt: "明天最重要的事是什么？" },
];

function MoodEmoji({ mood, size = 32 }: { mood: number; size?: number }) {
  const moodData = MOODS.find((m) => m.value === mood) || MOODS[2];

  const emojis: Record<string, JSX.Element> = {
    Grinning: (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" fill={moodData.color} />
        <circle cx="12" cy="14" r="2" fill="white" />
        <circle cx="24" cy="14" r="2" fill="white" />
        <path d="M10 22C12 26 24 26 26 22" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    Smile: (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" fill={moodData.color} />
        <circle cx="12" cy="14" r="2" fill="white" />
        <circle cx="24" cy="14" r="2" fill="white" />
        <path d="M12 22C14 24 22 24 24 22" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    Neutral: (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" fill={moodData.color} />
        <circle cx="12" cy="14" r="2" fill="white" />
        <circle cx="24" cy="14" r="2" fill="white" />
        <path d="M12 23H24" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    Sad: (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" fill={moodData.color} />
        <circle cx="12" cy="14" r="2" fill="white" />
        <circle cx="24" cy="14" r="2" fill="white" />
        <path d="M12 25C14 22 22 22 24 25" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    Tired: (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" fill={moodData.color} />
        <path d="M9 14L15 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M21 14L27 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="18" cy="24" rx="4" ry="3" fill="white" />
      </svg>
    ),
  };

  return emojis[moodData.emoji];
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Journal() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [todayJournal, setTodayJournal] = useState<JournalType | null>(null);
  const [journals, setJournals] = useState<JournalType[]>([]);
  const [viewingJournal, setViewingJournal] = useState<JournalType | null>(null);

  // Mood recording state
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [editingMoodEntry, setEditingMoodEntry] = useState<MoodEntry | null>(null);
  const [showMoodInput, setShowMoodInput] = useState(false);

  // Questions state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const allJournals = await getJournals(user.id);
    setJournals(allJournals.sort((a, b) => b.createdAt - a.createdAt));
    const existing = await getJournalByDate(user.id, today);
    if (existing) {
      setTodayJournal(existing);
      const answerMap: Record<string, string> = {};
      for (const a of existing.answers) {
        answerMap[a.questionId] = a.content;
      }
      setAnswers(answerMap);
    }
  };

  const handleViewJournal = (journal: JournalType) => {
    setViewingJournal(journal);
    setViewMode("view");
  };

  // Start recording a new mood
  const handleStartMoodRecord = () => {
    setSelectedMood(null);
    setMoodNote("");
    setEditingMoodEntry(null);
    setViewMode("mood");
  };

  // Edit an existing mood entry
  const handleEditMoodEntry = (entry: MoodEntry) => {
    setSelectedMood(entry.mood);
    setMoodNote(entry.note || "");
    setEditingMoodEntry(entry);
    setViewMode("mood");
  };

  // Save mood entry
  const handleSaveMood = async () => {
    if (!user || selectedMood === null) return;

    // Ensure today's journal exists
    const journal = await getOrCreateTodayJournal(user.id);

    if (editingMoodEntry) {
      // Update existing entry
      await updateMoodEntry(user.id, journal.id, editingMoodEntry.id, {
        mood: selectedMood as 1 | 2 | 3 | 4 | 5,
        note: moodNote.trim() || undefined,
      });
    } else {
      // Add new entry
      await addMoodEntry(user.id, journal.id, selectedMood as 1 | 2 | 3 | 4 | 5, moodNote.trim() || undefined);
    }

    setEditingMoodEntry(null);
    loadData();
    setViewMode("list");
  };

  // Delete mood entry
  const handleDeleteMoodEntry = async (entryId: string) => {
    if (!user || !todayJournal) return;
    await deleteMoodEntry(user.id, todayJournal.id, entryId);
    loadData();
  };

  // Start editing questions
  const handleStartQuestions = () => {
    setCurrentQuestionIndex(0);
    setViewMode("questions");
  };

  // Save questions
  const handleSaveQuestions = async () => {
    if (!user) return;

    const journal = await getOrCreateTodayJournal(user.id);
    const journalAnswers = Object.entries(answers).map(([questionId, content]) => ({
      questionId,
      content,
    }));

    await updateJournal(user.id, journal.id, { answers: journalAnswers });
    loadData();
    setViewMode("list");
  };

  // Get average mood for a journal
  const getAverageMood = (journal: JournalType): number => {
    if (!journal.moodEntries || journal.moodEntries.length === 0) return 3;
    const sum = journal.moodEntries.reduce((acc, e) => acc + e.mood, 0);
    return Math.round(sum / journal.moodEntries.length);
  };

  // Render mood recording view
  const renderMoodView = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {editingMoodEntry ? "编辑心情" : "现在感觉如何？"}
          </h2>
          <p className="text-muted-foreground text-sm">选择最能代表你此刻心情的表情</p>
        </div>

        <div className="flex justify-center gap-3 md:gap-4 mb-6">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => setSelectedMood(mood.value)}
              className={`flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl transition-all press-effect ${
                selectedMood === mood.value ? "bg-secondary scale-110" : "hover:bg-secondary/50"
              }`}
            >
              <MoodEmoji mood={mood.value} size={36} />
              <span className="text-xs text-muted-foreground">{mood.label}</span>
            </button>
          ))}
        </div>

        {selectedMood !== null && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm text-muted-foreground text-center">为什么是这个心情？（选填）</p>
            <Textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="发生了什么让你有这样的感受..."
              className="min-h-20 rounded-2xl resize-none text-sm"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{moodNote.length}/200</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setViewMode("list")}
          className="flex-1 rounded-xl"
        >
          取消
        </Button>
        <Button
          onClick={handleSaveMood}
          disabled={selectedMood === null}
          className="flex-1 rounded-xl gradient-peach text-white press-effect"
        >
          <Check className="w-4 h-4 mr-1" />
          {editingMoodEntry ? "保存修改" : "记录心情"}
        </Button>
      </div>
    </div>
  );

  // Handle keyboard in questions view - Enter to next, Shift+Enter for newline
  const handleQuestionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex((i) => i + 1);
      } else {
        handleSaveQuestions();
      }
    }
  };

  // Render questions view (one by one for new entries)
  const renderQuestionsView = () => {
    const question = QUESTIONS[currentQuestionIndex];
    if (!question) return null;

    return (
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex gap-1">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= currentQuestionIndex ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <div className="glass-card rounded-3xl p-6 min-h-[280px] flex flex-col justify-center">
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary text-xs text-secondary-foreground mb-3">
              {question.title}
            </span>
            <h2 className="text-xl font-bold text-foreground">{question.prompt}</h2>
          </div>

          <Textarea
            value={answers[question.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            onKeyDown={handleQuestionKeyDown}
            placeholder="写下你的想法...（Enter 下一题，Shift+Enter 换行）"
            className="min-h-28 rounded-2xl resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              if (currentQuestionIndex === 0) {
                setViewMode("list");
              } else {
                setCurrentQuestionIndex((i) => i - 1);
              }
            }}
            className="rounded-xl"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {currentQuestionIndex === 0 ? "取消" : "上一题"}
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} / {QUESTIONS.length}
          </span>

          {currentQuestionIndex < QUESTIONS.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex((i) => i + 1)}
              className="rounded-xl gradient-peach text-white press-effect"
            >
              下一题
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSaveQuestions}
              className="rounded-xl gradient-mint text-white press-effect"
            >
              完成
              <Check className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render bulk edit view (all questions at once for editing)
  const renderBulkEditView = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">编辑今日反思</h2>
        <div className="space-y-5">
          {QUESTIONS.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="text-sm font-medium text-foreground">{question.title}</label>
              <p className="text-xs text-muted-foreground">{question.prompt}</p>
              <Textarea
                value={answers[question.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                placeholder="写下你的想法..."
                className="min-h-20 rounded-xl resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setViewMode("list")}
          className="flex-1 rounded-xl bg-transparent"
        >
          取消
        </Button>
        <Button
          onClick={handleSaveQuestions}
          className="flex-1 rounded-xl gradient-mint text-white press-effect"
        >
          <Check className="w-4 h-4 mr-1" />
          保存
        </Button>
      </div>
    </div>
  );

  // Render preview view (full view of today's journal)
  const renderPreviewView = () => {
    const journal = todayJournal;
    if (!journal) return null;

    return (
      <div className="space-y-4">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">今日反思</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode("bulk-edit")}
              className="rounded-xl bg-transparent"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              编辑
            </Button>
          </div>

          {journal.answers?.some((a) => a.content) ? (
            <div className="space-y-5">
              {journal.answers.map((answer) => {
                const question = QUESTIONS.find((q) => q.id === answer.questionId);
                if (!question || !answer.content) return null;

                return (
                  <div key={answer.questionId} className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-secondary text-xs text-secondary-foreground">
                      {question.title}
                    </span>
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap pl-1">
                      {answer.content}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">还没有写反思内容</p>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setViewMode("list")}
          className="w-full rounded-xl"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          返回
        </Button>
      </div>
    );
  };

  // Handle quick mood submit with Enter
  const handleQuickMoodKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuickMoodSubmit();
    }
  };

  // Quick mood submit from inline form
  const handleQuickMoodSubmit = async () => {
    if (!user || selectedMood === null) return;
    const journal = await getOrCreateTodayJournal(user.id);
    await addMoodEntry(user.id, journal.id, selectedMood as 1 | 2 | 3 | 4 | 5, moodNote.trim() || undefined);
    setSelectedMood(null);
    setMoodNote("");
    setShowMoodInput(false);
    loadData();
  };

  // Handle inline mood selection
  const handleInlineMoodSelect = (mood: number) => {
    setSelectedMood(mood);
    setShowMoodInput(true);
  };

  // Render list view
  const renderListView = () => (
    <div className="space-y-4">
      {/* Quick mood recording */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-semibold text-foreground mb-3">此刻心情如何？</h3>

        <div className="flex justify-center gap-2 md:gap-3 mb-4">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => handleInlineMoodSelect(mood.value)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all press-effect ${
                selectedMood === mood.value ? "bg-secondary scale-110" : "hover:bg-secondary/50"
              }`}
            >
              <MoodEmoji mood={mood.value} size={32} />
              <span className="text-[10px] text-muted-foreground">{mood.label}</span>
            </button>
          ))}
        </div>

        {showMoodInput && selectedMood !== null && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              onKeyDown={handleQuickMoodKeyDown}
              placeholder="想说点什么？（选填，Enter 提交）"
              className="min-h-16 rounded-xl resize-none text-sm"
              maxLength={200}
              autoFocus
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedMood(null);
                  setShowMoodInput(false);
                  setMoodNote("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                取消
              </button>
              <Button
                size="sm"
                onClick={handleQuickMoodSubmit}
                className="rounded-xl gradient-peach text-white press-effect"
              >
                <Check className="w-4 h-4 mr-1" />
                记录
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Today's mood timeline */}
      {todayJournal?.moodEntries && todayJournal.moodEntries.length > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="font-semibold text-foreground mb-4">今日心情记录</h3>
          <div className="space-y-3">
            {todayJournal.moodEntries
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                >
                  <MoodEmoji mood={entry.mood} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {MOODS.find((m) => m.value === entry.mood)?.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{entry.note}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditMoodEntry(entry)}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteMoodEntry(entry.id)}
                      className="h-8 w-8 p-0 rounded-lg text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Today's reflection */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">今日反思</h3>
          <div className="flex gap-2">
            {todayJournal?.answers?.some((a) => a.content) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setViewMode("preview")}
                className="rounded-xl"
              >
                <Eye className="w-4 h-4 mr-1" />
                查看
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (todayJournal?.answers?.some((a) => a.content)) {
                  setViewMode("bulk-edit");
                } else {
                  handleStartQuestions();
                }
              }}
              className="rounded-xl bg-transparent"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              {todayJournal?.answers?.some((a) => a.content) ? "编辑" : "开始"}
            </Button>
          </div>
        </div>

        {todayJournal?.answers?.some((a) => a.content) ? (
          <div className="space-y-3">
            {todayJournal.answers
              .filter((a) => a.content)
              .slice(0, 2)
              .map((answer) => {
                const question = QUESTIONS.find((q) => q.id === answer.questionId);
                return (
                  <div key={answer.questionId} className="space-y-1">
                    <span className="text-xs text-muted-foreground">{question?.title}</span>
                    <p className="text-sm text-foreground line-clamp-2">{answer.content}</p>
                  </div>
                );
              })}
            {todayJournal.answers.filter((a) => a.content).length > 2 && (
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className="text-xs text-primary hover:underline"
              >
                查看全部 {todayJournal.answers.filter((a) => a.content).length} 条记录...
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            记录今天的感恩、成就和学习
          </p>
        )}
      </div>

      {/* Past journals */}
      {journals.filter((j) => j.date !== today).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 px-1">历史记录</h3>
          <div className="space-y-2">
            {journals
              .filter((j) => j.date !== today)
              .map((journal) => (
                <button
                  type="button"
                  key={journal.id}
                  onClick={() => handleViewJournal(journal)}
                  className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  <MoodEmoji mood={getAverageMood(journal)} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(journal.date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {journal.moodEntries?.length || 0} 条心情记录
                      {journal.answers?.filter((a) => a.content).length > 0 &&
                        ` · ${journal.answers.filter((a) => a.content).length} 条反思`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render view mode - shows single journal detail
  const renderViewMode = () => {
    if (!viewingJournal) return null;

    return (
      <div className="space-y-4">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">
              {new Date(viewingJournal.date).toLocaleDateString("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </h3>
          </div>

          {/* Mood Timeline */}
          {viewingJournal.moodEntries && viewingJournal.moodEntries.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-foreground mb-3">心情变化</h4>
              <div className="space-y-2">
                {viewingJournal.moodEntries
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30"
                    >
                      <MoodEmoji mood={entry.mood} size={32} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {MOODS.find((m) => m.value === entry.mood)?.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-sm text-muted-foreground">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Answers */}
          {viewingJournal.answers?.some((a) => a.content) && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">反思记录</h4>
              {viewingJournal.answers.map((answer) => {
                const question = QUESTIONS.find((q) => q.id === answer.questionId);
                if (!question || !answer.content) return null;

                return (
                  <div key={answer.questionId} className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-secondary text-xs text-secondary-foreground">
                      {question.title}
                    </span>
                    <p className="text-foreground text-sm leading-relaxed pl-1">{answer.content}</p>
                  </div>
                );
              })}
            </div>
          )}

          {(!viewingJournal.moodEntries || viewingJournal.moodEntries.length === 0) &&
            !viewingJournal.answers?.some((a) => a.content) && (
              <p className="text-muted-foreground text-center py-4">这篇日记还没有内容</p>
            )}
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setViewingJournal(null);
            setViewMode("list");
          }}
          className="w-full rounded-xl"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          返回列表
        </Button>
      </div>
    );
  };

  return (
    <div className="pb-24 px-4 md:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">沉浸日记</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date().toLocaleDateString("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>

          {viewMode === "view" && viewingJournal && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setViewingJournal(null);
                setViewMode("list");
              }}
              className="rounded-xl"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Content based on view mode */}
      {viewMode === "list" && renderListView()}
      {viewMode === "view" && renderViewMode()}
      {viewMode === "mood" && renderMoodView()}
      {viewMode === "questions" && renderQuestionsView()}
      {viewMode === "bulk-edit" && renderBulkEditView()}
      {viewMode === "preview" && renderPreviewView()}
    </div>
  );
}
