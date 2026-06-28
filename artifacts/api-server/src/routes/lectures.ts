import { Router, type IRouter } from "express";
import { db, lecturesTable, flashcardDecksTable, quizzesTable } from "@workspace/db";
import { eq, like, and, desc, ilike } from "drizzle-orm";
import { CreateLectureBody, UpdateLectureBody } from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_USER_ID = 1;

const SUBJECT_COLORS: Record<string, string> = {
  Biology: "#10b981",
  Physics: "#6366f1",
  History: "#f59e0b",
  Chemistry: "#f43f5e",
  Mathematics: "#8b5cf6",
  "Computer Science": "#06b6d4",
  Literature: "#f97316",
  Economics: "#14b8a6",
  default: "#6366f1",
};

function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.default!;
}

function formatLecture(l: typeof lecturesTable.$inferSelect) {
  return {
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
  };
}

router.get("/lectures", async (req, res): Promise<void> => {
  const { subject, search } = req.query as { subject?: string; search?: string };

  let query = db.select().from(lecturesTable).where(eq(lecturesTable.userId, DEFAULT_USER_ID)).$dynamic();

  if (subject) {
    query = query.where(and(eq(lecturesTable.userId, DEFAULT_USER_ID), eq(lecturesTable.subject, subject)));
  }

  const lectures = await query.orderBy(desc(lecturesTable.createdAt));

  let filtered = lectures;
  if (search) {
    const q = search.toLowerCase();
    filtered = lectures.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.subject.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json(filtered.map(formatLecture));
});

router.post("/lectures", async (req, res): Promise<void> => {
  const parsed = CreateLectureBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const color = getSubjectColor(parsed.data.subject);

  const [lecture] = await db
    .insert(lecturesTable)
    .values({
      userId: DEFAULT_USER_ID,
      title: parsed.data.title,
      subject: parsed.data.subject,
      subjectColor: color,
      tags: parsed.data.tags ?? [],
      transcript: parsed.data.transcript,
      status: "ready",
    })
    .returning();

  res.status(201).json(formatLecture(lecture!));
});

router.get("/lectures/recent", async (req, res): Promise<void> => {
  const lectures = await db
    .select()
    .from(lecturesTable)
    .where(eq(lecturesTable.userId, DEFAULT_USER_ID))
    .orderBy(desc(lecturesTable.createdAt))
    .limit(5);

  res.json(lectures.map(formatLecture));
});

router.get("/lectures/subjects", async (req, res): Promise<void> => {
  const lectures = await db
    .select()
    .from(lecturesTable)
    .where(eq(lecturesTable.userId, DEFAULT_USER_ID));

  const subjectMap = new Map<string, number>();
  for (const l of lectures) {
    subjectMap.set(l.subject, (subjectMap.get(l.subject) ?? 0) + 1);
  }

  const icons: Record<string, string> = {
    Biology: "Dna",
    Physics: "Atom",
    History: "Landmark",
    Chemistry: "FlaskConical",
    Mathematics: "Calculator",
    "Computer Science": "Code2",
    Literature: "BookOpen",
    Economics: "TrendingUp",
  };

  const subjects = Array.from(subjectMap.entries()).map(([name, count]) => ({
    name,
    color: getSubjectColor(name),
    icon: icons[name] ?? "BookOpen",
    lectureCount: count,
  }));

  res.json(subjects);
});

router.get("/lectures/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [lecture] = await db.select().from(lecturesTable).where(eq(lecturesTable.id, id));
  if (!lecture) {
    res.status(404).json({ error: "Lecture not found" });
    return;
  }

  await db.update(lecturesTable).set({ viewCount: lecture.viewCount + 1 }).where(eq(lecturesTable.id, id));

  const [deck] = await db.select().from(flashcardDecksTable).where(eq(flashcardDecksTable.lectureId, id));
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.lectureId, id));

  res.json({
    ...formatLecture(lecture),
    summary: lecture.summary,
    keyPoints: lecture.keyPoints,
    flashcardDeckId: deck?.id ?? null,
    quizId: quiz?.id ?? null,
  });
});

router.patch("/lectures/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateLectureBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.subject !== undefined) {
    updates.subject = parsed.data.subject;
    updates.subjectColor = getSubjectColor(parsed.data.subject);
  }
  if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;

  const [lecture] = await db
    .update(lecturesTable)
    .set(updates)
    .where(eq(lecturesTable.id, id))
    .returning();

  if (!lecture) {
    res.status(404).json({ error: "Lecture not found" });
    return;
  }

  res.json(formatLecture(lecture));
});

router.delete("/lectures/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(lecturesTable).where(eq(lecturesTable.id, id));
  res.sendStatus(204);
});

router.get("/lectures/:id/summary", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [lecture] = await db.select().from(lecturesTable).where(eq(lecturesTable.id, id));
  if (!lecture) {
    res.status(404).json({ error: "Lecture not found" });
    return;
  }

  res.json({
    lectureId: id,
    summary: lecture.summary ?? "This lecture covers the core concepts and principles of the subject, providing a comprehensive overview of the key topics discussed in the session.",
    keyPoints: lecture.keyPoints.length > 0 ? lecture.keyPoints : [
      "Introduction to fundamental concepts",
      "Analysis of key principles and theories",
      "Practical applications and examples",
      "Summary of critical takeaways",
    ],
    concepts: [
      { term: "Core Concept", definition: "The fundamental principle underlying the subject matter" },
      { term: "Key Theory", definition: "The theoretical framework applied throughout the lecture" },
      { term: "Practical Application", definition: "Real-world implementation of the concepts discussed" },
    ],
  });
});

router.get("/lectures/:id/mindmap", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [lecture] = await db.select().from(lecturesTable).where(eq(lecturesTable.id, id));
  if (!lecture) {
    res.status(404).json({ error: "Lecture not found" });
    return;
  }

  res.json({
    lectureId: id,
    nodes: [
      { id: "root", label: lecture.title, level: 0, color: lecture.subjectColor, description: "Main topic" },
      { id: "n1", label: "Core Concepts", level: 1, color: "#6366f1", description: "Fundamental ideas" },
      { id: "n2", label: "Key Theories", level: 1, color: "#10b981", description: "Theoretical frameworks" },
      { id: "n3", label: "Applications", level: 1, color: "#f59e0b", description: "Practical uses" },
      { id: "n4", label: "Analysis", level: 1, color: "#f43f5e", description: "Critical analysis" },
      { id: "n1a", label: "Principle A", level: 2, color: "#818cf8", description: null },
      { id: "n1b", label: "Principle B", level: 2, color: "#818cf8", description: null },
      { id: "n2a", label: "Theory X", level: 2, color: "#34d399", description: null },
      { id: "n2b", label: "Theory Y", level: 2, color: "#34d399", description: null },
      { id: "n3a", label: "Example 1", level: 2, color: "#fbbf24", description: null },
      { id: "n4a", label: "Case Study", level: 2, color: "#fb7185", description: null },
    ],
    edges: [
      { from: "root", to: "n1" },
      { from: "root", to: "n2" },
      { from: "root", to: "n3" },
      { from: "root", to: "n4" },
      { from: "n1", to: "n1a" },
      { from: "n1", to: "n1b" },
      { from: "n2", to: "n2a" },
      { from: "n2", to: "n2b" },
      { from: "n3", to: "n3a" },
      { from: "n4", to: "n4a" },
    ],
  });
});

export default router;
