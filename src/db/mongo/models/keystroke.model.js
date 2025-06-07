const { Schema, model } = require('mongoose');

const keystrokeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  test: {
    type: Schema.Types.ObjectId,
    ref: 'TypingTest',
    required: true,
    index: true
  },
  character: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  isError: {
    type: Boolean,
    default: false
  },
  position: {
    type: Number,
    required: true
  },
  metadata: {
    device: {
      type: String
    },
    browser: {
      type: String
    },
    os: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Indexes
keystrokeSchema.index({ user: 1, test: 1, timestamp: 1 });
keystrokeSchema.index({ test: 1, timestamp: 1 });

const Keystroke = model('Keystroke', keystrokeSchema);

module.exports = Keystroke; 