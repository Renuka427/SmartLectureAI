import { Router, type IRouter } from "express";
import { db, lecturesTable, flashcardDecksTable, quizzesTable, flashcardsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const DEFAULT_USER_ID = 1;

router.get("/search", async (req, res): Promise<void> => {
  const q = (req.query.q as string | undefined) ?? "";
  const lower = q.toLowerCase();

  const [lectures, decks, quizzes] = await Promise.all([
    db.select().from(lecturesTable).where(eq(lecturesTable.userId, DEFAULT_USER_ID)),
    db.select().from(flashcardDecksTable).where(eq(flashcardDecksTable.userId, DEFAULT_USER_ID)),
    db.select().from(quizzesTable).where(eq(quizzesTable.userId, DEFAULT_USER_ID)),
  ]);

  const matchedLectures = lectures
    .filter(
      (l) =>
        l.title.toLowerCase().includes(lower) ||
        l.subject.toLowerCase().includes(lower) ||
        l.tags.some((t) => t.toLowerCase().includes(lower))
    )
    .map((l) => ({
      id: l.id,
      title: l.title,
      subject: l.subject,
      subjectColor: l.subjectColor,
      duration: l.duration,
      status: l.status,
      transcript: l.transcript,
      thumbnailUrl: l.thumbnailUrl,
      tags: l.tags,
      viewCount: l.viewCount,
      createdAt: l.createdAt,
    }));

  const matchedDecks = await Promise.all(
    decks
      .filter((d) => d.title.toLowerCase().includes(lower) || d.subject.toLowerCase().includes(lower))
      .map(async (d) => {
        const cards = await db.select().from(flashcardsTable).where(eq(flashcardsTable.deckId, d.id));
        const masteredCount = cards.filter((c) => c.mastered).length;
        return {
          id: d.id,
          title: d.title,
          subject: d.subject,
          subjectColor: d.subjectColor,
          cardCount: cards.length,
          masteredCount,
          dueCount: cards.length - masteredCount,
          lastStudied: d.lastStudied,
          createdAt: d.createdAt,
        };
      })
  );

  const matchedQuizzes = quizzes
    .filter((q) => q.title.toLowerCase().includes(lower) || q.subject.toLowerCase().includes(lower))
    .map((q) => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      subjectColor: q.subjectColor,
      questionCount: 0,
      bestScore: q.bestScore,
      attempts: q.attempts,
      createdAt: q.createdAt,
    }));

  res.json({
    lectures: matchedLectures,
    flashcardDecks: matchedDecks,
    quizzes: matchedQuizzes,
  });
});

export default router;
