import { Router, type IRouter } from "express";
import { db, chatMessagesTable, lecturesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ChatWithAssistantBody } from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_USER_ID = 1;

const SMART_RESPONSES: Record<string, string> = {
  default: "That's a great question! Based on the lecture content, I can help you understand this concept better. The key principle here is that understanding comes from breaking down complex ideas into manageable parts.",
  explain: "Let me explain this in simpler terms. The core idea revolves around the fundamental relationship between the concepts you've been studying. Think of it as building blocks — each concept supports the next.",
  summary: "Here's a quick summary of the key points: 1) The main concept introduced the fundamental framework. 2) The supporting theories provide evidence. 3) Practical applications demonstrate real-world relevance. 4) The conclusion ties everything together.",
  quiz: "Great study strategy! Here's a practice question: What is the primary relationship between the main concepts covered in this lecture? Consider how each element interacts with the others.",
  help: "I'm here to help you study more effectively! You can ask me to explain concepts, generate practice questions, summarize lecture content, or create a study plan. What would you like to focus on?",
};

function generateResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("explain") || lower.includes("what is") || lower.includes("how does")) {
    return SMART_RESPONSES.explain!;
  }
  if (lower.includes("summary") || lower.includes("summarize")) {
    return SMART_RESPONSES.summary!;
  }
  if (lower.includes("quiz") || lower.includes("question") || lower.includes("test")) {
    return SMART_RESPONSES.quiz!;
  }
  if (lower.includes("help")) {
    return SMART_RESPONSES.help!;
  }
  return SMART_RESPONSES.default!;
}

router.post("/assistant/chat", async (req, res): Promise<void> => {
  const parsed = ChatWithAssistantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(chatMessagesTable).values({
    userId: DEFAULT_USER_ID,
    lectureId: parsed.data.lectureId,
    role: "user",
    content: parsed.data.message,
  });

  const responseContent = generateResponse(parsed.data.message);

  const [assistantMsg] = await db
    .insert(chatMessagesTable)
    .values({
      userId: DEFAULT_USER_ID,
      lectureId: parsed.data.lectureId,
      role: "assistant",
      content: responseContent,
    })
    .returning();

  res.json({
    id: assistantMsg!.id,
    role: assistantMsg!.role,
    content: assistantMsg!.content,
    createdAt: assistantMsg!.createdAt,
  });
});

router.get("/assistant/history", async (req, res): Promise<void> => {
  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.userId, DEFAULT_USER_ID))
    .orderBy(chatMessagesTable.createdAt)
    .limit(50);

  res.json(
    messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }))
  );
});

export default router;
