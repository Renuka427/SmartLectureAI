import { useParams } from "wouter";
import { useGetLecture, useGetLectureSummary } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, BookOpen, Layers, HelpCircle, Network, FileText, ArrowLeft, Download } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function LectureDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  
  const { data: lecture, isLoading: lectureLoading } = useGetLecture(id, { 
    query: { enabled: !!id, queryKey: ['lecture', id] } 
  });
  
  const { data: summary, isLoading: summaryLoading } = useGetLectureSummary(id, {
    query: { enabled: !!id, queryKey: ['lecture-summary', id] }
  });

  // Mock data
  const mockLecture = {
    id,
    title: "Introduction to Cellular Biology",
    subject: "Biology",
    subjectColor: "hsl(152 68% 45%)",
    duration: 45,
    status: "ready",
    tags: ["cells", "mitosis"],
    createdAt: "2023-10-12T00:00:00Z",
    flashcardDeckId: 101,
    quizId: 201
  };

  const mockSummary = {
    lectureId: id,
    summary: "This lecture covers the fundamental building blocks of life: cells. We explore the differences between prokaryotic and eukaryotic cells, cell organelles and their functions, and the basics of cellular division (mitosis).",
    keyPoints: [
      "Cells are the basic unit of life.",
      "Prokaryotes lack a nucleus and membrane-bound organelles.",
      "Eukaryotes have a defined nucleus and complex organelles like mitochondria and ER.",
      "Mitosis is the process of cell division resulting in two identical daughter cells."
    ],
    concepts: [
      { term: "Nucleus", definition: "The central organelle of a eukaryotic cell, containing most of the cell's DNA." },
      { term: "Mitochondria", definition: "Organelles that generate most of the cell's supply of ATP, used as a source of chemical energy." },
      { term: "Ribosome", definition: "Macromolecular machines found within all living cells that perform biological protein synthesis." }
    ]
  };

  const l = lecture || mockLecture;
  const s = summary || mockSummary;
  const isLoading = lectureLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/lectures" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Lectures
        </Link>
      </div>

      <div className="relative">
        <div className="absolute -left-6 top-0 w-2 h-full rounded-r-md" style={{ backgroundColor: l.subjectColor }}></div>
        
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wider" style={{ backgroundColor: `${l.subjectColor}20`, color: l.subjectColor }}>
            {l.subject}
          </span>
          <span className="text-xs text-muted-foreground flex items-center bg-muted px-2 py-1 rounded-md">
            <Clock size={12} className="mr-1" /> {l.duration} mins
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{l.title}</h1>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {l.tags?.map(tag => (
            <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded-md text-secondary-foreground">#{tag}</span>
          ))}
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-card border border-border rounded-xl flex-wrap">
          <TabsTrigger value="summary" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <FileText size={16} /> Summary
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <Layers size={16} /> Flashcards
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <HelpCircle size={16} /> Quiz
          </TabsTrigger>
          <TabsTrigger value="mindmap" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <Network size={16} /> Mind Map
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <TabsContent value="summary" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h3 className="font-handwriting text-2xl font-bold mb-4 text-primary">Overview</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">{s.summary}</p>
            </section>

            <section>
              <h3 className="font-handwriting text-2xl font-bold mb-4 text-primary">Key Takeaways</h3>
              <ul className="space-y-3">
                {s.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="mt-1 bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="font-handwriting text-2xl font-bold mb-4 text-primary">Core Concepts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {s.concepts.map((concept, i) => (
                  <div key={i} className="bg-muted p-4 rounded-xl border border-border/50">
                    <h4 className="font-bold mb-1" style={{ color: l.subjectColor }}>{concept.term}</h4>
                    <p className="text-sm text-muted-foreground">{concept.definition}</p>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="flashcards" className="m-0 flex flex-col items-center justify-center py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-chart-2/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <Layers size={32} className="text-chart-2" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Generated Flashcards</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              AI has generated 24 flashcards based on this lecture. Master these concepts using spaced repetition.
            </p>
            <Link href={l.flashcardDeckId ? `/flashcards/${l.flashcardDeckId}` : `/flashcards`}>
              <Button size="lg" className="bg-chart-2 hover:bg-chart-2/90 text-white border-none">
                Start Studying
              </Button>
            </Link>
          </TabsContent>

          <TabsContent value="quiz" className="m-0 flex flex-col items-center justify-center py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-chart-3/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <HelpCircle size={32} className="text-chart-3" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Test Your Knowledge</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              Take a 10-question multiple choice quiz to verify your understanding of the material.
            </p>
            <Link href={l.quizId ? `/quizzes/${l.quizId}` : `/quizzes`}>
              <Button size="lg" className="bg-chart-3 hover:bg-chart-3/90 text-white border-none">
                Take Quiz
              </Button>
            </Link>
          </TabsContent>

          <TabsContent value="mindmap" className="m-0 py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-primary/5 border border-primary/20 rounded-xl h-[400px] flex items-center justify-center flex-col">
               <Network size={48} className="text-primary mb-4 opacity-50" />
               <p className="text-muted-foreground font-medium">Interactive Mind Map</p>
               <p className="text-xs text-muted-foreground mt-2 max-w-xs px-4">Visual representation of concepts is ready. Zoom and pan to explore relationships.</p>
               <Button variant="outline" className="mt-6">Open Full Screen</Button>
             </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
