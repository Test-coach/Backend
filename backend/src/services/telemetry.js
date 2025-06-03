import { getMongoCollection } from '../db/mongo.js';
import { serverConfig } from '../config/server.config.js';

export const logKeystroke = async (sessionId, data) => {
  try {
    const collection = getMongoCollection('keystrokes');
    const result = await collection.insertOne({
      sessionId,
      timestamp: new Date(),
      environment: serverConfig.env,
      ...data
    });

    if (serverConfig.env !== 'production') {
      console.log(`Keystroke logged for session ${sessionId}:`, {
        id: result.insertedId,
        timestamp: new Date()
      });
    }

    return result;
  } catch (error) {
    console.error('Error logging keystroke:', error);
    throw error;
  }
};

export const getSessionKeystrokes = async (sessionId) => {
  try {
    const collection = getMongoCollection('keystrokes');
    return await collection
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .toArray();
  } catch (error) {
    console.error(`Error fetching keystrokes for session ${sessionId}:`, error);
    throw error;
  }
};