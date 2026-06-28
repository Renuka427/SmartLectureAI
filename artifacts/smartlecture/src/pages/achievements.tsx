import { Award, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Achievements() {
  const achievements = [
    { title: "First Steps", desc: "Upload your first lecture", icon: "🌱", unlocked: true, xp: 50 },
    { title: "Quiz Master", desc: "Score 100% on 5 quizzes", icon: "🎯", unlocked: true, xp: 200 },
    { title: "Week Warrior", desc: "Maintain a 7-day streak", icon: "🔥", unlocked: true, xp: 300 },
    { title: "Library Builder", desc: "Process 10 lectures", icon: "📚", unlocked: false, progress: 4, max: 10, xp: 500 },
    { title: "Memory Champ", desc: "Master 500 flashcards", icon: "🧠", unlocked: false, progress: 342, max: 500, xp: 1000 },
    { title: "Night Owl", desc: "Study after midnight", icon: "🦉", unlocked: false, progress: 0, max: 1, xp: 150 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Achievements</h1>
        <p className="text-muted-foreground">Earn badges and XP by completing learning milestones.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((a, i) => (
          <div key={i} className={`bg-card p-6 rounded-2xl border ${a.unlocked ? 'border-chart-2/50 shadow-sm' : 'border-border opacity-75'} relative overflow-hidden flex flex-col`}>
            {a.unlocked && <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 to-transparent pointer-events-none"></div>}
            
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${a.unlocked ? 'bg-chart-2/20' : 'bg-muted grayscale'}`}>
                {a.icon}
              </div>
              <div className="bg-muted px-2 py-1 rounded-md text-xs font-bold text-muted-foreground">
                {a.xp} XP
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              {a.title} {!a.unlocked && <Lock size={14} className="text-muted-foreground" />}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{a.desc}</p>
            
            {!a.unlocked && a.max && (
              <div className="mt-auto">
                <div className="flex justify-between text-xs font-medium mb-2 text-muted-foreground">
                  <span>Progress</span>
                  <span>{a.progress} / {a.max}</span>
                </div>
                <Progress value={(a.progress! / a.max) * 100} className="h-2" />
              </div>
            )}
            
            {a.unlocked && (
              <div className="mt-auto pt-4 border-t border-border/50 text-xs font-bold text-chart-2 uppercase tracking-wider">
                Unlocked
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
