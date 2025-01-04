import { NextResponse } from "next/server";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { scoreData, speedData } from './../../../db/schema';
config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
interface Score {
  id: number;
  llamaScore: number;
  gemmaScore: number;
  mistralScore: number;
}

interface Speed {
  id: number;
  llamaSpeed: number;
  gemmaSpeed: number;
  mistralSpeed: number;
}

export async function GET() {
  try {
    // Test database connection
    try {
      // Simple query to test connection
      await db.select().from(scoreData).limit(1);
    } catch (dbError) {
      console.error('Database connection test failed:', dbError);
      return NextResponse.json({ 
        error: "Database connection failed", 
        details: dbError instanceof Error ? dbError.message : 'Unknown error',
        scores: [], 
        speeds: [] 
      }, { status: 500 });
    }

    // Fetch data with separate try-catch blocks
    let scores: Score[] = [];
    let speeds: Speed[] = [];

    try {
      scores = await db.select().from(scoreData);
      console.log('Scores fetched:', scores);
    } catch (scoreError) {
      console.error('Error fetching scores:', scoreError);
    }

    try {
      speeds = await db.select().from(speedData);
      console.log('Speeds fetched:', speeds);
    } catch (speedError) {
      console.error('Error fetching speeds:', speedError);
    }

    return NextResponse.json({
      scores,
      speeds
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Top level error in historical-data:', error);
    return NextResponse.json({ 
      error: "Failed to fetch historical data", 
      details: error instanceof Error ? error.message : 'Unknown error',
      scores: [], 
      speeds: [] 
    }, { 
      status: 500 
    });
  }
}