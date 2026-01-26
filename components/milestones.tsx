"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
} from "@/lib/store";
import type { Milestone, MilestoneType } from "@/lib/types";
import { Plus, Target, Trash2, Edit3, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  Tooltip,
} from "recharts";

const COLOR_THEMES: { id: Milestone["colorTheme"]; color: string; bg: string }[] = [
  { id: "mint", color: "#4ADE80", bg: "bg-[#4ADE80]" },
  { id: "peach", color: "#FB923C", bg: "bg-[#FB923C]" },
  { id: "dream", color: "#A78BFA", bg: "bg-[#A78BFA]" },
  { id: "sky", color: "#38BDF8", bg: "bg-[#38BDF8]" },
];

const MILESTONE_TYPES: { id: MilestoneType; label: string; description: string }[] = [
  { id: "self-rating", label: "自评", description: "手动评估完成百分比" },
  { id: "numeric", label: "数值", description: "从某个数值到某个数值" },
  { id: "count", label: "次数", description: "从0次到目标次数" },
];

function getDaysRemaining(deadline: number): number {
  const now = new Date();
  const target = new Date(deadline);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Calculate progress percentage based on milestone type
function calculateProgress(milestone: Milestone): number {
  // Handle missing or invalid values with defaults
  const currentValue = milestone.currentValue ?? 0;
  const targetValue = milestone.targetValue ?? 100;
  const startValue = milestone.startValue ?? 0;
  const type = milestone.type || "numeric";

  switch (type) {
    case "self-rating":
      // Self-rating: currentValue is the progress percentage (0-100)
      return Math.max(0, Math.min(100, Math.round(currentValue)));

    case "count":
      // Count: from 0 to targetValue
      if (targetValue <= 0) return 0;
      const countProgress = (currentValue / targetValue) * 100;
      return Math.max(0, Math.min(100, Math.round(countProgress)));

    case "numeric":
    default:
      // Numeric: from startValue to targetValue
      const range = targetValue - startValue;
      if (range === 0) return currentValue >= targetValue ? 100 : 0;
      const numericProgress = ((currentValue - startValue) / range) * 100;
      return Math.max(0, Math.min(100, Math.round(numericProgress)));
  }
}

function CircularProgress({
  progress,
  color,
  size = 48,
}: {
  progress: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Ensure progress is a valid number to prevent NaN
  const safeProgress = Number.isFinite(progress) ? progress : 0;
  const offset = circumference - (safeProgress / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

export function Milestones() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    type: "numeric" as MilestoneType,
    startValue: 0,
    targetValue: 100,
    currentValue: 0,
    deadline: "",
    colorTheme: "mint" as Milestone["colorTheme"],
  });
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    type: "numeric" as MilestoneType,
    startValue: 0,
    targetValue: 100,
    currentValue: 0,
    deadline: "",
    colorTheme: "mint" as Milestone["colorTheme"],
  });

  useEffect(() => {
    if (user) {
      loadMilestones();
    }
  }, [user]);

  const loadMilestones = () => {
    if (!user) return;
    setMilestones(getMilestones(user.id));
  };

  const handleAddMilestone = () => {
    if (!user || !newMilestone.title.trim() || !newMilestone.deadline) return;

    // Set default values based on type
    let startValue = newMilestone.startValue;
    let targetValue = newMilestone.targetValue;
    let currentValue = newMilestone.currentValue;

    if (newMilestone.type === "self-rating") {
      startValue = 0;
      targetValue = 100;
      // currentValue is the self-assessed percentage
    } else if (newMilestone.type === "count") {
      startValue = 0;
      // currentValue starts at 0, targetValue is the goal count
    }

    addMilestone(user.id, {
      title: newMilestone.title,
      description: newMilestone.description,
      type: newMilestone.type,
      startValue,
      targetValue,
      currentValue,
      deadline: new Date(newMilestone.deadline).getTime(),
      colorTheme: newMilestone.colorTheme,
    });

    setNewMilestone({
      title: "",
      description: "",
      type: "numeric",
      startValue: 0,
      targetValue: 100,
      currentValue: 0,
      deadline: "",
      colorTheme: "mint",
    });
    setIsDialogOpen(false);
    loadMilestones();
  };

  const handleUpdateProgress = (milestoneId: string, newValue: number) => {
    if (!user) return;
    updateMilestone(user.id, milestoneId, { currentValue: newValue });
    loadMilestones();
    if (selectedMilestone?.id === milestoneId) {
      setSelectedMilestone({
        ...selectedMilestone,
        currentValue: newValue,
      });
    }
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    if (!user) return;
    deleteMilestone(user.id, milestoneId);
    setSelectedMilestone(null);
    loadMilestones();
  };

  const handleStartEdit = () => {
    if (!selectedMilestone) return;
    setEditForm({
      title: selectedMilestone.title,
      description: selectedMilestone.description || "",
      type: selectedMilestone.type || "numeric",
      startValue: selectedMilestone.startValue ?? 0,
      targetValue: selectedMilestone.targetValue ?? 100,
      currentValue: selectedMilestone.currentValue ?? 0,
      deadline: new Date(selectedMilestone.deadline).toISOString().split("T")[0],
      colorTheme: selectedMilestone.colorTheme || "mint",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!user || !selectedMilestone || !editForm.title.trim()) return;

    updateMilestone(user.id, selectedMilestone.id, {
      title: editForm.title,
      description: editForm.description,
      type: editForm.type,
      startValue: editForm.startValue,
      targetValue: editForm.targetValue,
      currentValue: editForm.currentValue,
      deadline: new Date(editForm.deadline).getTime(),
      colorTheme: editForm.colorTheme,
    });

    setIsEditing(false);
    loadMilestones();
    
    // Update selected milestone with new values
    setSelectedMilestone({
      ...selectedMilestone,
      title: editForm.title,
      description: editForm.description,
      type: editForm.type,
      startValue: editForm.startValue,
      targetValue: editForm.targetValue,
      currentValue: editForm.currentValue,
      deadline: new Date(editForm.deadline).getTime(),
      colorTheme: editForm.colorTheme,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const getColorInfo = (colorTheme: Milestone["colorTheme"]) => {
    return COLOR_THEMES.find((c) => c.id === colorTheme) || COLOR_THEMES[0];
  };

  // Generate mock trend data
  const generateTrendData = (milestone: Milestone) => {
    const progress = calculateProgress(milestone);
    return [
      { week: "1周", value: Math.round(progress * 0.2) },
      { week: "2周", value: Math.round(progress * 0.4) },
      { week: "3周", value: Math.round(progress * 0.6) },
      { week: "4周", value: Math.round(progress * 0.8) },
      { week: "现在", value: progress },
    ];
  };

  return (
    <div className="pb-24 px-4 md:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">里程碑</h1>
            <p className="text-muted-foreground text-sm mt-1">
              追踪你的长期目标
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="rounded-full gradient-sky text-white press-effect"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md">
              <DialogHeader>
                <DialogTitle>创建新里程碑</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    颜色主题
                  </label>
                  <div className="flex gap-2">
                    {COLOR_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          setNewMilestone({
                            ...newMilestone,
                            colorTheme: theme.id,
                          })
                        }
                        className={`w-10 h-10 rounded-xl ${theme.bg} transition-all press-effect ${
                          newMilestone.colorTheme === theme.id
                            ? "ring-2 ring-offset-2 ring-foreground/20"
                            : ""
                        }`}
                        aria-label={theme.id}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    里程碑名称
                  </label>
                  <Input
                    value={newMilestone.title}
                    onChange={(e) =>
                      setNewMilestone({ ...newMilestone, title: e.target.value })
                    }
                    placeholder="例如：存款10万元"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    描述（可选）
                  </label>
                  <Textarea
                    value={newMilestone.description}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        description: e.target.value,
                      })
                    }
                    placeholder="为什么这个目标对你重要？"
                    className="rounded-xl min-h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    进度衡量方式
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {MILESTONE_TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setNewMilestone({
                            ...newMilestone,
                            type: t.id,
                            // Reset values based on type
                            startValue: t.id === "numeric" ? newMilestone.startValue : 0,
                            targetValue: t.id === "self-rating" ? 100 : newMilestone.targetValue,
                            currentValue: t.id === "self-rating" ? 0 : newMilestone.currentValue,
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          newMilestone.type === t.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="font-medium text-sm text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional fields based on type */}
                {newMilestone.type === "self-rating" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      当前完成度
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newMilestone.currentValue}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            currentValue: Number(e.target.value),
                          })
                        }
                        className="flex-1 accent-primary"
                      />
                      <span className="text-sm font-semibold text-foreground w-12 text-right">
                        {newMilestone.currentValue}%
                      </span>
                    </div>
                  </div>
                )}

                {newMilestone.type === "count" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        目标次数
                      </label>
                      <Input
                        type="number"
                        value={newMilestone.targetValue}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            targetValue: Number(e.target.value),
                          })
                        }
                        placeholder="例如: 12"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        已完成次数
                      </label>
                      <Input
                        type="number"
                        value={newMilestone.currentValue}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            currentValue: Number(e.target.value),
                          })
                        }
                        placeholder="例如: 0"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {newMilestone.type === "numeric" && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        起始值
                      </label>
                      <Input
                        type="number"
                        value={newMilestone.startValue}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            startValue: Number(e.target.value),
                          })
                        }
                        placeholder="例如: 80"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        目标值
                      </label>
                      <Input
                        type="number"
                        value={newMilestone.targetValue}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            targetValue: Number(e.target.value),
                          })
                        }
                        placeholder="例如: 90"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        当前值
                      </label>
                      <Input
                        type="number"
                        value={newMilestone.currentValue}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            currentValue: Number(e.target.value),
                          })
                        }
                        placeholder="例如: 80"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    截止日期
                  </label>
                  <Input
                    type="date"
                    value={newMilestone.deadline}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        deadline: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>

                <Button
                  onClick={handleAddMilestone}
                  disabled={!newMilestone.title.trim() || !newMilestone.deadline}
                  className="w-full rounded-xl gradient-peach text-white press-effect"
                >
                  <Target className="w-4 h-4 mr-2" />
                  创建里程碑
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Milestone List */}
      {milestones.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center mt-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
            <Target className="w-8 h-8 text-[#38BDF8]" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            设定你的第一个里程碑
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            将大目标分解成可追踪的里程碑，让进步可视化
          </p>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {milestones.map((milestone) => {
            const colorInfo = getColorInfo(milestone.colorTheme);
            const progress = calculateProgress(milestone);
            const daysRemaining = getDaysRemaining(milestone.deadline);

            return (
              <button
                key={milestone.id}
                type="button"
                onClick={() => setSelectedMilestone(milestone)}
                className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 text-left transition-all hover:scale-[1.02] press-effect"
              >
                <div className="relative">
                  <CircularProgress
                    progress={progress}
                    color={colorInfo.color}
                  />
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
                    style={{ color: colorInfo.color }}
                  >
                    {progress}%
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {milestone.title}
                  </h4>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {daysRemaining > 0
                      ? `还剩 ${daysRemaining} 天`
                      : daysRemaining === 0
                        ? "今天截止"
                        : `已超期 ${Math.abs(daysRemaining)} 天`}
                  </p>
                </div>

                <div className="text-right">
                  {milestone.type === "self-rating" ? (
                    <>
                      <p className="font-semibold text-foreground">
                        {milestone.currentValue}%
                      </p>
                      <p className="text-muted-foreground text-xs">自评</p>
                    </>
                  ) : milestone.type === "count" ? (
                    <>
                      <p className="font-semibold text-foreground">
                        {milestone.currentValue}/{milestone.targetValue}
                      </p>
                      <p className="text-muted-foreground text-xs">次</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground">
                        {milestone.currentValue}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {milestone.startValue} - {milestone.targetValue}
                      </p>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedMilestone}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMilestone(null);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="rounded-3xl max-w-md max-h-[90vh] overflow-y-auto">
          {selectedMilestone && !isEditing && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedMilestone.title}</DialogTitle>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      aria-label="编辑"
                    >
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteMilestone(selectedMilestone.id)
                      }
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      aria-label="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Description */}
                {selectedMilestone.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedMilestone.description}
                  </p>
                )}

                {/* Progress Circle */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <CircularProgress
                      progress={calculateProgress(selectedMilestone)}
                      color={getColorInfo(selectedMilestone.colorTheme).color}
                      size={120}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className="text-2xl font-bold"
                        style={{
                          color: getColorInfo(selectedMilestone.colorTheme)
                            .color,
                        }}
                      >
                        {calculateProgress(selectedMilestone)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        完成进度
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trend Chart */}
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateTrendData(selectedMilestone)}>
                      <defs>
                        <linearGradient
                          id="areaGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={
                              getColorInfo(selectedMilestone.colorTheme).color
                            }
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor={
                              getColorInfo(selectedMilestone.colorTheme).color
                            }
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="week"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#94A3B8" }}
                      />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={
                          getColorInfo(selectedMilestone.colorTheme).color
                        }
                        fill="url(#areaGradient)"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={
                          getColorInfo(selectedMilestone.colorTheme).color
                        }
                        strokeWidth={3}
                        dot={{
                          fill: "#fff",
                          stroke: getColorInfo(selectedMilestone.colorTheme)
                            .color,
                          strokeWidth: 2,
                          r: 4,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Update Progress */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    更新进度
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={selectedMilestone.currentValue}
                      onChange={(e) =>
                        setSelectedMilestone({
                          ...selectedMilestone,
                          currentValue: Number(e.target.value),
                        })
                      }
                      className="rounded-xl flex-1"
                    />
                    <Button
                      onClick={() =>
                        handleUpdateProgress(
                          selectedMilestone.id,
                          selectedMilestone.currentValue
                        )
                      }
                      className="rounded-xl gradient-mint text-white press-effect"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    起始值: {selectedMilestone.startValue} | 目标值: {selectedMilestone.targetValue}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Edit Form */}
          {selectedMilestone && isEditing && (
            <>
              <DialogHeader>
                <DialogTitle>编辑里程碑</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    颜色主题
                  </label>
                  <div className="flex gap-2">
                    {COLOR_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            colorTheme: theme.id,
                          })
                        }
                        className={`w-10 h-10 rounded-xl ${theme.bg} transition-all press-effect ${
                          editForm.colorTheme === theme.id
                            ? "ring-2 ring-offset-2 ring-foreground/20"
                            : ""
                        }`}
                        aria-label={theme.id}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    里程碑名称
                  </label>
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    placeholder="例如：存款10万元"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    描述（可选）
                  </label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="为什么这个目标对你重要？"
                    className="rounded-xl min-h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      起始值
                    </label>
                    <Input
                      type="number"
                      value={editForm.startValue}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          startValue: Number(e.target.value),
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      目标值
                    </label>
                    <Input
                      type="number"
                      value={editForm.targetValue}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          targetValue: Number(e.target.value),
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      当前值
                    </label>
                    <Input
                      type="number"
                      value={editForm.currentValue}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          currentValue: Number(e.target.value),
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    截止日期
                  </label>
                  <Input
                    type="date"
                    value={editForm.deadline}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        deadline: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1 rounded-xl bg-transparent"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={!editForm.title.trim() || !editForm.deadline}
                    className="flex-1 rounded-xl gradient-peach text-white press-effect"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
