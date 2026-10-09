import { integer, primaryKey, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const leaguePlayers = sqliteTable('league_players', {
  playerId: text('player_id').primaryKey(),
  nickname: text('nickname').notNull(),
  updatedAt: text('updated_at').notNull(),
});
export const leagueScores = sqliteTable('league_scores', {
  playerId: text('player_id').notNull().references(() => leaguePlayers.playerId),
  day: text('day').notNull(),
  week: text('week').notNull(),
  score: integer('score').notNull(),
  turns: integer('turns').notNull(),
  submittedAt: text('submitted_at').notNull(),
}, t => [primaryKey({columns:[t.playerId,t.day]}), index('league_week_idx').on(t.week), index('league_day_score_idx').on(t.day,t.score)]);
export const leagueLimits = sqliteTable('league_limits', {
  playerId: text('player_id').primaryKey(),
  window: text('window').notNull(),
  count: integer('count').notNull(),
});
