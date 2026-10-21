import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull(),
  createdAt: integer("created_at").notNull(),
  name: text("name").notNull(),
  replyTo: text("reply_to").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
}, table => [uniqueIndex("inquiries_submission_unique").on(table.submissionId), index("inquiries_created_index").on(table.createdAt)]);
export const inquiryLimits = sqliteTable("inquiry_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
