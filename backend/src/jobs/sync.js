import { getMongoCollection } from '../db/mongo.js';
import { query } from '../db/postgres.js';

// Aggregate MongoDB data into PostgreSQL summaries
export const updateTestStats = async (testId) => {
  try {
    const keystrokes = await getMongoCollection('keystrokes')
      .aggregate([{ $match: { testId } }])
      .toArray();
    
    // Store aggregated results in PostgreSQL
    await query(`
      UPDATE tests 
      SET analytics = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [keystrokes, testId]);

    console.log(`Successfully synced test stats for test ID: ${testId}`);
  } catch (error) {
    console.error(`Error syncing test stats for test ID ${testId}:`, error);
    throw error;
  }
};