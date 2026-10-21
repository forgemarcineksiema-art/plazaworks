CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`name` text NOT NULL,
	`reply_to` text NOT NULL,
	`topic` text NOT NULL,
	`message` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_submission_unique` ON `inquiries` (`submission_id`);--> statement-breakpoint
CREATE INDEX `inquiries_created_index` ON `inquiries` (`created_at`);--> statement-breakpoint
CREATE TABLE `inquiry_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
