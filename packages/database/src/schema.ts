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

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }),
});

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

export const goalUnitEnum = pgEnum('goal_unit', ['minutes']);

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  xpReward: integer('xp_reward').notNull().default(0),
  coinReward: integer('coin_reward').notNull().default(0),
  icon: varchar('icon', { length: 50 }),
  goalUnit: goalUnitEnum('goal_unit'),
});

export const taskOptions = pgTable('task_options', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id),
  goal: integer('goal'), // e.g. 30, 60, 2
  xpReward: integer('xp_reward').notNull().default(0),
  coinReward: integer('coin_reward').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const rewards = pgTable('rewards', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  coinCost: integer('coin_cost').notNull(),
  icon: varchar('icon', { length: 50 }),
});

export const taskCompletions = pgTable('task_completions', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id),
  taskOptionId: integer('task_option_id').references(() => taskOptions.id),
  xpEarned: integer('xp_earned').notNull(),
  coinsEarned: integer('coins_earned').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

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
