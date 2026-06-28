import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function FlashcardStudy() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Mock data
  const deck = {
    title: "Cellular Biology Core Concepts",
    subjectColor: "hsl(152 68% 45%)",
    cards: [
      { id: 1, front: "What is the powerhouse of the cell?", back: "Mitochondria" },
      { id: 2, front: "What organelle is responsible for protein synthesis?", back: "Ribosome" },
      { id: 3, front: "What is the process of cell division called?", back: "Mitosis" },
      { id: 4, front: "Which structure regulates what enters and exits the cell?", back: "Cell Membrane" },
      { id: 5, front: "What contains the genetic material in a eukaryotic cell?", back: "Nucleus" },
    ]
  };

  const currentCard = deck.cards[currentIndex];
  const progress = ((currentIndex) / deck.cards.length) * 100;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleRating = (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
    const isCorrect = difficulty === 'good' || difficulty === 'easy';
    setSessionStats(prev => ({ 
      reviewed: prev.reviewed + 1, 
      correct: prev.correct + (isCorrect ? 1 : 0) 
    }));

    if (currentIndex < deck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-chart-2/20 text-chart-2 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        <h1 className="font-handwriting text-5xl font-bold mb-4 text-foreground">Session Complete!</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          You reviewed {sessionStats.reviewed} cards with a {Math.round((sessionStats.correct / sessionStats.reviewed) * 100)}% success rate.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" size="lg" onClick={() => setLocation("/flashcards")}>
            Back to Decks
          </Button>
          <Button 
            size="lg" 
            className="bg-chart-2 hover:bg-chart-2/90 text-white"
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setSessionStats({ reviewed: 0, correct: 0 });
              setIsFinished(false);
            }}
          >
            <RotateCcw className="mr-2" size={18} /> Review Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/flashcards")}>
          <X size={24} />
        </Button>
        <div className="flex-1 mx-8">
          <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2 px-1 uppercase tracking-widest">
            <span>{deck.title}</span>
            <span>{currentIndex + 1} / {deck.cards.length}</span>
          </div>
          <Progress value={progress} className="h-2" style={{ '--tw-progress-color': deck.subjectColor } as React.CSSProperties} />
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Card Area */}
      <div className="flex-1 relative perspective-1000 flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? "-back" : "-front")}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-[60vh] max-h-[500px] cursor-pointer"
            onClick={handleFlip}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className={`w-full h-full bg-card rounded-3xl border-2 border-border shadow-xl p-8 md:p-12 flex flex-col items-center justify-center text-center relative
              ${!isFlipped ? 'sticky-note-yellow bg-opacity-30 border-none' : ''}`}
            >
              {!isFlipped ? (
                <>
                  <span className="absolute top-6 left-6 text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-50">Front</span>
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight">{currentCard.front}</h2>
                  <p className="absolute bottom-6 text-sm text-muted-foreground animate-pulse">Tap to flip</p>
                </>
              ) : (
                <>
                  <span className="absolute top-6 left-6 text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-50">Back</span>
                  <h2 className="text-2xl md:text-3xl font-medium leading-relaxed">{currentCard.back}</h2>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className={`mt-8 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="grid grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-16 flex flex-col gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleRating('again')}
          >
            <span className="font-bold">Again</span>
            <span className="text-[10px] opacity-80">&lt; 1m</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex flex-col gap-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
            onClick={() => handleRating('hard')}
          >
            <span className="font-bold">Hard</span>
            <span className="text-[10px] opacity-80">6m</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex flex-col gap-1 border-chart-2 text-chart-2 hover:bg-chart-2 hover:text-white"
            onClick={() => handleRating('good')}
          >
            <span className="font-bold">Good</span>
            <span className="text-[10px] opacity-80">10m</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex flex-col gap-1 border-chart-3 text-chart-3 hover:bg-chart-3 hover:text-white"
            onClick={() => handleRating('easy')}
          >
            <span className="font-bold">Easy</span>
            <span className="text-[10px] opacity-80">4d</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
