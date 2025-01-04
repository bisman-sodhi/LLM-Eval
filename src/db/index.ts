"use server"

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { scoreData, speedData, experimentsTable } from './schema';
config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function feedScore(
    llamaScore: number, 
    gemmaScore: number, 
    mistralScore: number, 
    conclusion: string) {
    try {
        await db.insert(scoreData).values({
            llamaScore,
            gemmaScore,
            mistralScore,
            conclusion
        });
        console.log('Score data inserted successfully');
    } catch (error) {
        console.error('Error inserting score data:', error);
        throw error;
    }
}

export async function feedSpeed(llamaSpeed: number, gemmaSpeed: number, mistralSpeed: number) {
    try {
        await db.insert(speedData).values({
            llamaSpeed,
            gemmaSpeed,
            mistralSpeed
        });
        console.log('Speed data inserted successfully');
    } catch (error) {
        console.error('Error inserting speed data:', error);
        throw error;
    }
}

export async function feedExperiment(systemPrompt: string, testQuestion: string, expectedAnswer: string) {
    try {
        await db.insert(experimentsTable).values({
            systemPrompt,
            testQuestion,
            expectedAnswer
        });
    } catch (error) {
        console.error('Error inserting experiment data:', error);
        throw error;
    }
}