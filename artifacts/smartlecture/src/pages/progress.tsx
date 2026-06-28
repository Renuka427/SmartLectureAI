import { BarChart as BarChartIcon, Flame, Target, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ProgressPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Study Progress</h1>
        <p className="text-muted-foreground">Track your learning journey and analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
          <div className="bg-orange-500/10 text-orange-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Flame size={32} />
          </div>
          <h3 className="text-3xl font-bold">12 Days</h3>
          <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
          <div className="bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Target size={32} />
          </div>
          <h3 className="text-3xl font-bold">2,450 XP</h3>
          <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
          <div className="bg-chart-2/10 text-chart-2 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-3xl font-bold">48 Hrs</h3>
          <p className="text-sm font-medium text-muted-foreground">Study Time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <BarChartIcon size={20} className="text-primary" /> Subject Mastery
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Biology</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" style={{ '--tw-progress-color': 'hsl(152 68% 45%)' } as React.CSSProperties} />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Physics</span>
                <span>62%</span>
              </div>
              <Progress value={62} className="h-2" style={{ '--tw-progress-color': 'hsl(245 70% 55%)' } as React.CSSProperties} />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>History</span>
                <span>40%</span>
              </div>
              <Progress value={40} className="h-2" style={{ '--tw-progress-color': 'hsl(45 93% 47%)' } as React.CSSProperties} />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-2 h-10 rounded-full bg-chart-2 shrink-0"></div>
              <div>
                <p className="font-semibold text-sm">Mastered Cellular Biology Quiz</p>
                <p className="text-xs text-muted-foreground">Earned 150 XP • 2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-10 rounded-full bg-primary shrink-0"></div>
              <div>
                <p className="font-semibold text-sm">Processed new Physics Lecture</p>
                <p className="text-xs text-muted-foreground">Generated 30 flashcards • Yesterday</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-10 rounded-full bg-chart-3 shrink-0"></div>
              <div>
                <p className="font-semibold text-sm">Reviewed 50 History Flashcards</p>
                <p className="text-xs text-muted-foreground">Maintained 12 day streak • Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
