import { Router, type IRouter } from "express";
import { db, usersTable, lecturesTable, flashcardDecksTable, flashcardsTable, quizzesTable, activityTable } from "@workspace/db";
import { eq, desc, count, avg } from "drizzle-orm";
import { UpdateProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_USER_ID = 1;

router.get("/user/profile", async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    level: user.level,
    xp: user.xp,
    streak: user.streak,
    joinedAt: user.createdAt,
  });
});

router.patch("/user/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
  if (parsed.data.avatar !== undefined) updates.avatar = parsed.data.avatar;

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, DEFAULT_USER_ID))
    .returning();

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    level: user.level,
    xp: user.xp,
    streak: user.streak,
    joinedAt: user.createdAt,
  });
});

router.get("/user/stats", async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [lectureCount] = await db
    .select({ count: count() })
    .from(lecturesTable)
    .where(eq(lecturesTable.userId, DEFAULT_USER_ID));

  const [reviewedCount] = await db
    .select({ count: count() })
    .from(flashcardsTable)
    .innerJoin(flashcardDecksTable, eq(flashcardsTable.deckId, flashcardDecksTable.id))
    .where(eq(flashcardDecksTable.userId, DEFAULT_USER_ID));

  const [quizCount] = await db
    .select({ count: count() })
    .from(quizzesTable)
    .where(eq(quizzesTable.userId, DEFAULT_USER_ID));

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyActivity = days.map((day, i) => ({
    day,
    minutes: [45, 30, 60, 20, 75, 90, 50][i] ?? 30,
    xp: [90, 60, 120, 40, 150, 180, 100][i] ?? 60,
  }));

  const xpToNextLevel = user.level * 500;

  res.json({
    xp: user.xp,
    level: user.level,
    xpToNextLevel,
    streak: user.streak,
    totalStudyMinutes: 370,
    lecturesCount: lectureCount?.count ?? 0,
    flashcardsReviewed: reviewedCount?.count ?? 0,
    quizzesCompleted: quizCount?.count ?? 0,
    weeklyActivity,
  });
});

router.get("/user/progress", async (req, res): Promise<void> => {
  const recentActivity = await db
    .select()
    .from(activityTable)
    .where(eq(activityTable.userId, DEFAULT_USER_ID))
    .orderBy(desc(activityTable.createdAt))
    .limit(10);

  const subjectProgress = [
    { subject: "Biology", color: "#10b981", lecturesTotal: 8, lecturesCompleted: 5, avgQuizScore: 82 },
    { subject: "Physics", color: "#6366f1", lecturesTotal: 6, lecturesCompleted: 4, avgQuizScore: 75 },
    { subject: "History", color: "#f59e0b", lecturesTotal: 5, lecturesCompleted: 5, avgQuizScore: 91 },
    { subject: "Chemistry", color: "#f43f5e", lecturesTotal: 7, lecturesCompleted: 3, avgQuizScore: 68 },
    { subject: "Mathematics", color: "#8b5cf6", lecturesTotal: 10, lecturesCompleted: 7, avgQuizScore: 88 },
  ];

  const monthlyStudy = [
    { month: "Jan", hours: 12 },
    { month: "Feb", hours: 18 },
    { month: "Mar", hours: 22 },
    { month: "Apr", hours: 15 },
    { month: "May", hours: 28 },
    { month: "Jun", hours: 31 },
  ];

  res.json({
    subjectProgress,
    monthlyStudy,
    recentActivity: recentActivity.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      xpEarned: a.xpEarned,
      createdAt: a.createdAt,
    })),
  });
});

export default router;
