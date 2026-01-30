"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getVisions, addVision, updateVision, deleteVision } from "@/lib/store";
import type { Vision } from "@/lib/types";
import { Plus, Sprout, X, Sparkles, Home, Heart, Briefcase, Book, Edit3 } from "lucide-react";
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

const CATEGORIES = [
  { id: "life", label: "生活", icon: Home, color: "bg-[#4ADE80]" },
  { id: "love", label: "感情", icon: Heart, color: "bg-[#F87171]" },
  { id: "career", label: "事业", icon: Briefcase, color: "bg-[#FB923C]" },
  { id: "growth", label: "成长", icon: Book, color: "bg-[#A78BFA]" },
];

const PROMPTS = [
  "5年后你住在哪里？",
  "你的年收入是多少？",
  "你的理想伴侣是怎样的？",
  "你希望精通哪些技能？",
  "你的健康状态如何？",
];

export function VisionBoard() {
  const { user } = useAuth();
  const [visions, setVisions] = useState<Vision[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVision, setEditingVision] = useState<Vision | null>(null);
  const [newVision, setNewVision] = useState({
    title: "",
    description: "",
    category: "life",
  });

  useEffect(() => {
    if (user) {
      loadVisions();
    }
  }, [user]);

  const loadVisions = async () => {
    if (!user) return;
    setVisions(await getVisions(user.id));
  };

  const handleAddVision = async () => {
    if (!user || !newVision.title.trim()) return;

    await addVision(user.id, {
      title: newVision.title,
      description: newVision.description,
      category: newVision.category,
    });

    setNewVision({ title: "", description: "", category: "life" });
    setIsDialogOpen(false);
    loadVisions();
  };

  const handleEditVision = (vision: Vision) => {
    setEditingVision(vision);
    setNewVision({
      title: vision.title,
      description: vision.description || "",
      category: vision.category,
    });
    setIsDialogOpen(true);
  };

  const handleSaveVision = async () => {
    if (!user || !newVision.title.trim()) return;

    if (editingVision) {
      await updateVision(user.id, editingVision.id, {
        title: newVision.title,
        description: newVision.description,
        category: newVision.category,
      });
    } else {
      await addVision(user.id, {
        title: newVision.title,
        description: newVision.description,
        category: newVision.category,
      });
    }

    setNewVision({ title: "", description: "", category: "life" });
    setEditingVision(null);
    setIsDialogOpen(false);
    loadVisions();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVision(null);
    setNewVision({ title: "", description: "", category: "life" });
  };

  const handleDeleteVision = async (visionId: string) => {
    if (!user) return;
    await deleteVision(user.id, visionId);
    loadVisions();
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  };

  return (
    <div className="pb-24 px-4 md:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">愿景板</h1>
            <p className="text-muted-foreground text-sm mt-1">
              描绘你理想中的未来
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setEditingVision(null);
                  setNewVision({ title: "", description: "", category: "life" });
                  setIsDialogOpen(true);
                }}
                className="rounded-full gradient-dream text-white press-effect"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingVision ? "编辑愿景" : "种下一颗梦想种子"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Category Selection */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    分类
                  </label>
                  <div className="flex gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            setNewVision({ ...newVision, category: cat.id })
                          }
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all press-effect ${
                            newVision.category === cat.id
                              ? `${cat.color} text-white`
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt Suggestions */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    灵感提示
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PROMPTS.slice(0, 3).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() =>
                          setNewVision({ ...newVision, title: prompt })
                        }
                        className="px-3 py-1.5 rounded-full bg-secondary/50 text-xs text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    愿景标题
                  </label>
                  <Input
                    value={newVision.title}
                    onChange={(e) =>
                      setNewVision({ ...newVision, title: e.target.value })
                    }
                    placeholder="描述你的愿景..."
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    详细描述
                  </label>
                  <Textarea
                    value={newVision.description}
                    onChange={(e) =>
                      setNewVision({ ...newVision, description: e.target.value })
                    }
                    placeholder="详细描述你理想中的样子..."
                    className="rounded-xl min-h-24 resize-none"
                  />
                </div>

                <Button
                  onClick={handleSaveVision}
                  disabled={!newVision.title.trim()}
                  className="w-full rounded-xl gradient-peach text-white press-effect"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {editingVision ? "保存修改" : "种下种子"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Vision Grid */}
      {visions.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center mt-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
            <Sprout className="w-8 h-8 text-[#4ADE80]" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            种下你的第一颗梦想种子
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            愿景板帮助你可视化未来的目标，让抽象的梦想变得具体可触
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {visions.map((vision) => {
            const category = getCategoryInfo(vision.category);
            const Icon = category.icon;

            return (
              <div
                key={vision.id}
                className="glass-card rounded-2xl p-4 relative group"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleEditVision(vision)}
                    className="w-6 h-6 rounded-full bg-secondary/80 flex items-center justify-center press-effect"
                    aria-label="编辑愿景"
                  >
                    <Edit3 className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVision(vision.id)}
                    className="w-6 h-6 rounded-full bg-secondary/80 flex items-center justify-center press-effect"
                    aria-label="删除愿景"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>

                <div
                  className={`w-10 h-10 rounded-xl ${category.color} flex items-center justify-center mb-3`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
                  {vision.title}
                </h4>

                {vision.description && (
                  <p className="text-muted-foreground text-xs line-clamp-3">
                    {vision.description}
                  </p>
                )}

                <span className="inline-block mt-3 px-2 py-0.5 rounded-full bg-secondary text-[10px] text-secondary-foreground">
                  {category.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
