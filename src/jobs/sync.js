import { getMongoCollection } from '../db/mongo.js';
import { query } from '../db/postgres.js';
import { serverConfig } from '../config/server.config.js';

// Aggregate MongoDB data into PostgreSQL summaries
export const updateTestStats = async (testId) => {
  const startTime = Date.now();
  try {
    // Get keystroke data from MongoDB
    const keystrokes = await getMongoCollection('keystrokes')
      .aggregate([
        { $match: { testId } },
        {
          $group: {
            _id: null,
            totalKeystrokes: { $sum: 1 },
            avgSpeed: { $avg: '$speed' },
            maxSpeed: { $max: '$speed' },
            minSpeed: { $min: '$speed' },
            errors: { $sum: { $cond: [{ $eq: ['$isError', true] }, 1, 0] } },
            lastKeystroke: { $max: '$timestamp' }
          }
        }
      ])
      .toArray();

    if (!keystrokes.length) {
      throw new Error(`No keystroke data found for test ID: ${testId}`);
    }

    const stats = keystrokes[0];
    
    // Store aggregated results in PostgreSQL
    await query(`
      UPDATE tests 
      SET 
        analytics = $1,
        total_keystrokes = $2,
        avg_speed = $3,
        max_speed = $4,
        min_speed = $5,
        error_count = $6,
        last_activity = $7,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $8
    `, [
      stats,
      stats.totalKeystrokes,
      Math.round(stats.avgSpeed),
      stats.maxSpeed,
      stats.minSpeed,
      stats.errors,
      stats.lastKeystroke,
      testId
    ]);

    const duration = Date.now() - startTime;
    if (serverConfig.env !== 'production') {
      console.log(`Successfully synced test stats for test ID: ${testId}`, {
        duration: `${duration}ms`,
        stats: {
          totalKeystrokes: stats.totalKeystrokes,
          avgSpeed: Math.round(stats.avgSpeed),
          errors: stats.errors
        }
      });
    }

    return {
      success: true,
      testId,
      duration,
      stats
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Error syncing test stats for test ID ${testId}:`, {
      error: error.message,
      duration: `${duration}ms`
    });
    throw error;
  }
};

// Sync all tests that haven't been updated recently
export const syncRecentTests = async (hoursAgo = 24) => {
  try {
    const cutoffTime = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));
    
    // Get tests that need syncing
    const { rows: tests } = await query(`
      SELECT id 
      FROM tests 
      WHERE updated_at < $1 
      OR updated_at IS NULL
    `, [cutoffTime]);

    if (!tests.length) {
      console.log('No tests need syncing');
      return { synced: 0 };
    }

    // Sync each test
    const results = await Promise.allSettled(
      tests.map(test => updateTestStats(test.id))
    );

    // Count successes and failures
    const summary = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.success++;
      } else {
        acc.failed++;
        acc.errors.push(result.reason);
      }
      return acc;
    }, { success: 0, failed: 0, errors: [] });

    console.log(`Sync completed: ${summary.success} succeeded, ${summary.failed} failed`);
    return summary;
  } catch (error) {
    console.error('Error in syncRecentTests:', error);
    throw error;
  }
};