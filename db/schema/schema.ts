// lib/db/schema.ts

import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { AnnouncementPriority } from "~/db/types"; // Updated import path
import { userTable } from "./users"; // Adjust path if needed

// --- Teams ---
export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  image: text("image"),
  type: varchar("type", { length: 32 }).notNull().default("class"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeProductId: text("stripe_product_id"),
  planName: varchar("plan_name", { length: 50 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
});

// --- Team Members ---
export const teamMembers = pgTable("team_members", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// --- Activity Logs ---
export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => userTable.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

// --- Feature Flags ---
export const featureFlags = pgTable("feature_flags", {
  key: varchar("key", { length: 64 }).primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
});

// --- Invitations ---
export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  invitedBy: text("invited_by")
    .notNull()
    .references(() => userTable.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
});

// --- Invitation Codes ---
export const invitationCodes = pgTable("invitation_codes", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 20 }).notNull().unique(),
  createdBy: text("created_by")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  maxUses: integer("max_uses").default(1),
  usedCount: integer("used_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const invitationCodeUses = pgTable("invitation_code_uses", {
  id: text("id").primaryKey(),
  codeId: text("code_id")
    .notNull()
    .references(() => invitationCodes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  usedAt: timestamp("used_at").notNull().defaultNow(),
});

// --- Announcements ---
export const announcements = pgTable("announcements", {
  id: text("id").primaryKey(),
  senderId: text("sender_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  priority: text("priority", {
    enum: Object.values(AnnouncementPriority) as [string, ...string[]],
  })
    .notNull()
    .default(AnnouncementPriority.NORMAL), // Add priority column
  createdAt: timestamp("created_at").notNull().defaultNow(),
  type: text("type").notNull().default("plain"),
});

export const announcementRecipients = pgTable("announcement_recipients", {
  id: text("id").primaryKey(),
  announcementId: text("announcement_id")
    .notNull()
    .references(() => announcements.id, { onDelete: "cascade" }),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
});

// --- Announcement User Status ---
export const announcementUserStatus = pgTable("announcement_user_status", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  announcementId: text("announcement_id")
    .notNull()
    .references(() => announcements.id, { onDelete: "cascade" }),
  isReceived: boolean("is_received").notNull().default(false),
  isFavorited: boolean("is_favorited").notNull().default(false),
  receivedAt: timestamp("received_at"),
  favoritedAt: timestamp("favorited_at"),
});

// --- Courses ---
export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"), // markdown
  modules: text("modules"), // JSON stringified array of modules/lessons
  media: text("media"), // JSON stringified array of media URLs/objects
  tags: text("tags"), // JSON stringified array of tags
  authorId: text("author_id")
    .notNull()
    .references(() => userTable.id),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Subject Table ---
