"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { addTodo, getMilestones } from "@/lib/store";
import type { Milestone } from "@/lib/types";
import { Star, Calendar, Tag, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
}

const PRESET_TAGS = ["工作", "学习", "健康", "生活", "创意"];

export function AddTaskDialog({
  open,
  onOpenChange,
  onTaskAdded,
}: AddTaskDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<string>("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMilestones = async () => {
    if (user) {
      const data = await getMilestones(user.id);
      setMilestones(data);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      loadMilestones();
    } else {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const resetForm = () => {
    setTitle("");
    setIsFocus(false);
    setDueDate(new Date().toISOString().split("T")[0]);
    setSelectedTags([]);
    setSelectedMilestone("");
  };

  const handleSubmit = async () => {
    if (!user || !title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addTodo(user.id, {
        title: title.trim(),
        isFocus,
        completed: false,
        dueDate: new Date(dueDate).getTime(),
        tags: selectedTags,
        milestoneId: selectedMilestone || undefined,
      });

      resetForm();
      onOpenChange(false);
      onTaskAdded();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle>添加新任务</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Title */}
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="今天要完成什么？"
              className="h-12 rounded-xl text-base"
              autoFocus
            />
          </div>

          {/* Focus Toggle */}
          <button
            type="button"
            onClick={() => setIsFocus(!isFocus)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all press-effect ${
              isFocus
                ? "gradient-peach text-white"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <Star className={`w-5 h-5 ${isFocus ? "fill-current" : ""}`} />
            <div className="flex-1 text-left">
              <p className="font-medium">设为今日焦点</p>
              <p className={`text-xs ${isFocus ? "text-white/70" : "text-muted-foreground"}`}>
                最重要的一件事
              </p>
            </div>
          </button>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              截止日期
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              标签
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all press-effect ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Milestone */}
          {milestones.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                关联里程碑
              </label>
              <div className="flex flex-wrap gap-2">
                {milestones.map((milestone) => (
                  <button
                    key={milestone.id}
                    type="button"
                    onClick={() =>
                      setSelectedMilestone(
                        selectedMilestone === milestone.id ? "" : milestone.id
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm transition-all press-effect ${
                      selectedMilestone === milestone.id
                        ? "bg-[#38BDF8] text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {milestone.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="w-full h-12 rounded-xl gradient-peach text-white font-medium press-effect"
          >
            {isSubmitting ? "添加中..." : "添加任务"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
