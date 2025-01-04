import { integer, pgTable, serial, text, timestamp, real } from 'drizzle-orm/pg-core';

export const experimentsTable = pgTable('experiments_table', {
  id: serial('id').primaryKey(),
  systemPrompt: text('system_prompt').notNull(),
  testQuestion: text('test_question').notNull(),
  expectedAnswer: text('expected_answer').notNull(),
});

// export const analyzeData = pgTable('score_and_speed_table', {
//     id: serial('id').primaryKey(),
//     llamaResponse: text('llama_response').notNull(),
//     gemmaResponse: text('gemma_response').notNull(),
//     mistralResponse: text('mistral_response').notNull(),
//     judgeResponse: text('judge_response').notNull(),
//     executionTimes: jsonb('execution_times').notNull(),
//   });
// export type InsertExperiment = typeof experimentsTable.$inferInsert;

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
