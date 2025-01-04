CREATE TABLE "experiments_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"system_prompt" text NOT NULL,
	"test_question" text NOT NULL,
	"expected_answer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"llama_score" real NOT NULL,
	"gemma_score" real NOT NULL,
	"mistral_score" real NOT NULL,
	"conclusion" text DEFAULT 'No conclusion provided' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speed_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"llama_speed" real NOT NULL,
	"gemma_speed" real NOT NULL,
	"mistral_speed" real NOT NULL
);
