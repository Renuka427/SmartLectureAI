import { Router, type IRouter } from "express";
import { db, quizzesTable, questionsTable, usersTable, activityTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateQuizBody, SubmitQuizAttemptBody } from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_USER_ID = 1;

function formatQuiz(q: typeof quizzesTable.$inferSelect, questionCount: number) {
  return {
    id: q.id,
    title: q.title,
    subject: q.subject,
    subjectColor: q.subjectColor,
    questionCount,
    bestScore: q.bestScore,
    attempts: q.attempts,
    createdAt: q.createdAt,
  };
}

router.get("/quizzes", async (req, res): Promise<void> => {
  const quizzes = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.userId, DEFAULT_USER_ID))
    .orderBy(desc(quizzesTable.createdAt));

  const result = await Promise.all(
    quizzes.map(async (q) => {
      const questions = await db.select().from(questionsTable).where(eq(questionsTable.quizId, q.id));
      return formatQuiz(q, questions.length);
    })
  );

  res.json(result);
});

router.post("/quizzes", async (req, res): Promise<void> => {
  const parsed = CreateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const SUBJECT_COLORS: Record<string, string> = {
    Biology: "#10b981",
    Physics: "#6366f1",
    History: "#f59e0b",
    Chemistry: "#f43f5e",
    Mathematics: "#8b5cf6",
    "Computer Science": "#06b6d4",
    Literature: "#f97316",
    Economics: "#14b8a6",
  };

  const color = SUBJECT_COLORS[parsed.data.subject] ?? "#6366f1";

  const [quiz] = await db
    .insert(quizzesTable)
    .values({
      userId: DEFAULT_USER_ID,
      lectureId: parsed.data.lectureId,
      title: parsed.data.title,
      subject: parsed.data.subject,
      subjectColor: color,
    })
    .returning();

  res.status(201).json(formatQuiz(quiz!, 0));
});

router.get("/quizzes/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const questions = await db.select().from(questionsTable).where(eq(questionsTable.quizId, id));

  res.json({
    ...formatQuiz(quiz, questions.length),
    questions: questions.map((q) => ({
      id: q.id,
      quizId: q.quizId,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
  });
});

router.post("/quizzes/:id/attempt", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = SubmitQuizAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const questions = await db.select().from(questionsTable).where(eq(questionsTable.quizId, id));

  const questionResults = questions.map((q, i) => {
    const selected = parsed.data.answers[i] ?? -1;
    return {
      questionId: q.id,
      correct: selected === q.correctIndex,
      selectedIndex: selected,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    };
  });

  const correctCount = questionResults.filter((r) => r.correct).length;
  const totalCount = questions.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const passed = score >= 70;
  const xpEarned = Math.round(correctCount * 20 + (passed ? 50 : 0));

  const newBest = quiz.bestScore === null || score > quiz.bestScore ? score : quiz.bestScore;
  await db
    .update(quizzesTable)
    .set({ bestScore: newBest, attempts: quiz.attempts + 1 })
    .where(eq(quizzesTable.id, id));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID));
  const newXp = (user?.xp ?? 0) + xpEarned;
  const newLevel = Math.floor(newXp / 500) + 1;
  await db.update(usersTable).set({ xp: newXp, level: newLevel }).where(eq(usersTable.id, DEFAULT_USER_ID));

  await db.insert(activityTable).values({
    userId: DEFAULT_USER_ID,
    type: "quiz",
    title: `Quiz: ${quiz.title}`,
    description: `Scored ${score}% — ${correctCount}/${totalCount} correct`,
    xpEarned,
  });

  res.json({ score, correctCount, totalCount, xpEarned, passed, questionResults });
});

export default router;
