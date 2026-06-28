import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Assistant() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Hi there! I'm your AI study assistant. What topic would you like to review today?", createdAt: new Date().toISOString() }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), role: "user", content: input, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      const aiMsg = { 
        id: Date.now() + 1, 
        role: "assistant", 
        content: `I've analyzed your recent notes on "${userMsg.content}". Would you like me to generate a practice quiz on this topic, or explain the key concepts in simpler terms?`, 
        createdAt: new Date().toISOString() 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const prompts = [
    "Explain mitosis simply",
    "Quiz me on French History",
    "Summarize my last lecture"
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-sm relative">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 text-primary p-2 rounded-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold leading-tight">AI Study Assistant</h2>
            <p className="text-xs text-muted-foreground">Always ready to help</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <BookOpen size={14} /> Context: All Lectures
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-chart-2/20 text-chart-2'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
              <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts (if chat is short) */}
      {messages.length < 3 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 justify-center">
          {prompts.map(p => (
            <button 
              key={p} 
              onClick={() => setInput(p)}
              className="text-xs bg-background border border-border px-3 py-1.5 rounded-full hover:bg-muted transition-colors font-medium"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border">
        <form onSubmit={handleSend} className="relative flex items-center">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your lectures..."
            className="pr-12 py-6 rounded-xl bg-muted/50 border-border focus-visible:ring-primary/50 text-base"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 h-10 w-10 rounded-lg"
            disabled={!input.trim()}
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
