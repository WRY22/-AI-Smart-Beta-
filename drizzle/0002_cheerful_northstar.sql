CREATE UNIQUE INDEX `portfolio_runs_user_client_request_unique` ON `portfolio_runs` (`user_id`,`client_request_id`);--> statement-breakpoint
CREATE INDEX `portfolio_runs_user_saved_created_idx` ON `portfolio_runs` (`user_id`,`is_saved`,`created_at`);--> statement-breakpoint
CREATE INDEX `portfolio_runs_user_expires_idx` ON `portfolio_runs` (`user_id`,`expires_at`);