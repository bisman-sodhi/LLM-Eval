// import { experimentsTable } from '@/db/schema';
// import { db } from '@/db';

// export async function insertExperiment(systemPrompt: string, testQuestion: string, expectedAnswer: string) {
//     try {
//         await db.insert(experimentsTable).values({ systemPrompt, testQuestion, expectedAnswer});
//         return { success: true };
//     } catch (error) {
//         console.error('Error inserting experiment:', error);
//         return { success: false, error };
//     }
// }