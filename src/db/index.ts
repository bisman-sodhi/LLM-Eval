// import { drizzle } from 'drizzle-orm/neon-http';
// import { neon } from "@neondatabase/serverless";
// import { migrate } from 'drizzle-orm/neon-http/migrator';
// import * as dotenv from 'dotenv';

// dotenv.config();

// // const sql = neon(process.env.DATABASE_URL!);
// export const db = drizzle(neon(process.env.DATABASE_URL!));

// const main = async () => {
//     try {
//         await migrate(db, {
//             migrationsFolder: "migrations",
//         });
//         console.log("Migration complete");
//     } catch (error) {
//         console.error("Migration failed", error);
//     }
// };

// main();

