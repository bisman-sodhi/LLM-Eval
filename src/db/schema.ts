import { integer, pgTable, serial, text, timestamp, real } from 'drizzle-orm/pg-core';

export const experimentsTable = pgTable('experiments_table', {
  id: serial('id').primaryKey(),
  systemPrompt: text('system_prompt').notNull(),
  testQuestion: text('test_question').notNull(),
  expectedAnswer: text('expected_answer').notNull(),
});

export const scoreData = pgTable('score_table', {
    id: serial('id').primaryKey(),
    llamaScore: real('llama_score').notNull(),
    gemmaScore: real('gemma_score').notNull(),
    mistralScore: real('mistral_score').notNull(),
});

export const speedData = pgTable('speed_table', {
    id: serial('id').primaryKey(),
    llamaSpeed: real('llama_speed').notNull(),
    gemmaSpeed: real('gemma_speed').notNull(),
    mistralSpeed: real('mistral_speed').notNull()
});