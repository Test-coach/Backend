import { MongoClient } from 'mongodb';
import { serverConfig } from '../config/server.config.js';

const mongoConfig = {
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
  dbName: process.env.MONGO_DB || 'typing_analytics'
};

const client = new MongoClient(mongoConfig.uri);

let db;
export const connectMongo = async () => {
  try {
    await client.connect();
    db = client.db(mongoConfig.dbName);
    console.log(`MongoDB connected successfully in ${serverConfig.env} mode`);
    return db;
  } catch (err) {
    console.error('MongoDB connection failed', err);
    process.exit(1);
  }
};

export const getMongoCollection = (name) => db.collection(name);

export const closeMongoConnection = async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB connection', err);
  }
};