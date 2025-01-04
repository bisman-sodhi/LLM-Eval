// src/seed.ts

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { experimentsTable, scoreData, speedData } from './schema';
import { config } from 'dotenv';

config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  await db.insert(experimentsTable).values([
    {
      systemPrompt: "You are a helpful assistant.",
      testQuestion: "What is the capital of France?",
      expectedAnswer: "Paris",
    },
  ]);
  await db.insert(speedData).values([
    {
      llamaSpeed: 0,
      gemmaSpeed: 0,
      mistralSpeed: 0,
    },
  ]);
  await db.insert(scoreData).values([
    {
      llamaScore: 0,
      gemmaScore: 0,
      mistralScore: 0,
    },
  ]);

}

async function main() {
  try {
    await seed();
    console.log('Seeding completed');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}
main();