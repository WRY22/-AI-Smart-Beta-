UPDATE `users`
SET `username` = `id`
WHERE `username` IS NULL OR trim(`username`) = '';--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `sessions_token_hash_idx`
ON `sessions` (`token_hash`);--> statement-breakpoint

CREATE TRIGGER IF NOT EXISTS `users_username_required_insert`
BEFORE INSERT ON `users`
WHEN NEW.`username` IS NULL OR trim(NEW.`username`) = ''
BEGIN
  SELECT RAISE(ABORT, 'username_required');
END;--> statement-breakpoint

CREATE TRIGGER IF NOT EXISTS `users_username_required_update`
BEFORE UPDATE OF `username` ON `users`
WHEN NEW.`username` IS NULL OR trim(NEW.`username`) = ''
BEGIN
  SELECT RAISE(ABORT, 'username_required');
END;
