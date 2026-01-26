"use client";

import { Home, Sparkles, Plus, Target, BookOpen } from "lucide-react";

interface FloatingDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

const tabs = [
  { id: "dashboard", icon: Home, label: "首页" },
  { id: "vision", icon: Sparkles, label: "愿景" },
  { id: "add", icon: Plus, label: "添加", isCenter: true },
  { id: "milestones", icon: Target, label: "里程碑" },
  { id: "journal", icon: BookOpen, label: "日记" },
];

export function FloatingDock({
  activeTab,
  onTabChange,
  onAddClick,
}: FloatingDockProps) {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-md">
      <div className="floating-dock h-16 rounded-[32px] flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={onAddClick}
                className="w-14 h-14 -mt-6 rounded-full gradient-peach flex items-center justify-center shadow-lg press-effect hover:scale-105 transition-transform"
                aria-label={tab.label}
              >
                <Icon className="w-6 h-6 text-white" />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all press-effect ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
