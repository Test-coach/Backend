import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');

let db;
export const connectMongo = async () => {
  try {
    await client.connect();
    db = client.db(process.env.MONGO_DB || 'typing_analytics');
    console.log('MongoDB connected successfully');
    return db;
  } catch (err) {
    console.error('MongoDB connection failed', err);
    process.exit(1);
  }
};

export const getMongoCollection = (name) => db.collection(name);