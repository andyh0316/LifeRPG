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

export const usersRelations = relations(users, ({ many }) => ({
  characters: many(userCharacter),
}));

/** Stores RPG progression state for a user (many per user). */
export const userCharacter = pgTable('user_character', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 255 }).notNull().default(''),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  coins: integer('coins').notNull().default(0),
});

export const userCharacterRelations = relations(
  userCharacter,
  ({ one, many }) => ({
    user: one(users, {
      fields: [userCharacter.userId],
      references: [users.id],
    }),
    settings: one(userCharacterSettings, {
      fields: [userCharacter.id],
      references: [userCharacterSettings.userCharacterId],
    }),
    tasks: many(tasks),
    taskCompletions: many(taskCompletions),
    items: many(items),
    shopListings: many(shopListings),
    inventoryItems: many(inventoryItems),
  }),
);

// ============================================================================
// User Character Settings
// ============================================================================

export const userCharacterSettings = pgTable('user_character_settings', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userCharacterId: integer('user_character_id')
    .notNull()
    .unique()
    .references(() => userCharacter.id),
  dailyXpTarget: integer('daily_xp_target'),
  weeklyXpTarget: integer('weekly_xp_target'),
  monthlyXpTarget: integer('monthly_xp_target'),
  quarterlyXpTarget: integer('quarterly_xp_target'),
  yearlyXpTarget: integer('yearly_xp_target'),
});

export const userCharacterSettingsRelations = relations(
  userCharacterSettings,
  ({ one }) => ({
    character: one(userCharacter, {
      fields: [userCharacterSettings.userCharacterId],
      references: [userCharacter.id],
    }),
  }),
);

// ============================================================================
// Auth
// ============================================================================

export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  selectedCharacterId: integer('selected_character_id').references(
    () => userCharacter.id,
  ),
});

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Tasks
// ============================================================================

export const amountUnitEnum = pgEnum('amount_unit', ['count', 'minutes']);
export const goalPeriodEnum = pgEnum('goal_period', [
  'day-long',
  'week-long',
  'month-long',
]);

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userCharacterId: integer('user_character_id')
    .notNull()
    .references(() => userCharacter.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  amountUnit: amountUnitEnum('amount_unit').notNull().default('count'),
  goalAmount: integer('goal_amount'),
  goalPeriod: goalPeriodEnum('goal_period'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  character: one(userCharacter, {
    fields: [tasks.userCharacterId],
    references: [userCharacter.id],
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
  amount: integer('amount').notNull().default(1),
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
  userCharacterId: integer('user_character_id')
    .notNull()
    .references(() => userCharacter.id),
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
    character: one(userCharacter, {
      fields: [taskCompletions.userCharacterId],
      references: [userCharacter.id],
    }),
    task: one(tasks, {
      fields: [taskCompletions.taskId],
      references: [tasks.id],
    }),
  }),
);

// ============================================================================
// Items
// ============================================================================

export const itemSourceEnum = pgEnum('item_source', [
  'shop',
  'drop',
  'achievement',
  'gift',
]);

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userCharacterId: integer('user_character_id')
    .notNull()
    .references(() => userCharacter.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  amount: integer('amount').notNull().default(1),
  amountUnit: amountUnitEnum('amount_unit').notNull().default('count'),
});

export const itemsRelations = relations(items, ({ one, many }) => ({
  character: one(userCharacter, {
    fields: [items.userCharacterId],
    references: [userCharacter.id],
  }),
  shopListing: one(shopListings, {
    fields: [items.id],
    references: [shopListings.itemId],
  }),
  inventoryItems: many(inventoryItems),
}));

// ============================================================================
// Shop Listings
// ============================================================================

export const shopListings = pgTable('shop_listings', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userCharacterId: integer('user_character_id')
    .notNull()
    .references(() => userCharacter.id),
  itemId: integer('item_id')
    .notNull()
    .references(() => items.id),
  coinCost: integer('coin_cost').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const shopListingsRelations = relations(shopListings, ({ one }) => ({
  character: one(userCharacter, {
    fields: [shopListings.userCharacterId],
    references: [userCharacter.id],
  }),
  item: one(items, {
    fields: [shopListings.itemId],
    references: [items.id],
  }),
}));

// ============================================================================
// Inventory Items
// ============================================================================

export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  ...auditColumns,
  userCharacterId: integer('user_character_id')
    .notNull()
    .references(() => userCharacter.id),
  itemId: integer('item_id')
    .notNull()
    .references(() => items.id),
  source: itemSourceEnum('source').notNull().default('shop'),
  acquiredAt: timestamp('acquired_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  usedAt: timestamp('used_at', { withTimezone: true }),
});

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  character: one(userCharacter, {
    fields: [inventoryItems.userCharacterId],
    references: [userCharacter.id],
  }),
  item: one(items, {
    fields: [inventoryItems.itemId],
    references: [items.id],
  }),
}));
