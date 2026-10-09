CREATE TABLE `league_limits` (
	`player_id` text PRIMARY KEY NOT NULL,
	`window` text NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `league_players` (
	`player_id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `league_scores` (
	`player_id` text NOT NULL,
	`day` text NOT NULL,
	`week` text NOT NULL,
	`score` integer NOT NULL,
	`turns` integer NOT NULL,
	`submitted_at` text NOT NULL,
	PRIMARY KEY(`player_id`, `day`),
	FOREIGN KEY (`player_id`) REFERENCES `league_players`(`player_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `league_week_idx` ON `league_scores` (`week`);--> statement-breakpoint
CREATE INDEX `league_day_score_idx` ON `league_scores` (`day`,`score`);