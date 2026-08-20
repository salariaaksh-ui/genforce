import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  bigint,
  date,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core"

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
})

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  phone: text("phone"),
  activeExamId: uuid("active_exam_id").references(() => exams.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.provider, t.providerAccountId] }) })
)

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.identifier, t.token] }) })
)

// Payments — a purchase is per-course (batch). An order records the Razorpay
// transaction; an entitlement is the resulting access grant. See
// docs/superpowers/specs/2026-08-13-razorpay-payments-design.md.
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  batchId: uuid("batch_id")
    .notNull()
    .references(() => batches.id, { onDelete: "cascade" }),
  amountInr: integer("amount_inr").notNull(), // price snapshot at order time
  currency: text("currency").notNull().default("INR"),
  razorpayOrderId: text("razorpay_order_id").notNull().unique(),
  razorpayPaymentId: text("razorpay_payment_id"),
  status: text("status").notNull().default("created"), // created | paid | failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
})

export const entitlements = pgTable(
  "entitlements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    source: text("source").notNull().default("purchase"), // purchase | grant
    orderId: uuid("order_id").references(() => orders.id),
    expiresAt: timestamp("expires_at"), // null = lifetime
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ userBatch: unique().on(t.userId, t.batchId) })
)

export const batches = pgTable(
  "batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    cycle: text("cycle"),
    thumbnail: text("thumbnail"),
    description: text("description"),
    priceInr: integer("price_inr"),
    accessDays: integer("access_days"), // null = lifetime access on purchase
    sort: integer("sort").default(0).notNull(),
  },
  (t) => ({ examName: unique().on(t.examId, t.name) })
)

export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    teacher: text("teacher"),
    coverImage: text("cover_image"),
    sort: integer("sort").default(0).notNull(),
  },
  (t) => ({ batchName: unique().on(t.batchId, t.name) })
)

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    idx: integer("idx").notNull(),
    title: text("title").notNull(),
    source: text("source").notNull(), // bunny | zoom | vimeo | youtube
    playToken: text("play_token"),
    playUrl: text("play_url"),
    durationSec: integer("duration_sec"),
    recordedOn: date("recorded_on"),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
  },
  (t) => ({ subjIdx: unique().on(t.subjectId, t.idx) })
)

export const pdfs = pgTable(
  "pdfs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    url: text("url").notNull(),
    fileHash: text("file_hash").notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  },
  (t) => ({ examHash: unique().on(t.examId, t.fileHash) })
)

export const galleryImages = pgTable(
  "gallery_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ examUrl: unique().on(t.examId, t.url) })
)

export const testForms = pgTable(
  "test_forms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    setName: text("set_name"),
    timeLimitMin: integer("time_limit_min"),
    formUrl: text("form_url").notNull(),
    formDate: date("form_date"),
  },
  (t) => ({ examSet: unique().on(t.examId, t.setName) })
)
