const mongoose = require('mongoose');
const { mongoConfig } = require('../../config/database.config');


mongoose.connect(mongoConfig.uri, mongoConfig.options);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Connected to MongoDB database');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(-1);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
    await db.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

module.exports = {
    connection: db,
    mongoose
};