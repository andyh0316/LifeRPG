import {
  pgTable,
  uuid,
  serial,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

const auditColumns = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
  createdByUserId: uuid('created_by_user_id'),
  updatedByUserId: uuid('updated_by_user_id'),
};

export const genders = pgTable('genders', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  ...auditColumns,
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  genderId: integer('gender_id').references(() => genders.id),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  ...auditColumns,
});

export const earnings = pgTable('earnings', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ...auditColumns,
});
