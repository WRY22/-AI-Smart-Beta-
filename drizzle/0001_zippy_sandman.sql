ALTER TABLE `portfolio_runs` ADD `name` text;--> statement-breakpoint
ALTER TABLE `portfolio_runs` ADD `is_saved` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `portfolio_runs` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `portfolio_runs` ADD `expires_at` text;--> statement-breakpoint
ALTER TABLE `portfolio_runs` ADD `client_request_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `username` text;--> statement-breakpoint
UPDATE `users` SET `username` = `id` WHERE `username` IS NULL OR trim(`username`) = '';--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
