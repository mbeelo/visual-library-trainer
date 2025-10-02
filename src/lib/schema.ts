import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email'),
  subscriptionTier: text('subscription_tier').default('free').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const imageCollections = pgTable('image_collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  drawingSubject: text('drawing_subject').notNull(),
  imageUrl: text('image_url').notNull(),
  notes: text('notes'),
  position: integer('position').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})