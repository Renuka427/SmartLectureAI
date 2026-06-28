import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lecturesTable = pgTable("lectures", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  subjectColor: text("subject_color").notNull().default("#6366f1"),
  duration: integer("duration").notNull().default(0),
  status: text("status").notNull().default("ready"),
  transcript: text("transcript"),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array().notNull().default([]),
  viewCount: integer("view_count").notNull().default(0),
  summary: text("summary"),
  keyPoints: text("key_points").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLectureSchema = createInsertSchema(lecturesTable).omit({ id: true, createdAt: true });
export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type Lecture = typeof lecturesTable.$inferSelect;
