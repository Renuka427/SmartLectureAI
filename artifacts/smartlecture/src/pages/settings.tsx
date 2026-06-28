import { useTheme } from "@/components/theme-provider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Bell, Monitor } from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12 pt-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-6 border-b border-border pb-4">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-muted-foreground">Select your preferred color theme.</p>
            </div>
            <div className="flex bg-muted rounded-lg p-1 border border-border">
              <button 
                onClick={() => setTheme("light")}
                className={`p-2 rounded-md flex items-center justify-center transition-colors ${theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Sun size={18} />
              </button>
              <button 
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-md flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Moon size={18} />
              </button>
              <button 
                onClick={() => setTheme("system")}
                className={`p-2 rounded-md flex items-center justify-center transition-colors ${theme === 'system' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Monitor size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-6 border-b border-border pb-4">Notifications</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1 pr-4">
                <Label className="text-base flex items-center gap-2"><Bell size={16} className="text-primary"/> Study Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded when you have flashcards due.</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1 pr-4">
                <Label className="text-base">Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">Receive an email with your study progress.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
