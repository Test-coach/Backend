const mongoose = require('mongoose');
const { mongoConfig } = require('../config/database.config');

async function testMongoConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoConfig.uri, {
      dbName: process.env.MONGO_DB
    });
    
    console.log('MongoDB connection successful');
    console.log('Connected to database:', process.env.MONGO_DB);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMongoConnection()
    .then(success => {
      if (success) {
        console.log('MongoDB test completed successfully');
      } else {
        console.error('MongoDB test failed');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Error during MongoDB test:', err);
      process.exit(1);
    });
}

module.exports = { testMongoConnection }; 