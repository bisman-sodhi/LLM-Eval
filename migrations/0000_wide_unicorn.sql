CREATE TABLE "experiments_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"system_prompt" text NOT NULL,
	"test_question" text NOT NULL,
	"expected_answer" text NOT NULL
);

INSERT INTO "experiments_table" ("system_prompt", "test_question", "expected_answer") VALUES ('You are a helpful assistant.', 'What is the capital of France?', 'Paris');