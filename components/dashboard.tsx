"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getTodos,
  updateTodo,
  deleteTodo,
  getWeeklyEnergy,
  getStreak,
} from "@/lib/store";
import type { Todo, WeeklyEnergy } from "@/lib/types";
import {
  Check,
  Flame,
  MoreHorizontal,
  Trash2,
  Calendar,
  Edit3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "早安";
  if (hour < 18) return "午安";
  return "晚安";
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    weekday: "long",
  };
  return date.toLocaleDateString("zh-CN", options);
}

export function Dashboard() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [weeklyEnergy, setWeeklyEnergy] = useState<WeeklyEnergy[]>([]);
  const [streak, setStreak] = useState(0);
  const [completedAnimation, setCompletedAnimation] = useState<string | null>(
    null
  );
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    dueDate: "",
    tags: "",
    isFocus: false,
  });

  const loadData = useCallback(async () => {
    if (!user) return;
    const [todosData, energyData, streakData] = await Promise.all([
      getTodos(user.id),
      getWeeklyEnergy(user.id),
      getStreak(user.id),
    ]);
    setTodos(todosData);
    setWeeklyEnergy(energyData);
    setStreak(streakData);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const focusTodo = todos.find((t) => t.isFocus && !t.completed);
  const otherTodos = todos.filter(
    (t) => !t.completed && (!t.isFocus || t.id !== focusTodo?.id)
  );

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    if (!user) return;
    if (!completed) {
      setCompletedAnimation(todoId);
      setTimeout(() => {
        setCompletedAnimation(null);
      }, 600);
    }
    await updateTodo(user.id, todoId, { completed: !completed });
    loadData();
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!user) return;
    await deleteTodo(user.id, todoId);
    loadData();
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditForm({
      title: todo.title,
      dueDate: new Date(todo.dueDate).toISOString().split("T")[0],
      tags: todo.tags.join(", "),
      isFocus: todo.isFocus,
    });
  };

  const handleSaveEdit = async () => {
    if (!user || !editingTodo || !editForm.title.trim()) return;

    await updateTodo(user.id, editingTodo.id, {
      title: editForm.title,
      dueDate: new Date(editForm.dueDate).getTime(),
      tags: editForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      isFocus: editForm.isFocus,
    });

    setEditingTodo(null);
    loadData();
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  return (
    <div className="pb-24 px-4 md:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">
              {formatDate(new Date())}
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              {getGreeting()}，{user?.username}
            </h1>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF7ED]">
            <Flame className="w-4 h-4 text-[#FB923C]" />
            <span className="text-sm font-semibold text-[#FB923C]">
              {streak} 天
            </span>
          </div>
        </div>
      </header>

      {/* Focus Card */}
      {focusTodo ? (
        <section className="mb-6">
          <div className="gradient-peach rounded-3xl p-6 relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <p className="text-white/80 text-sm font-medium mb-2">今日焦点</p>
            <h2 className="text-white text-xl font-bold mb-4 pr-12">
              {focusTodo.title}
            </h2>

            <div className="flex items-center justify-between">
              {focusTodo.tags.length > 0 && (
                <div className="flex gap-2">
                  {focusTodo.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/20 text-white text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleToggleTodo(focusTodo.id, focusTodo.completed)}
                className={`w-12 h-12 rounded-full bg-white flex items-center justify-center press-effect transition-all ${
                  completedAnimation === focusTodo.id ? "scale-110" : ""
                }`}
                aria-label="完成任务"
              >
                <Check className="w-6 h-6 text-[#FB923C]" />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-6">
          <div className="glass-card rounded-3xl p-6 text-center">
            <p className="text-muted-foreground">
              没有设定今日焦点，点击下方添加按钮创建任务
            </p>
          </div>
        </section>
      )}

      {/* Weekly Energy Chart */}
      <section className="mb-6">
        <div className="glass-card rounded-3xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            本周成长能量
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyEnergy} barCategoryGap="20%">
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                />
                <YAxis hide domain={[0, 100]} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} maxBarSize={16}>
                  {weeklyEnergy.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#energyGradient)`}
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient
                    id="energyGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#4ADE80" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Todo List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">待办事项</h3>
          <span className="text-xs text-muted-foreground">
            {otherTodos.length} 项待完成
          </span>
        </div>

        <div className="space-y-3">
          {otherTodos.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-muted-foreground text-sm">
                暂无待办事项，好好休息吧
              </p>
            </div>
          ) : (
            otherTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onEdit={handleStartEdit}
                isAnimating={completedAnimation === todo.id}
              />
            ))
          )}
        </div>
      </section>

      {/* Edit Todo Dialog */}
      <Dialog open={!!editingTodo} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>编辑待办事项</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                任务名称
              </label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="输入任务名称"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                截止日期
              </label>
              <Input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                标签（用逗号分隔）
              </label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="例如: 工作, 重要"
                className="rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditForm({ ...editForm, isFocus: !editForm.isFocus })}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  editForm.isFocus
                    ? "bg-primary border-primary"
                    : "border-border hover:border-primary"
                }`}
              >
                {editForm.isFocus && <Check className="w-4 h-4 text-white" />}
              </button>
              <span className="text-sm text-foreground">设为今日焦点</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="flex-1 rounded-xl bg-transparent"
              >
                取消
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!editForm.title.trim() || !editForm.dueDate}
                className="flex-1 rounded-xl gradient-peach text-white press-effect"
              >
                <Check className="w-4 h-4 mr-2" />
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  isAnimating: boolean;
}

function TodoItem({ todo, onToggle, onDelete, onEdit, isAnimating }: TodoItemProps) {
  const dueDate = new Date(todo.dueDate);
  const isOverdue = dueDate < new Date() && !todo.completed;

  return (
    <div
      className={`glass-card rounded-2xl p-4 flex items-center gap-4 transition-all ${
        isAnimating ? "scale-95 opacity-50" : ""
      } ${todo.completed ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={() => onToggle(todo.id, todo.completed)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all press-effect ${
          todo.completed
            ? "bg-[#4ADE80] border-[#4ADE80]"
            : "border-border hover:border-primary"
        }`}
        aria-label={todo.completed ? "标记未完成" : "标记完成"}
      >
        {todo.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`font-medium truncate ${
            todo.completed ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span
            className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
          >
            {dueDate.toLocaleDateString("zh-CN", {
              month: "short",
              day: "numeric",
            })}
          </span>
          {todo.tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="更多操作"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem onClick={() => onEdit(todo)}>
            <Edit3 className="w-4 h-4 mr-2" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(todo.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
