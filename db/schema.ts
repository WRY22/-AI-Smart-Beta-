import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    username: text("username"),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email), uniqueIndex("users_username_unique").on(table.username)],
);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const candidateStocks = sqliteTable(
  "candidate_stocks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    ticker: text("ticker").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("candidate_user_ticker_unique").on(table.userId, table.ticker)],
);

export const portfolioRuns = sqliteTable(
  "portfolio_runs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name"),
    isSaved: integer("is_saved", { mode: "boolean" }).notNull().default(true),
    portfolioType: text("portfolio_type").notNull(),
    conditions: text("conditions").notNull(),
    factorWeights: text("factor_weights").notNull(),
    allocationSettings: text("allocation_settings").notNull(),
    candidateOnly: integer("candidate_only", { mode: "boolean" }).notNull(),
    candidateTickers: text("candidate_tickers").notNull(),
    result: text("result").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
    expiresAt: text("expires_at"),
    clientRequestId: text("client_request_id"),
  },
  (table) => [
    uniqueIndex("portfolio_runs_user_client_request_unique").on(table.userId, table.clientRequestId),
    index("portfolio_runs_user_saved_created_idx").on(table.userId, table.isSaved, table.createdAt),
    index("portfolio_runs_user_expires_idx").on(table.userId, table.expiresAt),
  ],
);
