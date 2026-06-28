import { useState } from "react";
import { Search as SearchIcon, BookOpen, Layers, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

export default function Search() {
  const [query, setQuery] = useState("");

  const mockResults = [
    { type: 'lecture', title: "Cellular Respiration", subject: "Biology", subjectColor: "hsl(152 68% 45%)", id: 1 },
    { type: 'flashcard', title: "ATP Production Steps", subject: "Biology", subjectColor: "hsl(152 68% 45%)", id: 1 },
    { type: 'quiz', title: "Krebs Cycle Review", subject: "Biology", subjectColor: "hsl(152 68% 45%)", id: 1 },
    { type: 'lecture', title: "Thermodynamics 101", subject: "Physics", subjectColor: "hsl(245 70% 55%)", id: 2 },
  ];

  const filtered = query.length > 2 ? mockResults.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.subject.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">What are you looking for?</h1>
        <div className="relative max-w-xl mx-auto shadow-lg rounded-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lectures, concepts, flashcards..." 
            className="pl-12 py-8 text-lg rounded-2xl bg-card border-2 focus-visible:ring-primary"
            autoFocus
          />
        </div>
      </div>

      {query.length > 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-muted-foreground">Results for "{query}"</h2>
          
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((result, i) => (
                <Link key={i} href={`/${result.type}s/${result.id}`}>
                  <div className="bg-card hover:bg-muted/50 transition-colors p-4 rounded-xl border border-border shadow-sm flex items-center gap-4 cursor-pointer">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${result.subjectColor}15`, color: result.subjectColor }}>
                      {result.type === 'lecture' && <BookOpen size={20} />}
                      {result.type === 'flashcard' && <Layers size={20} />}
                      {result.type === 'quiz' && <HelpCircle size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{result.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{result.type}</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: result.subjectColor }}>{result.subject}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No results found. Try a different term.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
