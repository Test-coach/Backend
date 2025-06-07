const { getMongoCollection } = require('../db/mongo');
const { serverConfig } = require('../config/server.config');

const logKeystroke = async (sessionId, data) => {
  try {
    const keystrokes = getMongoCollection('keystrokes');
    await keystrokes.insertOne({
      sessionId,
      ...data,
      timestamp: new Date()
    });

    if (serverConfig.env !== 'production') {
      console.log(`Keystroke logged for session ${sessionId}:`, {
        key: data.key,
        speed: data.speed,
        isError: data.isError
      });
    }
  } catch (err) {
    console.error('Error logging keystroke:', err);
    throw err;
  }
};

const getSessionKeystrokes = async (sessionId) => {
  try {
    const keystrokes = getMongoCollection('keystrokes');
    return await keystrokes
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .toArray();
  } catch (err) {
    console.error('Error fetching session keystrokes:', err);
    throw err;
  }
};

module.exports = {
  logKeystroke,
  getSessionKeystrokes
};