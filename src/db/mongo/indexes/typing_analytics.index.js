const { connection } = require('../index');

const createTypingAnalyticsIndexes = async () => {
  try {
    const collection = connection.collection('typing_analytics');
    
    // Get existing indexes
    const existingIndexes = await collection.indexes();
    const existingIndexNames = existingIndexes.map(index => index.name);

    // Define required indexes
    const requiredIndexes = [
      {
        key: { userId: 1, timestamp: -1 },
        name: 'idx_user_timestamp'
      },
      {
        key: { accuracy: 1 },
        name: 'idx_accuracy'
      },
      {
        key: { wpm: 1 },
        name: 'idx_wpm'
      },
      {
        key: { text: 'text' },
        name: 'idx_text_content'
      }
    ];

    // Create only missing indexes
    for (const index of requiredIndexes) {
      if (!existingIndexNames.includes(index.name)) {
        console.log(`Creating index: ${index.name}`);
        await collection.createIndex(index.key, { name: index.name });
      } else {
        console.log(`Index already exists: ${index.name}`);
      }
    }

    console.log('Typing analytics indexes verified successfully');
  } catch (error) {
    console.error('Error managing typing analytics indexes:', error);
    throw error;
  }
};

module.exports = {
  createTypingAnalyticsIndexes
}; 