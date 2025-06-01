// Aggregate MongoDB data into PostgreSQL summaries
const updateTestStats = async (testId) => {
    const keystrokes = await getMongoCollection('keystrokes')
      .aggregate([{ $match: { testId } }]);
    
    // Store aggregated results in PostgreSQL
    await postgres.query(`
      UPDATE tests SET analytics = $1 WHERE id = $2
    `, [keystrokes, testId]);
  };