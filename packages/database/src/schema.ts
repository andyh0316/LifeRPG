import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  integer,
  pgEnum,
  text,
  timestamp,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

// ============================================================================
// Shared
// ============================================================================

const auditColumns = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdByUserId: integer('created_by_user_id').references(
    (): AnyPgColumn => users.id,
  ),
  updatedByUserId: integer('updated_by_user_id').references(
    (): AnyPgColumn => users.id,
  ),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
};

// ============================================================================
// Users
// ============================================================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  character: one(userCharacter, {
    fields: [users.id],
    references: [userCharacter.userId],
  }),
  tasks: many(tasks),
  taskCompletions: many(taskCompletions),
  rewardRedemptions: many(rewardRedemptions),
}));

/** Stores RPG progression state for a user (1:1 with users). */
export const userCharacter = pgTable('user_character', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  coins: integer('coins').notNull().default(0),
  dailyXpTarget: integer('daily_xp_target'),
  weeklyXpTarget: integer('weekly_xp_target'),
});

export const userCharacterRelations = relations(userCharacter, ({ one }) => ({
  user: one(users, {
    fields: [userCharacter.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Auth
// ============================================================================

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Tasks
// ============================================================================

export const amountUnitEnum = pgEnum('amount_unit', ['minutes']);

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  amountUnit: amountUnitEnum('amount_unit'),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  blocks: many(taskBlocks),
  completions: many(taskCompletions),
}));

export const taskBlocks = pgTable('task_blocks', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id),
  amount: integer('amount'), // e.g. 30, 60, 2
  xpReward: integer('xp_reward').notNull().default(0),
  coinReward: integer('coin_reward').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const taskBlocksRelations = relations(taskBlocks, ({ one }) => ({
  task: one(tasks, {
    fields: [taskBlocks.taskId],
    references: [tasks.id],
  }),
}));

export const taskCompletions = pgTable('task_completions', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id),
  amount: integer('amount'),
  xpEarned: integer('xp_earned').notNull(),
  coinsEarned: integer('coins_earned').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const taskCompletionsRelations = relations(
  taskCompletions,
  ({ one }) => ({
    user: one(users, {
      fields: [taskCompletions.userId],
      references: [users.id],
    }),
    task: one(tasks, {
      fields: [taskCompletions.taskId],
      references: [tasks.id],
    }),
  }),
);

// ============================================================================
// Rewards
// ============================================================================

export const rewards = pgTable('rewards', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  coinCost: integer('coin_cost').notNull(),
  icon: varchar('icon', { length: 50 }),
});

export const rewardsRelations = relations(rewards, ({ many }) => ({
  redemptions: many(rewardRedemptions),
}));

export const rewardRedemptions = pgTable('reward_redemptions', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  rewardId: integer('reward_id')
    .notNull()
    .references(() => rewards.id),
  coinsSpent: integer('coins_spent').notNull(),
  redeemedAt: timestamp('redeemed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rewardRedemptionsRelations = relations(
  rewardRedemptions,
  ({ one }) => ({
    user: one(users, {
      fields: [rewardRedemptions.userId],
      references: [users.id],
    }),
    reward: one(rewards, {
      fields: [rewardRedemptions.rewardId],
      references: [rewards.id],
    }),
  }),
);
