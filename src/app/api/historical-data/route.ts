import { NextResponse } from "next/server";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { scoreData, speedData } from './../../../db/schema';

config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function GET() {
    try {
      // Test database connection
      try {
        await db.select().from(scoreData).limit(1);
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        return NextResponse.json({ 
          error: "Database connection failed",
          scores: [],
          speeds: []
        }, { status: 500 });
      }
  
      // Fetch data
      const scores = await db.select().from(scoreData).orderBy(scoreData.id);
      const speeds = await db.select().from(speedData).orderBy(speedData.id);
  
      console.log('Data fetched successfully:', { 
        scoresCount: scores.length, 
        speedsCount: speeds.length 
      });
  
      return NextResponse.json({
        scores: scores || [],
        speeds: speeds || []
      });
  
    } catch (error) {
      console.error('Error in historical-data:', error);
      return NextResponse.json({ 
        error: "Failed to fetch data",
        scores: [],
        speeds: []
      }, { status: 500 });
    }
  }