export const subjectTable = pgTable("subject", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Teacher Table ---
export const teacherTable = pgTable("teacher", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => userTable.id, { onDelete: "cascade" }),
  department: text("department"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// --- Student Table ---
export const studentTable = pgTable("student", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => userTable.id, { onDelete: "cascade" }),
  studentNumber: text("student_number"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// --- Admin Table ---
export const adminTable = pgTable("admin", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => userTable.id, { onDelete: "cascade" }),
  permissions: text("permissions"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// --- Class Table ---
export const classTable = pgTable("class", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  schedule: text("schedule"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Class-Teacher Join Table ---
export const classTeachers = pgTable("class_teachers", {
  id: text("id").primaryKey(),
  classId: text("class_id")
    .notNull()
    .references(() => classTable.id, { onDelete: "cascade" }),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => teacherTable.id, { onDelete: "cascade" }),
});

// --- Class-Subject Join Table ---
export const classSubjects = pgTable("class_subjects", {
  id: text("id").primaryKey(),
  classId: text("class_id")
    .notNull()
    .references(() => classTable.id, { onDelete: "cascade" }),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjectTable.id, { onDelete: "cascade" }),
});

// --- Team Invite Codes ---
import { nanoid } from "nanoid";
export const teamInviteCodes = pgTable("team_invite_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  code: varchar("code", { length: 6 }).notNull().unique(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  maxUses: integer("max_uses").notNull(),
  uses: integer("uses").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- RELATIONS ---

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  invitationCodes: many(invitationCodes),
  teamInviteCodes: many(teamInviteCodes),
  announcementRecipients: many(announcementRecipients),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(userTable, {
    fields: [teamMembers.userId],
    references: [userTable.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(userTable, {
    fields: [activityLogs.userId],
    references: [userTable.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(userTable, {
    fields: [invitations.invitedBy],
    references: [userTable.id],
  }),
}));

export const invitationCodesRelations = relations(
  invitationCodes,
  ({ one, many }) => ({


    team: one(teams, {
      fields: [invitationCodes.teamId],
      references: [teams.id],
    }),
    createdBy: one(userTable, {
      fields: [invitationCodes.createdBy],
      references: [userTable.id],
    }),
    uses: many(invitationCodeUses),
  }),
);

export const invitationCodeUsesRelations = relations(
  invitationCodeUses,
  ({ one }) => ({
    code: one(invitationCodes, {
      fields: [invitationCodeUses.codeId],
      references: [invitationCodes.id],
    }),
    user: one(userTable, {
      fields: [invitationCodeUses.userId],
      references: [userTable.id],
    }),
  }),
);

// --- Team Invite Codes Relations ---
export const teamInviteCodesRelations = relations(teamInviteCodes, ({ one }) => ({
  team: one(teams, {
    fields: [teamInviteCodes.teamId],
    references: [teams.id],
  }),
  creator: one(userTable, {
    fields: [teamInviteCodes.createdBy],
    references: [userTable.id],
  }),
}));

export const announcementsRelations = relations(
  announcements,
  ({ one, many }) => ({
    sender: one(userTable, {
      fields: [announcements.senderId],
      references: [userTable.id],
    }),
    recipients: many(announcementRecipients),
  }),
);

export const announcementRecipientsRelations = relations(
  announcementRecipients,
  ({ one }) => ({
    announcement: one(announcements, {
      fields: [announcementRecipients.announcementId],
      references: [announcements.id],
    }),
    team: one(teams, {
      fields: [announcementRecipients.teamId],
      references: [teams.id],
    }),
  }),
);

export const coursesRelations = relations(courses, ({ one }) => ({
  author: one(userTable, {
    fields: [courses.authorId],
    references: [userTable.id],
  }),
}));

export const teacherTableRelations = relations(
  teacherTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [teacherTable.userId],
      references: [userTable.id],
    }),
    classes: many(classTeachers),
  }),
);

export const studentTableRelations = relations(studentTable, ({ one }) => ({
  user: one(userTable, {
    fields: [studentTable.userId],
    references: [userTable.id],
  }),
}));

export const adminTableRelations = relations(adminTable, ({ one }) => ({
  user: one(userTable, {
    fields: [adminTable.userId],
    references: [userTable.id],
  }),
}));

export const subjectTableRelations = relations(subjectTable, ({ many }) => ({
  classes: many(classSubjects),
}));

export const classTableRelations = relations(classTable, ({ many }) => ({
  teachers: many(classTeachers),
  subjects: many(classSubjects),
}));

export const classTeachersRelations = relations(classTeachers, ({ one }) => ({
  class: one(classTable, {
    fields: [classTeachers.classId],
    references: [classTable.id],
  }),
  teacher: one(teacherTable, {
    fields: [classTeachers.teacherId],
    references: [teacherTable.id],
  }),
}));

export const classSubjectsRelations = relations(classSubjects, ({ one }) => ({
  class: one(classTable, {
    fields: [classSubjects.classId],
    references: [classTable.id],
  }),
  subject: one(subjectTable, {
    fields: [classSubjects.subjectId],
    references: [subjectTable.id],
  }),
}));

// --- TYPES & ENUMS (add as needed) ---

export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  CREATE_TEAM = "CREATE_TEAM",
  REMOVE_TEAM_MEMBER = "REMOVE_TEAM_MEMBER",
  INVITE_TEAM_MEMBER = "INVITE_TEAM_MEMBER",
  ACCEPT_INVITATION = "ACCEPT_INVITATION",
  GENERATE_INVITATION_CODE = "GENERATE_INVITATION_CODE",
  JOIN_TEAM_WITH_CODE = "JOIN_TEAM_WITH_CODE",
  SEND_ANNOUNCEMENT = "SEND_ANNOUNCEMENT",
}
