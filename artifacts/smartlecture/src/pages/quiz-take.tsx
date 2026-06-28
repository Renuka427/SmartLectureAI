import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function QuizTake() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Mock data
  const quiz = {
    title: "Cellular Biology Mastery",
    subjectColor: "hsl(152 68% 45%)",
    questions: [
      { id: 1, text: "Which organelle is known as the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"], correctIndex: 2, explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions." },
      { id: 2, text: "What is the main function of ribosomes?", options: ["Energy production", "Protein synthesis", "Waste disposal", "DNA storage"], correctIndex: 1, explanation: "Ribosomes are macromolecular machines that perform biological protein synthesis." },
      { id: 3, text: "Which structure is found in plant cells but NOT animal cells?", options: ["Cell membrane", "Mitochondria", "Cell wall", "Nucleus"], correctIndex: 2, explanation: "Plant cells have a rigid cell wall outside their plasma membrane, which animal cells lack." },
    ]
  };

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex) / quiz.questions.length) * 100;

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswered(true);
    if (parseInt(selectedAnswer) === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= 70;
    
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500 max-w-lg mx-auto">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 relative ${passed ? 'bg-chart-2/20 text-chart-2' : 'bg-muted text-muted-foreground'}`}>
          <Trophy size={48} className={passed ? 'text-chart-2' : 'text-muted-foreground'} />
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute -bottom-4 -right-4 bg-primary text-white font-bold text-xl px-4 py-2 rounded-full shadow-lg transform rotate-6 font-handwriting"
          >
            +{passed ? 150 : 50} XP
          </motion.div>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">
          {passed ? "Excellent Work!" : "Keep Practicing"}
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          You scored {percentage}% on {quiz.title}
        </p>
        
        <div className="w-full bg-card rounded-2xl border border-border p-6 mb-8 text-left">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Final Score</span>
            <span className="font-bold text-xl">{score} / {quiz.questions.length}</span>
          </div>
          <Progress value={percentage} className="h-3 mb-2" style={{ '--tw-progress-color': passed ? 'var(--color-chart-2)' : 'var(--color-primary)' } as React.CSSProperties} />
        </div>
        
        <Button size="lg" className="w-full h-14 text-lg" onClick={() => setLocation("/quizzes")}>
          Return to Quizzes
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/quizzes")}>
          <X size={24} />
        </Button>
        <div className="flex-1 mx-8">
          <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2 px-1 uppercase tracking-widest">
            <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
          </div>
          <Progress value={progress} className="h-2" style={{ '--tw-progress-color': quiz.subjectColor } as React.CSSProperties} />
        </div>
        <div className="w-10"></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-3xl border border-border shadow-sm p-6 md:p-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-tight">
            {currentQuestion.text}
          </h2>

          <RadioGroup 
            value={selectedAnswer || ""} 
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx.toString();
              const isCorrect = idx === currentQuestion.correctIndex;
              
              let stateClass = "border-border hover:bg-muted/50 cursor-pointer";
              if (isAnswered) {
                if (isCorrect) stateClass = "border-chart-3 bg-chart-3/10";
                else if (isSelected) stateClass = "border-destructive bg-destructive/10";
                else stateClass = "border-border opacity-50";
              } else if (isSelected) {
                stateClass = "border-primary bg-primary/5 ring-1 ring-primary";
              }

              return (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={idx.toString()} id={`r${idx}`} className="hidden" />
                  <Label 
                    htmlFor={`r${idx}`} 
                    className={`flex items-center justify-between w-full p-5 rounded-xl border-2 transition-all ${stateClass}`}
                  >
                    <span className="text-lg font-medium">{option}</span>
                    {isAnswered && isCorrect && <CheckCircle className="text-chart-3" size={24} />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="text-destructive" size={24} />}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-8 p-5 rounded-xl ${parseInt(selectedAnswer!) === currentQuestion.correctIndex ? 'bg-chart-3/10 text-chart-3-foreground' : 'bg-muted text-foreground'}`}
            >
              <h4 className="font-bold mb-2 flex items-center gap-2">
                {parseInt(selectedAnswer!) === currentQuestion.correctIndex ? "Correct!" : "Incorrect"}
              </h4>
              <p className="opacity-90">{currentQuestion.explanation}</p>
            </motion.div>
          )}

          <div className="mt-10 flex justify-end">
            {!isAnswered ? (
              <Button 
                size="lg" 
                className="w-full md:w-auto h-14 px-8 text-lg"
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
              >
                Check Answer
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="w-full md:w-auto h-14 px-8 text-lg bg-primary hover:bg-primary/90"
                onClick={handleNext}
              >
                {currentIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                <ArrowRight className="ml-2" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
