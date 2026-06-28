import { Router, type IRouter } from "express";
import { db, achievementsTable, userAchievementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const DEFAULT_USER_ID = 1;

router.get("/achievements", async (req, res): Promise<void> => {
  const achievements = await db.select().from(achievementsTable);
  const userAchievements = await db
    .select()
    .from(userAchievementsTable)
    .where(eq(userAchievementsTable.userId, DEFAULT_USER_ID));

  const userMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

  const result = achievements.map((a) => {
    const ua = userMap.get(a.id);
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      category: a.category,
      xpReward: a.xpReward,
      unlocked: ua?.unlocked ?? false,
      unlockedAt: ua?.unlockedAt ?? null,
      progress: ua?.progress ?? 0,
      progressMax: a.progressMax,
    };
  });

  res.json(result);
});

export default router;
