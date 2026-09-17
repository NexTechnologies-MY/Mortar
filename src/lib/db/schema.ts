import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

export * from './auth-schema'

/**
 * Example feature table. Copy this shape for your own tables, then run
 * `bun run db:generate` and `bun run db:migrate`.
 */
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index('notes_user_id_idx').on(table.userId)]
)

export type Note = typeof notes.$inferSelect
