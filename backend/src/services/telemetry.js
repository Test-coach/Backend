import { getMongoCollection } from '../db/mongo';

export const logKeystroke = async (sessionId, data) => {
  const collection = getMongoCollection('keystrokes');
  await collection.insertOne({
    sessionId,
    timestamp: new Date(),
    ...data
  });
};