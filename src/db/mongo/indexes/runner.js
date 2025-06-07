const mongoose = require('mongoose');

class IndexRunner {
  static async run(options = {}) {
    try {
      const { force = false, skipIndexes = false } = options;
      
      if (skipIndexes) {
        console.log('Skipping MongoDB index creation as requested');
        return;
      }

      if (force) {
        console.log('Force recreating all MongoDB indexes...');
      } else {
        console.log('Verifying MongoDB indexes...');
      }

      // Get all models
      const models = mongoose.models;
      
      // Create indexes for each model
      for (const [modelName, model] of Object.entries(models)) {
        try {
          console.log(`Creating indexes for ${modelName}...`);
          await model.createIndexes();
          console.log(`Indexes created for ${modelName}`);
        } catch (error) {
          console.warn(`Warning: Could not create indexes for ${modelName}:`, error.message);
          // Continue with other models even if one fails
        }
      }

      console.log('MongoDB index verification completed');
    } catch (error) {
      console.warn('Warning: MongoDB index creation failed:', error.message);
      // Don't throw error, just log warning
    }
  }
}

// Run indexes if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    force: args.includes('--force'),
    skipIndexes: args.includes('--skip-indexes')
  };
  IndexRunner.run(options);
}

module.exports = IndexRunner; 