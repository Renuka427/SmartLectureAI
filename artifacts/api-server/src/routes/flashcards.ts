import { Router, type IRouter } from "express";
import { db, flashcardDecksTable, flashcardsTable, usersTable, activityTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";
import { CreateFlashcardDeckBody, AddFlashcardBody, RecordFlashcardStudyBody } from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_USER_ID = 1;

async function getDeckWithCounts(deckId: number) {
  const [deck] = await db.select().from(flashcardDecksTable).where(eq(flashcardDecksTable.id, deckId));
  if (!deck) return null;

  const cards = await db.select().from(flashcardsTable).where(eq(flashcardsTable.deckId, deckId));
  const masteredCount = cards.filter((c) => c.mastered).length;
  const dueCount = cards.filter((c) => !c.mastered).length;

  return {
    id: deck.id,
    title: deck.title,
    subject: deck.subject,
    subjectColor: deck.subjectColor,
    cardCount: cards.length,
    masteredCount,
    dueCount,
    lastStudied: deck.lastStudied,
    createdAt: deck.createdAt,
  };
}

router.get("/flashcard-decks", async (req, res): Promise<void> => {
  const decks = await db
    .select()
    .from(flashcardDecksTable)
    .where(eq(flashcardDecksTable.userId, DEFAULT_USER_ID));

  const result = await Promise.all(decks.map((d) => getDeckWithCounts(d.id)));
  res.json(result.filter(Boolean));
});

router.post("/flashcard-decks", async (req, res): Promise<void> => {
  const parsed = CreateFlashcardDeckBody.safeParse(req.body);
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

  const [deck] = await db
    .insert(flashcardDecksTable)
    .values({
      userId: DEFAULT_USER_ID,
      lectureId: parsed.data.lectureId,
      title: parsed.data.title,
      subject: parsed.data.subject,
      subjectColor: color,
    })
    .returning();

  const summary = await getDeckWithCounts(deck!.id);
  res.status(201).json(summary);
});

router.get("/flashcard-decks/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const summary = await getDeckWithCounts(id);
  if (!summary) {
    res.status(404).json({ error: "Deck not found" });
    return;
  }

  const cards = await db.select().from(flashcardsTable).where(eq(flashcardsTable.deckId, id));

  res.json({
    ...summary,
    cards: cards.map((c) => ({
      id: c.id,
      deckId: c.deckId,
      front: c.front,
      back: c.back,
      mastered: c.mastered,
      difficulty: c.difficulty,
    })),
  });
});

router.post("/flashcard-decks/:id/cards", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = AddFlashcardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [card] = await db
    .insert(flashcardsTable)
    .values({ deckId: id, front: parsed.data.front, back: parsed.data.back })
    .returning();

  res.status(201).json({
    id: card!.id,
    deckId: card!.deckId,
    front: card!.front,
    back: card!.back,
    mastered: card!.mastered,
    difficulty: card!.difficulty,
  });
});

router.post("/flashcard-decks/:id/study", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = RecordFlashcardStudyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const accuracy = parsed.data.cardsReviewed > 0 ? parsed.data.correctCount / parsed.data.cardsReviewed : 0;
  const xpEarned = Math.round(parsed.data.cardsReviewed * 10 * (1 + accuracy));

  await db.update(flashcardDecksTable).set({ lastStudied: new Date() }).where(eq(flashcardDecksTable.id, id));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID));
  const newXp = (user?.xp ?? 0) + xpEarned;
  const newLevel = Math.floor(newXp / 500) + 1;
  const newStreak = (user?.streak ?? 0) + 1;

  await db.update(usersTable).set({ xp: newXp, level: newLevel, streak: newStreak }).where(eq(usersTable.id, DEFAULT_USER_ID));

  await db.insert(activityTable).values({
    userId: DEFAULT_USER_ID,
    type: "flashcard",
    title: "Flashcard Study Session",
    description: `Reviewed ${parsed.data.cardsReviewed} cards with ${Math.round(accuracy * 100)}% accuracy`,
    xpEarned,
  });

  res.json({ xpEarned, newTotalXp: newXp, newLevel, streakUpdated: true, newStreak });
});

export default router;
